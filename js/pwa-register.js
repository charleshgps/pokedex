// Registra o service worker (sw.js), que permite instalar o app e usar a
// Pokédex mesmo offline pra tudo que já foi visitado antes. Só funciona
// servido por HTTPS (ou localhost) — em file:// o registro falha e a
// promise é silenciosamente ignorada.

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
            // ambiente sem suporte (file://, http sem TLS, etc.) — segue sem PWA
        });
    });
}
