// Cores por tipo de Pokémon + ícones desenhados no estilo dos Símbolos de
// Energia do TCG (círculo colorido com um glifo simples no meio).
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

// Glifos simples em viewBox 24x24, desenhados à mão (não são um recorte de
// arte oficial) só pra remeter à silhueta clássica de cada símbolo de
// energia: chama, gota, folha, raio, punho, lua, engrenagem, estrela...
const TYPE_ICON_PATHS = {
    normal: '<path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z"/>',
    fire: '<path d="M12 22c-4.4 0-8-3.2-8-7.4 0-2.8 1.7-4.8 2.9-6.6.3 1.9 1.2 2.9 2.2 2.9-.5-2.9 1-5.7 4-7.6-1 2.9.5 4.3 2 5.8 1.8 1.9 2.9 3.9 2.9 5.9 0 4.2-3.6 7-6 7z"/>',
    water: '<path d="M12 2c-4 6-7 10-7 13.5a7 7 0 0014 0C19 12 16 8 12 2z"/>',
    electric: '<path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"/>',
    grass: '<g><path d="M4 20C4 11 10 4 20 4c0 9-7 16-16 16z"/><path d="M6.5 17.5C10 14 13.5 10.5 17 7" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="0.55"/></g>',
    ice: '<g stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="2" x2="12" y2="22"/><line x1="4.5" y1="6.5" x2="19.5" y2="17.5"/><line x1="4.5" y1="17.5" x2="19.5" y2="6.5"/></g>',
    fighting: '<g><rect x="6" y="10" width="12" height="10.5" rx="3"/><circle cx="9" cy="8" r="2.3"/><circle cx="13" cy="6.5" r="2.7"/><circle cx="17" cy="8" r="2.3"/><rect x="3.5" y="13" width="4.5" height="5.5" rx="2.2"/></g>',
    poison: '<g><circle cx="9" cy="14.5" r="5.2"/><circle cx="15.3" cy="10" r="4.2"/><circle cx="15.8" cy="17" r="3.2"/></g>',
    ground: '<g><path d="M2 18.5c2-8.3 6-13.5 10-13.5s8 5.2 10 13.5z"/><path d="M7.5 18.3l2-4.3 2 3 2-5 2 6.3" fill="none" stroke="#000" stroke-opacity="0.28" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></g>',
    flying: '<path d="M1 9.2c4-1.1 7.3.2 11 5 3.7-4.8 7-6.1 11-5-4 2.2-8.3 5.5-11 11.3-2.7-5.8-7-9.1-11-11.3z"/>',
    psychic: '<g><path d="M2 12c3-5 7-8 10-8s7 3 10 8c-3 5-7 8-10 8s-7-3-10-8z" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="12" r="3" fill="currentColor"/></g>',
    bug: '<g><ellipse cx="12" cy="14" rx="6" ry="7.2"/><line x1="12" y1="7.4" x2="12" y2="20.8" stroke="#fff" stroke-width="1" opacity="0.5"/><line x1="9.3" y1="4" x2="7" y2="1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><line x1="14.7" y1="4" x2="17" y2="1.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></g>',
    rock: '<path d="M2 18.5l2.7-8.3 3.5 3 3-7.5 4.3 5.7 2.7-3.4 3.8 10.5z"/>',
    ghost: '<g><path d="M12 2.2a7.8 7.8 0 00-7.8 7.8v10l2.4-2.4L9 20l1.5-2.4L12 20l1.5-2.4L15 20l2.4-2.4L19.8 20V10A7.8 7.8 0 0012 2.2z"/><circle cx="9.2" cy="10" r="1.3" fill="#fff"/><circle cx="14.8" cy="10" r="1.3" fill="#fff"/></g>',
    dragon: '<g><path d="M12 2a10 10 0 000 20 5 5 0 010-10 5 5 0 000-10z"/><path d="M12 22a10 10 0 000-20 5 5 0 010 10 5 5 0 000 10z" opacity="0.45"/></g>',
    dark: '<path d="M14.2 2.8a9.2 9.2 0 100 18.4c-2.3-1.6-3.4-4.9-3.4-9.2s1.1-7.6 3.4-9.2z"/>',
    steel: '<g><path d="M12 2l7.8 4.5v9L12 20l-7.8-4.5v-9L12 2z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="11" r="3" fill="currentColor"/></g>',
    fairy: '<path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z"/>',
};

const getTypeColor = (type) => TYPE_COLORS[type] || '#9AAAAA';

const clampChannel = (value) => Math.min(255, Math.max(0, value));

const darkenColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = clampChannel((num >> 16) - Math.round(255 * amount));
    const g = clampChannel(((num >> 8) & 0x00ff) - Math.round(255 * amount));
    const b = clampChannel((num & 0x0000ff) - Math.round(255 * amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const lightenColor = (hex, amount) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = clampChannel((num >> 16) + Math.round(255 * amount));
    const g = clampChannel(((num >> 8) & 0x00ff) + Math.round(255 * amount));
    const b = clampChannel((num & 0x0000ff) + Math.round(255 * amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

const getTypeGradient = (type) => {
    const base = getTypeColor(type);
    return `radial-gradient(circle at 35% 30%, ${lightenColor(base, 0.28)}, ${base} 55%, ${darkenColor(base, 0.22)})`;
};

// Retorna o <svg> completo do símbolo de energia daquele tipo, pronto pra
// ser inserido dentro de um badge circular via innerHTML.
const getTypeEnergySVG = (type) => {
    const glyph = TYPE_ICON_PATHS[type] || TYPE_ICON_PATHS.normal;
    return `<svg viewBox="0 0 24 24" fill="currentColor" class="type-energy-svg">${glyph}</svg>`;
};
