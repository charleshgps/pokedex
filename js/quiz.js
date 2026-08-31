// Modo Quiz: "Quem é esse Pokémon?" — mostra a silhueta e o jogador
// tenta adivinhar o nome, clássico da franquia.

const quizImage = document.getElementById('quizImage');
const quizForm = document.getElementById('quizForm');
const quizInput = document.getElementById('quizInput');
const quizFeedback = document.getElementById('quizFeedback');
const quizNext = document.getElementById('quizNext');
const quizScoreEl = document.getElementById('quizScore');
const quizStreakEl = document.getElementById('quizStreak');

const QUIZ_CORRECT_KEY = 'pokedexQuizCorrectTotal';
const MAX_QUIZ_POKEMON = 1025;

let quizScore = 0;
let quizStreak = 0;
let quizCorrectTotal = readJSON(QUIZ_CORRECT_KEY, 0);
let currentAnswer = null;
let quizAnswered = false;

const loadQuizRound = async () => {
    quizAnswered = false;
    currentAnswer = null;
    quizFeedback.textContent = '';
    quizFeedback.className = 'quiz-feedback';
    quizNext.hidden = true;
    quizImage.classList.remove('revealed');
    quizInput.value = '';
    quizInput.disabled = false;
    quizImage.src = '';

    const id = 1 + Math.floor(Math.random() * MAX_QUIZ_POKEMON);
    try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!res.ok) throw new Error('falha ao buscar');
        const data = await res.json();
        currentAnswer = data.name;
        quizImage.src = data.sprites.front_default
            || data.sprites.versions['generation-v']['black-white'].animated.front_default;
        quizInput.focus();
    } catch (error) {
        quizFeedback.textContent = 'Erro ao carregar o Pokémon misterioso, tente de novo.';
    }
};

quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (quizAnswered || !currentAnswer) return;

    const guess = quizInput.value.trim().toLowerCase();
    quizAnswered = true;
    quizInput.disabled = true;
    quizImage.classList.add('revealed');
    quizNext.hidden = false;

    if (guess === currentAnswer) {
        quizScore += 1;
        quizStreak += 1;
        quizCorrectTotal += 1;
        writeJSON(QUIZ_CORRECT_KEY, quizCorrectTotal);
        quizFeedback.textContent = `✅ Isso mesmo, é ${capitalize(currentAnswer)}!`;
        quizFeedback.className = 'quiz-feedback correct';
        if (quizCorrectTotal >= 5) unlockAchievement('quiz_5');
    } else {
        quizStreak = 0;
        quizFeedback.textContent = `❌ Não! Era ${capitalize(currentAnswer)}.`;
        quizFeedback.className = 'quiz-feedback wrong';
    }

    quizScoreEl.textContent = quizScore;
    quizStreakEl.textContent = quizStreak;
});

quizNext.addEventListener('click', loadQuizRound);
