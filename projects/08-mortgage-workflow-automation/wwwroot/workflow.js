const messages = {
    "en": {
        "portfolio": "← Portfolio",
        "language": "Language",
        "page": "Mortgage Workflow",
        "heading": "Mortgage application",
        "loading": "Loading…",
        "advance": "Advance stage",
        "log": "Activity log",
        "failed": "Could not load the application.",
        "conflict": "The application has already moved or is complete.",
        "uncertain": "Could not confirm the update. Reload to check the current stage.",
        "Submitted": "Submitted",
        "Under review": "Under review",
        "Approved": "Approved"
    },
    "pt": {
        "portfolio": "← Portfólio",
        "language": "Idioma",
        "page": "Fluxo de financiamento imobiliário",
        "heading": "Solicitação de financiamento imobiliário",
        "loading": "Carregando…",
        "advance": "Avançar etapa",
        "log": "Histórico de atividades",
        "failed": "Não foi possível carregar a solicitação.",
        "conflict": "A solicitação já avançou de etapa ou foi concluída.",
        "uncertain": "Não foi possível confirmar a atualização. Recarregue a página para verificar a etapa atual.",
        "Submitted": "Enviada",
        "Under review": "Em análise",
        "Approved": "Aprovada"
    },
    "zh": {
        "portfolio": "← 作品集",
        "language": "语言",
        "page": "住房贷款流程",
        "heading": "住房贷款申请",
        "loading": "正在加载…",
        "advance": "进入下一阶段",
        "log": "操作记录",
        "failed": "无法加载申请。",
        "conflict": "申请已进入下一阶段或已完成。",
        "uncertain": "无法确认更新。请刷新页面查看当前阶段。",
        "Submitted": "已提交",
        "Under review": "审核中",
        "Approved": "已批准"
    }
};
const locales = { en: 'en', pt: 'pt-BR', zh: 'zh-Hans' };
const url = new URL(window.location.href);
const requested = url.searchParams.get('lang');
const language = Object.hasOwn(locales, requested) ? requested : 'en';
const copy = messages[language];
document.documentElement.lang = locales[language];
document.title = copy.page;
document.querySelectorAll('[data-label]').forEach(node => {
    node.textContent = copy[node.dataset.label];
});
const portfolio = document.querySelector('.brand');
const back = new URL(portfolio.href);
if (language !== 'en') back.searchParams.set('lang', language);
portfolio.href = back;
const languageSelect = document.querySelector('#language-select');
languageSelect.value = language;
languageSelect.addEventListener('change', () => {
    if (languageSelect.value === 'en') url.searchParams.delete('lang');
    else url.searchParams.set('lang', languageSelect.value);
    window.location.assign(url.href);
});

const button = document.querySelector('button');
const status = document.querySelector('#status');
const error = document.querySelector('#error');
const log = document.querySelector('ol');
let stage;

async function refresh() {
    const response = await fetch('/api/application');
    if (!response.ok) throw new Error(copy.failed);
    const data = await response.json();
    stage = data.stage;
    status.textContent = `${data.id} · ${copy[data.status] ?? data.status}`;
    log.replaceChildren(...data.activity.map(event => {
        const item = document.createElement('li');
        item.textContent = `${copy[event.status] ?? event.status} · ${new Date(event.timestampUtc).toLocaleString(locales[language])}`;
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
        if (!response.ok) error.textContent = response.status === 409 ? copy.conflict : copy.uncertain;
        await refresh();
    } catch {
        error.textContent = copy.uncertain;
    }
});
refresh().catch(failure => { status.textContent = failure.message; });
