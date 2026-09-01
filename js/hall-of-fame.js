// Hall da Fama: guarda um histórico das vitórias de batalha (livre ou
// campanha) — quem venceu, contra quem e quando. battle.js chama
// addHallOfFameEntry no fim de cada luta.

const HALL_OF_FAME_KEY = 'pokedexHallOfFame';
const HALL_OF_FAME_MAX = 50;
let hallOfFame = readJSON(HALL_OF_FAME_KEY, []);

const hallOfFameGrid = document.getElementById('hallOfFameGrid');
const hallOfFameCount = document.getElementById('hallOfFameCount');
const hallOfFameClearButton = document.getElementById('hallOfFameClear');

const renderHallOfFameScreen = () => {
    if (!hallOfFameGrid) return;
    if (hallOfFame.length === 0) {
        hallOfFameGrid.innerHTML = `<p class="extra-empty">${t('hallOfFame.empty')}</p>`;
    } else {
        hallOfFameGrid.innerHTML = hallOfFame.map((entry) => `
            <div class="hof-card">
                <img src="${entry.sprite || ''}" alt="${entry.name}">
                <strong>#${entry.id} ${capitalize(entry.name)}</strong>
                <p>${t('hallOfFame.wonAgainst', { opponent: capitalize(entry.opponentName), date: formatDateTime(entry.date) })}</p>
            </div>
        `).join('');
    }
    if (hallOfFameCount) hallOfFameCount.textContent = t('hallOfFame.count', { count: hallOfFame.length });
};

const addHallOfFameEntry = (winner, loser) => {
    hallOfFame.unshift({
        id: winner.id,
        name: winner.name,
        sprite: winner.sprite,
        opponentName: loser.name,
        date: new Date().toISOString(),
    });
    if (hallOfFame.length > HALL_OF_FAME_MAX) hallOfFame.length = HALL_OF_FAME_MAX;
    writeJSON(HALL_OF_FAME_KEY, hallOfFame);
    renderHallOfFameScreen();
};

if (hallOfFameClearButton) {
    hallOfFameClearButton.addEventListener('click', () => {
        hallOfFame = [];
        writeJSON(HALL_OF_FAME_KEY, hallOfFame);
        renderHallOfFameScreen();
    });
}

document.addEventListener('pokedex:langChange', renderHallOfFameScreen);
renderHallOfFameScreen();
