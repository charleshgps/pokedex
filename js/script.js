const pokemonType0 = document.querySelector('.pokemon_type0');
const pokemonType1 = document.querySelector('.pokemon_type1');
const pokemonName = document.querySelector('.pokemon_name');
const pokemonNumber = document.querySelector('.pokemon_number');
const pokemonImage = document.querySelector('.pokemon_image');
const pokemonHp = document.querySelector('.hp');
const pokemonAtk = document.querySelector('.atk');
const pokemonDef = document.querySelector('.def');
const pokemonSatk = document.querySelector('.satk');
const pokemonSdef = document.querySelector('.sdef');
const pokemonSpd = document.querySelector('.spd');

const form = document.querySelector('.form');
const input = document.querySelector('.input_search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

const MAX_POKEMON = 1025;

let searchPokemon = 1;
// Increments on every render call so a slow, stale response can be
// detected and discarded when a newer request has already started.
let requestId = 0;

const fetchPokemon = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (APIResponse.status == 200) {
        const data = await APIResponse.json();
        return data;
    }
}

const renderPokemon = async (pokemon) => {
    const currentRequest = ++requestId;
    pokemonName.innerHTML = 'Loading . . .';

    let data;
    try {
        data = await fetchPokemon(pokemon);
    } catch (error) {
        data = null;
    }

    // A newer request started while this one was in flight — ignore this result.
    if (currentRequest !== requestId) return;

    if (data) {
        pokemonType0.innerHTML = data.types[0].type.name;
        if (data.types[1]) {
            pokemonType1.innerHTML = data.types[1].type.name;
            pokemonType1.style.display = '';
        } else {
            pokemonType1.innerHTML = '';
            pokemonType1.style.display = 'none';
        }
        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;
        pokemonImage.src = data.sprites.versions['generation-v']['black-white'].animated.front_default;
        pokemonImage.alt = data.name;
        pokemonHp.innerHTML = data.stats[0].base_stat;
        pokemonAtk.innerHTML = data.stats[1].base_stat;
        pokemonDef.innerHTML = data.stats[2].base_stat;
        pokemonSatk.innerHTML = data.stats[3].base_stat;
        pokemonSdef.innerHTML = data.stats[4].base_stat;
        pokemonSpd.innerHTML = data.stats[5].base_stat;
        input.value = '';
        searchPokemon = data.id
    } else {
        pokemonImage.src = './images/icons8-error-96.png';
        pokemonImage.alt = 'pokemon not found';
        pokemonType1.style.display = 'none';
        pokemonNumber.innerHTML = '';
        pokemonName.innerHTML = 'Not found :c';
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.trim().toLowerCase());
})

buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1
        renderPokemon(searchPokemon)
    }
})

buttonNext.addEventListener('click', () => {
    if (searchPokemon < MAX_POKEMON) {
        searchPokemon += 1
        renderPokemon(searchPokemon)
    }
})


renderPokemon(searchPokemon);
