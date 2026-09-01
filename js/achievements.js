// Sistema de conquistas: desbloqueia badges conforme o uso do app e mostra
// um toast. Progresso salvo no localStorage, sobrevive a reload.

// name/desc apontam pra chaves de i18n.js (achievements.<id>.name/.desc)
// em vez de texto fixo, pra a tela acompanhar o idioma escolhido.
const ACHIEVEMENTS = [
    { id: 'first_view', icon: '📖' },
    { id: 'explorer_10', icon: '🎒' },
    { id: 'explorer_50', icon: '📚' },
    { id: 'shiny_hunter', icon: '✨' },
    { id: 'shiny_luck', icon: '🌟' },
    { id: 'first_battle', icon: '⚔️' },
    { id: 'battle_veteran', icon: '🏆' },
    { id: 'win_streak_3', icon: '🔥' },
    { id: 'quiz_5', icon: '🎯' },
    { id: 'favorite_first', icon: '⭐' },
    { id: 'favorite_10', icon: '🗂️' },
    { id: 'campaign_champion', icon: '🏅' },
    { id: 'quiz_sound_5', icon: '👂' },
    { id: 'quiz_speedster', icon: '⚡' },
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
                <strong>${t(`achievements.${achievement.id}.name`)}</strong>
                <p>${t(`achievements.${achievement.id}.desc`)}</p>
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
        <div><strong>${t('achievements.unlockedToast')}</strong><br>${t(`achievements.${achievement.id}.name`)}</div>
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

document.addEventListener('pokedex:langChange', renderAchievementsScreen);
renderAchievementsScreen();
