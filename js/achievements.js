// Sistema de conquistas: desbloqueia badges conforme o uso do app e mostra
// um toast. Progresso salvo no localStorage, sobrevive a reload.

const ACHIEVEMENTS = [
    { id: 'first_view', icon: '📖', name: 'Primeira Vista', desc: 'Veja seu primeiro Pokémon na Pokédex' },
    { id: 'explorer_10', icon: '🎒', name: 'Explorador', desc: 'Veja 10 Pokémon diferentes' },
    { id: 'explorer_50', icon: '📚', name: 'Mestre Pokédex', desc: 'Veja 50 Pokémon diferentes' },
    { id: 'shiny_hunter', icon: '✨', name: 'Caçador de Shiny', desc: 'Ative o modo shiny' },
    { id: 'shiny_luck', icon: '🌟', name: 'Sortudo', desc: 'Encontre um shiny raro por acaso (1 em 100!)' },
    { id: 'first_battle', icon: '⚔️', name: 'Primeira Luta', desc: 'Vença uma batalha' },
    { id: 'battle_veteran', icon: '🏆', name: 'Veterano de Batalha', desc: 'Vença 10 batalhas' },
    { id: 'win_streak_3', icon: '🔥', name: 'Sequência Quente', desc: 'O mesmo Pokémon vence 3 batalhas seguidas' },
    { id: 'quiz_5', icon: '🎯', name: 'Bom Adivinhador', desc: 'Acerte 5 respostas no Quiz' },
];

const ACHIEVEMENTS_KEY = 'pokedexAchievements';
let unlockedAchievements = readJSON(ACHIEVEMENTS_KEY, []);

const renderAchievementsScreen = () => {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    grid.innerHTML = ACHIEVEMENTS.map((achievement) => {
        const unlocked = unlockedAchievements.includes(achievement.id);
        return `
            <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}">
                <span class="achievement-icon">${unlocked ? achievement.icon : '🔒'}</span>
                <strong>${achievement.name}</strong>
                <p>${achievement.desc}</p>
            </div>
        `;
    }).join('');

    const countEl = document.getElementById('achievementsCount');
    if (countEl) countEl.textContent = `${unlockedAchievements.length} / ${ACHIEVEMENTS.length}`;
};

const showAchievementToast = (achievement) => {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <span class="achievement-toast-icon">${achievement.icon}</span>
        <div><strong>Conquista desbloqueada!</strong><br>${achievement.name}</div>
    `;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3500);
};

const unlockAchievement = (id) => {
    if (unlockedAchievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    unlockedAchievements.push(id);
    writeJSON(ACHIEVEMENTS_KEY, unlockedAchievements);
    showAchievementToast(achievement);
    renderAchievementsScreen();
};

renderAchievementsScreen();
