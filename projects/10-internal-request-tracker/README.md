# Internal Request Tracker

Record internal requests and search their history through a PHP interface backed by SQLite.

## Career context

At CEFPPBC, I developed administrative systems with PHP and MySQL. This request tracker applies that experience to an internal workflow and uses SQLite for local setup.

## Run the demo

Use PHP 8.1 or later with PDO SQLite. Run `php -S localhost:8080 -t public` from this directory and visit `http://localhost:8080`. First launch creates `requests.sqlite` from the [sample schema](schema.sql). Add a request, then search by its title or description.
