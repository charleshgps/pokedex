// Dados e helpers pra filtrar Pokémon por tipo, geração e categoria
// (lendário/mítico/comum) no modo Batalha. Compartilhado entre battle.js
// e qualquer outra tela que queira montar um combo box filtrado.

// `labelKey` aponta pra uma chave do dicionário de i18n.js (carregado antes
// deste arquivo) em vez de um texto fixo, pra a lista de gerações também
// virar inglês quando o idioma é trocado.
const GENERATIONS = [
    { id: 1, labelKey: 'battle.gen1' },
    { id: 2, labelKey: 'battle.gen2' },
    { id: 3, labelKey: 'battle.gen3' },
    { id: 4, labelKey: 'battle.gen4' },
    { id: 5, labelKey: 'battle.gen5' },
    { id: 6, labelKey: 'battle.gen6' },
    { id: 7, labelKey: 'battle.gen7' },
    { id: 8, labelKey: 'battle.gen8' },
    { id: 9, labelKey: 'battle.gen9' },
];

// Lendários e míticos "de espécie" (sem contar formas regionais/mega/gmax,
// que herdam a categoria da espécie base). Não é um dado que a PokeAPI
// exponha em lote, então a lista é mantida à mão.
const LEGENDARY_POKEMON = new Set([
    'articuno', 'zapdos', 'moltres', 'mewtwo',
    'raikou', 'entei', 'suicune', 'lugia', 'ho-oh',
    'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza',
    'uxie', 'mesprit', 'azelf', 'dialga', 'palkia', 'heatran', 'regigigas', 'giratina', 'cresselia',
    'cobalion', 'terrakion', 'virizion', 'tornadus', 'thundurus', 'reshiram', 'zekrom', 'landorus', 'kyurem',
    'xerneas', 'yveltal', 'zygarde',
    'type-null', 'tapu-koko', 'tapu-lele', 'tapu-bulu', 'tapu-fini',
    'cosmog', 'cosmoem', 'solgaleo', 'lunala', 'necrozma',
    'zacian', 'zamazenta', 'eternatus', 'kubfu', 'urshifu', 'regieleki', 'regidrago', 'glastrier', 'spectrier', 'calyrex',
    'wo-chien', 'chien-pao', 'ting-lu', 'chi-yu', 'koraidon', 'miraidon', 'okidogi', 'munkidori', 'fezandipiti', 'ogerpon', 'terapagos',
]);

const MYTHICAL_POKEMON = new Set([
    'mew', 'celebi', 'jirachi', 'deoxys',
    'phione', 'manaphy', 'darkrai', 'shaymin', 'arceus',
    'victini', 'keldeo', 'meloetta', 'genesect',
    'diancie', 'hoopa', 'volcanion',
    'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal',
    'zarude', 'pecharunt',
]);

// idFromUrl vem de utils.js (compartilhado com os módulos novos).

let allPokemonListPromise = null;
// Lista completa (nome + id) usada quando nenhum filtro de tipo/geração
// está ativo. É pesada (~1000 itens), então só é buscada sob demanda e
// fica em cache pro resto da sessão.
const getAllPokemonList = () => {
    if (!allPokemonListPromise) {
        allPokemonListPromise = fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
            .then((res) => res.json())
            .then((data) => data.results.map((p) => ({ name: p.name, id: idFromUrl(p.url) })))
            .catch(() => []);
    }
    return allPokemonListPromise;
};

const typeListCache = {};
const getTypeList = async (type) => {
    if (!typeListCache[type]) {
        typeListCache[type] = fetch(`https://pokeapi.co/api/v2/type/${type}`)
            .then((res) => res.json())
            .then((data) => data.pokemon.map((p) => ({ name: p.pokemon.name, id: idFromUrl(p.pokemon.url) })))
            .catch(() => []);
    }
    return typeListCache[type];
};

const genListCache = {};
const getGenerationList = async (genId) => {
    if (!genListCache[genId]) {
        genListCache[genId] = fetch(`https://pokeapi.co/api/v2/generation/${genId}`)
            .then((res) => res.json())
            .then((data) => data.pokemon_species.map((p) => ({ name: p.name, id: idFromUrl(p.url) })))
            .catch(() => []);
    }
    return genListCache[genId];
};

// Cruza os filtros ativos (tipo + geração + categoria) e devolve a lista
// de candidatos { name, id } que atende a todos eles ao mesmo tempo.
// Sem nenhum filtro, devolve a lista completa (pra alimentar sugestões e
// o botão aleatório com qualquer Pokémon).
const getFilteredCandidates = async ({ type, gen, category } = {}) => {
    const lists = [];

    if (type) lists.push(await getTypeList(type));
    if (gen) lists.push(await getGenerationList(gen));

    if (category === 'legendary') {
        lists.push([...LEGENDARY_POKEMON].map((name) => ({ name })));
    } else if (category === 'mythical') {
        lists.push([...MYTHICAL_POKEMON].map((name) => ({ name })));
    } else if (category === 'normal') {
        const full = await getAllPokemonList();
        lists.push(full.filter((p) => !LEGENDARY_POKEMON.has(p.name) && !MYTHICAL_POKEMON.has(p.name)));
    }

    if (lists.length === 0) return getAllPokemonList();

    let candidateNames = new Set(lists[0].map((p) => p.name));
    for (let i = 1; i < lists.length; i += 1) {
        const namesInList = new Set(lists[i].map((p) => p.name));
        candidateNames = new Set([...candidateNames].filter((name) => namesInList.has(name)));
    }

    return [...candidateNames]
        .map((name) => ({ name }))
        .sort((a, b) => a.name.localeCompare(b.name));
};
