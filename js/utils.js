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
