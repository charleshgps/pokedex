// Service Worker: cacheia o "esqueleto" do app (HTML/CSS/JS/ícones) pra
// abrir instantaneamente e funcionar offline, e guarda em cache separado
// as respostas da PokeAPI/sprites/cries conforme vão sendo usadas — assim
// Pokémon já vistos continuam acessíveis sem internet.
//
// Bump a versão do cache (vX) sempre que a lista de arquivos do app mudar,
// pra forçar os clientes antigos a buscar tudo de novo.
const SHELL_CACHE = 'pokedex-shell-v1';
const DATA_CACHE = 'pokedex-data-v1';

const SHELL_FILES = [
    './',
    './index.html',
    './manifest.json',
    './css/styles.css',
    './css/media.css',
    './css/theme.css',
    './css/screens.css',
    './css/details.css',
    './css/battle.css',
    './css/quiz.css',
    './css/achievements.css',
    './css/hall-of-fame.css',
    './js/utils.js',
    './js/i18n.js',
    './js/type-colors.js',
    './js/pokemon-filters.js',
    './js/achievements.js',
    './js/theme.js',
    './js/script.js',
    './js/pokemon-details.js',
    './js/battle.js',
    './js/campaign.js',
    './js/hall-of-fame.js',
    './js/quiz.js',
    './js/navigation.js',
    './js/pwa-register.js',
    './favicons/favicon-16x16.png',
    './images/pokedex.png',
    './images/icons8-error-96.png',
    './images/icons/icon-192.png',
    './images/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(SHELL_CACHE)
            .then((cache) => cache.addAll(SHELL_FILES))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE)
                    .map((key) => caches.delete(key)),
            ))
            .then(() => self.clients.claim()),
    );
});

const isSameOrigin = (url) => url.origin === self.location.origin;

// App shell: cache primeiro (rápido e funciona offline), atualiza em
// segundo plano quando a rede está disponível.
const handleShellRequest = async (request) => {
    const cached = await caches.match(request);
    const networkFetch = fetch(request).then((response) => {
        if (response && response.ok) {
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
    }).catch(() => null);

    return cached || networkFetch || fetch(request);
};

// Dados externos (PokeAPI, sprites, cries): tenta a rede primeiro (dado
// sempre fresco), cai pro cache se estiver offline ou a API falhar.
const handleDataRequest = async (request) => {
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            const cache = await caches.open(DATA_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request, { cacheName: DATA_CACHE });
        if (cached) return cached;
        throw error;
    }
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (isSameOrigin(url)) {
        event.respondWith(handleShellRequest(request));
    } else {
        event.respondWith(handleDataRequest(request));
    }
});
