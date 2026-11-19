const button = document.querySelector('button');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
const log = document.querySelector('ol');
let stage;

async function refresh() {
    const response = await fetch('/api/application');
    if (!response.ok) throw new Error('Could not load the application.');
    const data = await response.json();
    stage = data.stage;
    status.textContent = `${data.id} · ${data.status}`;
    log.replaceChildren(...data.activity.map(event => {
        const item = document.createElement('li');
        item.textContent = `${event.status} · ${new Date(event.timestampUtc).toLocaleString()}`;
        return item;
    }));
    button.disabled = data.status === 'Approved';
}

button.addEventListener('click', async () => {
    button.disabled = true;
    error.textContent = '';
    try {
        const response = await fetch('/api/application/advance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expectedStage: stage })
        });
        if (!response.ok) error.textContent = (await response.json()).error;
        await refresh();
    } catch {
        error.textContent = 'Could not confirm the update. Reload to check the current stage.';
    }
});
refresh().catch(failure => { status.textContent = failure.message; });
