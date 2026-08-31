// Controla a troca entre as telas: Menu, Pokédex e Batalha.

const screens = {
    menu: document.getElementById('menuScreen'),
    pokedex: document.getElementById('pokedexScreen'),
    battle: document.getElementById('battleScreen'),
};

const showScreen = (name) => {
    Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle('active', key === name);
    });
    window.scrollTo(0, 0);
};

document.getElementById('goPokedex').addEventListener('click', () => showScreen('pokedex'));
document.getElementById('goBattle').addEventListener('click', () => showScreen('battle'));

document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => showScreen('menu'));
});
