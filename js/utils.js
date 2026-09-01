// Utilidades compartilhadas entre script.js, battle.js e quiz.js.
// Ficam num arquivo à parte porque todos os <script> da página são scripts
// clássicos (não módulos) e dividem o mesmo escopo global — declarar a
// mesma função em dois arquivos causaria um erro de "já declarado".

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const capitalize = (text) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : '');

const readJSON = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        return fallback;
    }
};

const writeJSON = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // ignora erro de storage (navegação privada, storage desabilitado, etc.)
    }
};

// Busca genérica com timeout implícito do fetch e retorno null em qualquer
// falha (rede, 404, JSON inválido) — usado pelos módulos novos (detalhes,
// campanha, etc.) que só precisam do "me dá os dados ou nada".
const fetchJSON = async (url) => {
    try {
        const res = await fetch(url);
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        return null;
    }
};

const idFromUrl = (url) => Number(url.split('/').filter(Boolean).pop());

// Formata uma data ISO no padrão local (dd/mm/aaaa hh:mm), usado pelo Hall
// da Fama. Cai pro texto cru se a data vier inválida.
const formatDateTime = (isoString) => {
    try {
        return new Date(isoString).toLocaleString(currentLang === 'en' ? 'en-US' : 'pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        });
    } catch (error) {
        return isoString;
    }
};
