// Cores e ícones aproximados de cada tipo de Pokémon.
// Compartilhado entre script.js (Pokédex) e battle.js (Modo Batalha).
const TYPE_COLORS = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
};

const TYPE_ICONS = {
    normal: '⭐',
    fire: '🔥',
    water: '💧',
    electric: '⚡',
    grass: '🌿',
    ice: '❄️',
    fighting: '🥊',
    poison: '☠️',
    ground: '🌎',
    flying: '🕊️',
    psychic: '🔮',
    bug: '🐛',
    rock: '🪨',
    ghost: '👻',
    dragon: '🐉',
    dark: '🌙',
    steel: '⚙️',
    fairy: '✨',
};

const getTypeColor = (type) => TYPE_COLORS[type] || '#9AAAAA';
const getTypeIcon = (type) => TYPE_ICONS[type] || '❔';

const darkenColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const clamp = (value) => Math.min(255, Math.max(0, value));
    const r = clamp((num >> 16) - Math.round(255 * amount));
    const g = clamp(((num >> 8) & 0x00ff) - Math.round(255 * amount));
    const b = clamp((num & 0x0000ff) - Math.round(255 * amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const getTypeGradient = (type) => {
    const base = getTypeColor(type);
    return `linear-gradient(135deg, ${base}, ${darkenColor(base, 0.22)})`;
};
