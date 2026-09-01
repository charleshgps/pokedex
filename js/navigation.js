// Controla a troca entre as telas: Menu, Pokédex, Batalha, Quiz,
// Conquistas e Hall da Fama.

const screens = {
    menu: document.getElementById('menuScreen'),
    pokedex: document.getElementById('pokedexScreen'),
    battle: document.getElementById('battleScreen'),
    quiz: document.getElementById('quizScreen'),
    achievements: document.getElementById('achievementsScreen'),
    hallOfFame: document.getElementById('hallOfFameScreen'),
};

const showScreen = (name) => {
    Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle('active', key === name);
    });
    window.scrollTo(0, 0);
    // Sai da tela do Quiz com um contrarrelógio rodando em segundo plano:
    // pausa o timer em vez de deixar ele terminando escondido.
    if (name !== 'quiz' && typeof stopTimedCountdown === 'function') stopTimedCountdown();
};

document.getElementById('goPokedex').addEventListener('click', () => showScreen('pokedex'));
document.getElementById('goBattle').addEventListener('click', () => showScreen('battle'));
document.getElementById('goAchievements').addEventListener('click', () => {
    renderAchievementsScreen();
    showScreen('achievements');
});
document.getElementById('goHallOfFame').addEventListener('click', () => {
    renderHallOfFameScreen();
    showScreen('hallOfFame');
});
document.getElementById('goQuiz').addEventListener('click', () => {
    showScreen('quiz');
    if (quizMode === 'timed') {
        showTimedIntro();
    } else {
        loadQuizRound();
    }
});

document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => showScreen('menu'));
});
