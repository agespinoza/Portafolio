<?php
declare(strict_types=1);

session_start();
$_SESSION['token'] ??= bin2hex(random_bytes(32));
$db = new PDO('sqlite:' . dirname(__DIR__) . '/requests.sqlite');
$db->exec('PRAGMA busy_timeout = 5000');
$db->exec(file_get_contents(dirname(__DIR__) . '/schema.sql'));

function input(array $source, string $field): string {
    $value = $source[$field] ?? '';
    return is_string($value) ? trim($value) : '';
}

function escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = input($_POST, 'title');
    $description = input($_POST, 'description');
    if (!hash_equals($_SESSION['token'], input($_POST, 'token'))) {
        http_response_code(403);
        $error = 'Reload the page and try again.';
    } elseif ($title === '' || $description === '' ||
              preg_match('/^.{1,100}$/us', $title) !== 1 ||
              preg_match('/^.{1,500}$/us', $description) !== 1) {
        http_response_code(422);
        $error = 'Enter a title up to 100 characters and a description up to 500 characters.';
    } else {
        $insert = $db->prepare('INSERT INTO requests(title, description) VALUES (?, ?)');
        $insert->execute([$title, $description]);
        header('Location: /', true, 303);
        exit;
    }
}

$query = input($_GET, 'q');
$search = $db->prepare('SELECT * FROM requests
    WHERE instr(lower(title), lower(?)) > 0 OR instr(lower(description), lower(?)) > 0
    ORDER BY id DESC');
$search->execute([$query, $query]);
$requests = $search->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Internal Request Tracker</title>
<style>
body{font:1rem system-ui;color:#14263a;background:#f1f5f9;max-width:48rem;margin:3rem auto;padding:0 1rem}
section,article{background:white;padding:1.25rem;margin:1rem 0;border-radius:.6rem}
input,textarea,button{font:inherit;padding:.45rem;margin:.25rem 0;max-width:95%}
label{display:block}button{background:#195373;color:white;border:0;border-radius:.3rem}
</style>
<h1>Internal requests</h1>
<section>
<h2>New request</h2>
<?php if ($error !== ''): ?><p role="alert"><?= escape($error) ?></p><?php endif; ?>
<form method="post">
<input type="hidden" name="token" value="<?= escape($_SESSION['token']) ?>">
<label for="title">Title</label>
<input id="title" name="title" required maxlength="100" value="<?= escape($title ?? '') ?>">
<label for="description">Description</label>
<textarea id="description" name="description" required maxlength="500"><?= escape($description ?? '') ?></textarea><br>
<button>Record request</button>
</form>
</section>
<section>
<h2>Request history</h2>
<form method="get">
<label for="q">Search by title or description</label>
<input id="q" name="q" value="<?= escape($query) ?>">
<button>Search</button>
</form>
<?php if (!$requests): ?><p>No matching requests.</p><?php endif; ?>
<?php foreach ($requests as $request): ?>
<article>
<h3><?= escape($request['title']) ?></h3>
<p><?= escape($request['description']) ?></p>
<small>Request <?= (int) $request['id'] ?> · <?= escape($request['created_at']) ?> UTC</small>
</article>
<?php endforeach; ?>
</section>
</html>
