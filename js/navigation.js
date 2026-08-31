// Controla a troca entre as telas: Menu, Pokédex, Batalha, Quiz e Conquistas.

const screens = {
    menu: document.getElementById('menuScreen'),
    pokedex: document.getElementById('pokedexScreen'),
    battle: document.getElementById('battleScreen'),
    quiz: document.getElementById('quizScreen'),
    achievements: document.getElementById('achievementsScreen'),
};

const showScreen = (name) => {
    Object.entries(screens).forEach(([key, el]) => {
        el.classList.toggle('active', key === name);
    });
    window.scrollTo(0, 0);
};

document.getElementById('goPokedex').addEventListener('click', () => showScreen('pokedex'));
document.getElementById('goBattle').addEventListener('click', () => showScreen('battle'));
document.getElementById('goAchievements').addEventListener('click', () => {
    renderAchievementsScreen();
    showScreen('achievements');
});
document.getElementById('goQuiz').addEventListener('click', () => {
    showScreen('quiz');
    loadQuizRound();
});

document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', () => showScreen('menu'));
});
