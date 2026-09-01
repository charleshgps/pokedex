// Painel de detalhes extras da tela da Pokédex: favoritos, descrição
// (Pokédex entry), fraquezas/resistências de tipo e cadeia evolutiva.
// script.js chama renderPokemonDetails(data) sempre que um Pokémon carrega
// com sucesso (e clearPokemonDetails() quando dá "not found").

const FAVORITES_KEY = 'pokedexFavorites';
let favorites = readJSON(FAVORITES_KEY, []); // [{ id, name, sprite }]

const btnFavorite = document.getElementById('btnFavorite');
const pokemonDescriptionEl = document.getElementById('pokemonDescription');
const extraTabs = document.querySelectorAll('.extra-tab');
const extraPanels = {
    about: document.getElementById('extraPanelAbout'),
    weaknesses: document.getElementById('extraPanelWeaknesses'),
    evolution: document.getElementById('extraPanelEvolution'),
    favorites: document.getElementById('extraPanelFavorites'),
};

const RAW_SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

const isFavorite = (id) => favorites.some((fav) => fav.id === id);

const setFavoriteButtonState = (data) => {
    if (!btnFavorite) return;
    const fav = !!data && isFavorite(data.id);
    btnFavorite.textContent = fav ? '★' : '☆';
    btnFavorite.classList.toggle('is-favorite', fav);
    const key = fav ? 'pokedex.favoriteRemove' : 'pokedex.favoriteAdd';
    btnFavorite.title = t(key);
    btnFavorite.setAttribute('aria-label', t(key));
    btnFavorite.disabled = !data;
};

const renderFavoritesPanel = () => {
    const panel = extraPanels.favorites;
    if (!panel) return;
    if (favorites.length === 0) {
        panel.innerHTML = `<p class="extra-empty">${t('pokedex.favoritesEmpty')}</p>`;
        return;
    }
    panel.innerHTML = `<div class="favorites-grid">${favorites.map((fav) => `
        <button type="button" class="favorite-item" data-id="${fav.id}" title="${capitalize(fav.name)}">
            <img src="${fav.sprite || ''}" alt="${fav.name}">
            <span>#${fav.id} ${capitalize(fav.name)}</span>
        </button>
    `).join('')}</div>`;
    panel.querySelectorAll('.favorite-item').forEach((btn) => {
        btn.addEventListener('click', () => renderPokemon(Number(btn.dataset.id)));
    });
};

const toggleFavorite = (data) => {
    if (!data) return;
    if (isFavorite(data.id)) {
        favorites = favorites.filter((fav) => fav.id !== data.id);
    } else {
        favorites.push({ id: data.id, name: data.name, sprite: data.sprites.front_default });
        unlockAchievement('favorite_first');
        if (favorites.length >= 10) unlockAchievement('favorite_10');
    }
    writeJSON(FAVORITES_KEY, favorites);
    setFavoriteButtonState(data);
    renderFavoritesPanel();
};

if (btnFavorite) {
    btnFavorite.addEventListener('click', () => {
        if (currentPokemonData) toggleFavorite(currentPokemonData);
    });
}

// --- Abas ---

const activateTab = (tabName) => {
    extraTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.tab === tabName));
    Object.entries(extraPanels).forEach(([name, panel]) => {
        if (panel) panel.classList.toggle('active', name === tabName);
    });
};

extraTabs.forEach((tab) => {
    tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

// --- Descrição (Pokédex entry) ---
// A PokeAPI não tem flavor text em pt-BR (só nome de golpes/espécies em
// alguns idiomas europeus/asiáticos), então a descrição sempre aparece em
// inglês — só o texto ao redor dela (título da aba, "carregando" etc.)
// acompanha o idioma escolhido.

const renderDescription = (species) => {
    if (!pokemonDescriptionEl) return;
    const entry = species && species.flavor_text_entries.find((e) => e.language.name === 'en');
    const genus = species && species.genera.find((g) => g.language.name === 'en');
    if (!entry) {
        pokemonDescriptionEl.textContent = t('pokedex.noDescription');
        return;
    }
    const cleanText = entry.flavor_text.replace(/[\n\f\r]+/g, ' ');
    pokemonDescriptionEl.innerHTML = `${genus ? `<strong>${genus.genus}</strong><br>` : ''}${cleanText}`;
};

// --- Fraquezas / resistências ---
// Pra cada tipo do Pokémon, o próprio endpoint /type já traz quem causa
// x2 (double_damage_from), x0.5 (half_damage_from) e x0 (no_damage_from)
// nele — daí só precisamos buscar 1 ou 2 tipos (não os 18) e multiplicar.

const typeDamageRelationsCache = {};
const getTypeDamageRelations = async (type) => {
    if (!typeDamageRelationsCache[type]) {
        const data = await fetchJSON(`https://pokeapi.co/api/v2/type/${type}`);
        typeDamageRelationsCache[type] = data ? data.damage_relations : null;
    }
    return typeDamageRelationsCache[type];
};

const renderWeaknesses = async (types, requestId) => {
    const panel = extraPanels.weaknesses;
    if (!panel) return;
    panel.innerHTML = `<p class="extra-empty">${t('common.loading')}</p>`;

    const multipliers = {};
    Object.keys(TYPE_COLORS).forEach((type) => { multipliers[type] = 1; });

    const relationsList = await Promise.all(types.map(getTypeDamageRelations));
    relationsList.forEach((relations) => {
        if (!relations) return;
        relations.double_damage_from.forEach((rel) => { multipliers[rel.name] *= 2; });
        relations.half_damage_from.forEach((rel) => { multipliers[rel.name] *= 0.5; });
        relations.no_damage_from.forEach((rel) => { multipliers[rel.name] *= 0; });
    });

    const group = (predicate) => Object.entries(multipliers)
        .filter(([, mult]) => predicate(mult))
        .map(([type]) => type)
        .sort((a, b) => a.localeCompare(b));

    const renderChip = (type) => `
        <span class="weakness-chip" style="background:${getTypeGradient(type)}" title="${capitalize(type)}">
            ${getTypeEnergySVG(type)}
        </span>`;

    if (requestId !== detailsRequestId) return; // um Pokémon mais novo já foi carregado

    const weak = group((mult) => mult >= 2);
    const resist = group((mult) => mult > 0 && mult < 1);
    const immune = group((mult) => mult === 0);

    if (weak.length === 0 && resist.length === 0 && immune.length === 0) {
        panel.innerHTML = `<p class="extra-empty">${t('pokedex.noWeaknesses')}</p>`;
        return;
    }

    const section = (labelKey, list) => (list.length === 0 ? '' : `
        <div class="weakness-group">
            <p class="weakness-label">${t(labelKey)}</p>
            <div class="weakness-row">${list.map(renderChip).join('')}</div>
        </div>`);

    panel.innerHTML = section('pokedex.weak', weak) + section('pokedex.resist', resist) + section('pokedex.immune', immune);
};

// --- Cadeia evolutiva ---
// Achata a árvore de evolução (que pode ramificar, ex: Eevee) em "estágios"
// renderizados lado a lado, com setas entre eles.

const flattenEvolutionChain = (node, stage, stages) => {
    if (!stages[stage]) stages[stage] = [];
    stages[stage].push(node.species);
    node.evolves_to.forEach((next) => flattenEvolutionChain(next, stage + 1, stages));
};

const renderEvolution = async (species, requestId) => {
    const panel = extraPanels.evolution;
    if (!panel) return;
    panel.innerHTML = `<p class="extra-empty">${t('common.loading')}</p>`;

    const chainData = species && await fetchJSON(species.evolution_chain.url);
    if (requestId !== detailsRequestId) return; // um Pokémon mais novo já foi carregado
    if (!chainData) {
        panel.innerHTML = `<p class="extra-empty">${t('pokedex.noEvolution')}</p>`;
        return;
    }

    const stages = {};
    flattenEvolutionChain(chainData.chain, 0, stages);
    const stageKeys = Object.keys(stages).sort((a, b) => Number(a) - Number(b));

    if (stageKeys.length <= 1) {
        panel.innerHTML = `<p class="extra-empty">${t('pokedex.noEvolution')}</p>`;
        return;
    }

    const renderNode = (sp) => {
        const id = idFromUrl(sp.url);
        return `
            <button type="button" class="evolution-node" data-id="${id}" title="${capitalize(sp.name)}">
                <img src="${RAW_SPRITE_BASE}/${id}.png" alt="${sp.name}" loading="lazy">
                <span>${capitalize(sp.name)}</span>
            </button>`;
    };

    panel.innerHTML = stageKeys.map((key, index) => `
        <div class="evolution-stage">${stages[key].map(renderNode).join('')}</div>
        ${index < stageKeys.length - 1 ? '<span class="evolution-arrow">➜</span>' : ''}
    `).join('');

    panel.querySelectorAll('.evolution-node').forEach((btn) => {
        btn.addEventListener('click', () => renderPokemon(Number(btn.dataset.id)));
    });
};

// --- Entrada principal ---

let detailsRequestId = 0;

const renderPokemonDetails = async (data) => {
    const requestId = ++detailsRequestId;
    setFavoriteButtonState(data);
    if (pokemonDescriptionEl) pokemonDescriptionEl.textContent = t('common.loading');
    if (extraPanels.evolution) extraPanels.evolution.innerHTML = `<p class="extra-empty">${t('common.loading')}</p>`;

    renderWeaknesses(data.types.map((entry) => entry.type.name), requestId);

    const species = await fetchJSON(data.species.url);
    if (requestId !== detailsRequestId) return; // um Pokémon mais novo já foi carregado

    renderDescription(species);
    renderEvolution(species, requestId);
};

const clearPokemonDetails = () => {
    detailsRequestId += 1; // invalida qualquer fetch de detalhes em andamento
    setFavoriteButtonState(null);
    if (pokemonDescriptionEl) pokemonDescriptionEl.textContent = '';
    if (extraPanels.weaknesses) extraPanels.weaknesses.innerHTML = '';
    if (extraPanels.evolution) extraPanels.evolution.innerHTML = '';
};

renderFavoritesPanel();
document.addEventListener('pokedex:langChange', () => {
    setFavoriteButtonState(currentPokemonData);
    renderFavoritesPanel();
    if (currentPokemonData) renderPokemonDetails(currentPokemonData);
});
