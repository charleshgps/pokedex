// Alterna entre tema claro/escuro e lembra a escolha no localStorage.

const THEME_KEY = 'pokedexTheme';
const themeToggleButton = document.getElementById('themeToggle');

const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggleButton.textContent = theme === 'dark' ? '🌙' : '☀️';
};

let currentTheme = readJSON(THEME_KEY, 'light');
applyTheme(currentTheme);

themeToggleButton.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    writeJSON(THEME_KEY, currentTheme);
});
