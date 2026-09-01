// Modo Quiz: "Quem é esse Pokémon?" com 3 variações —
// Visual (silhueta clássica), Som (adivinha pelo grito) e Contrarrelógio
// (silhueta contra 60 segundos, com placar de melhores pontuações local).

const quizModeButtons = {
    visual: document.getElementById('quizModeVisual'),
    sound: document.getElementById('quizModeSound'),
    timed: document.getElementById('quizModeTimed'),
};

const quizPlayArea = document.getElementById('quizPlayArea');
const quizSilhouetteWrap = document.getElementById('quizSilhouetteWrap');
const quizImage = document.getElementById('quizImage');
const quizSoundIcon = document.getElementById('quizSoundIcon');
const quizReplayCryButton = document.getElementById('quizReplayCry');
const quizForm = document.getElementById('quizForm');
const quizInput = document.getElementById('quizInput');
const quizFeedback = document.getElementById('quizFeedback');
const quizNext = document.getElementById('quizNext');
const quizScoreEl = document.getElementById('quizScore');
const quizStreakEl = document.getElementById('quizStreak');
const quizTimerEl = document.getElementById('quizTimer');

const quizTimedIntro = document.getElementById('quizTimedIntro');
const quizTimedSummary = document.getElementById('quizTimedSummary');
const quizStartTimedButton = document.getElementById('quizStartTimed');
const quizPlayAgainButton = document.getElementById('quizPlayAgain');
const quizTimeUpText = document.getElementById('quizTimeUpText');
const quizLeaderboardIntro = document.getElementById('quizLeaderboardIntro');
const quizLeaderboardSummary = document.getElementById('quizLeaderboardSummary');

const QUIZ_CORRECT_KEY = 'pokedexQuizCorrectTotal';
const QUIZ_SOUND_CORRECT_KEY = 'pokedexQuizSoundCorrectTotal';
const QUIZ_TIMED_LEADERBOARD_KEY = 'pokedexQuizTimedLeaderboard';
const MAX_QUIZ_POKEMON = 1025;
const TIMED_DURATION = 60;

let quizMode = 'visual';
let quizScore = 0;
let quizStreak = 0;
let quizCorrectTotal = readJSON(QUIZ_CORRECT_KEY, 0);
let quizSoundCorrectTotal = readJSON(QUIZ_SOUND_CORRECT_KEY, 0);
let timedLeaderboard = readJSON(QUIZ_TIMED_LEADERBOARD_KEY, []); // [{ score, date }]
let currentAnswer = null;
let currentCryUrl = null;
let quizAnswered = false;
let timedInterval = null;
let timedTimeLeft = TIMED_DURATION;
let timedScore = 0;

const playQuizCry = () => {
    if (!currentCryUrl) return;
    try {
        const audio = new Audio(currentCryUrl);
        audio.play().catch(() => {});
    } catch (error) {
        // ignora falha de reprodução
    }
};

const loadQuizRound = async () => {
    quizAnswered = false;
    currentAnswer = null;
    currentCryUrl = null;
    quizFeedback.textContent = '';
    quizFeedback.className = 'quiz-feedback';
    quizNext.hidden = true;
    quizImage.classList.remove('revealed');
    quizImage.style.visibility = '';
    quizInput.value = '';
    quizInput.disabled = false;
    quizImage.src = '';

    const isSound = quizMode === 'sound';
    if (quizSoundIcon) quizSoundIcon.hidden = !isSound;
    if (isSound) quizImage.style.visibility = 'hidden';
    if (quizReplayCryButton) quizReplayCryButton.hidden = !isSound;

    const id = 1 + Math.floor(Math.random() * MAX_QUIZ_POKEMON);
    const data = await fetchJSON(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!data) {
        quizFeedback.textContent = t('quiz.loadError');
        return;
    }
    currentAnswer = data.name;
    currentCryUrl = data.cries && data.cries.latest;
    quizImage.src = data.sprites.front_default
        || data.sprites.versions['generation-v']['black-white'].animated.front_default;
    quizInput.focus();
    if (isSound) playQuizCry();
};

quizForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (quizAnswered || !currentAnswer) return;

    const guess = quizInput.value.trim().toLowerCase();
    quizAnswered = true;
    quizInput.disabled = true;
    quizImage.classList.add('revealed');
    quizImage.style.visibility = '';
    if (quizSoundIcon) quizSoundIcon.hidden = true;

    if (guess === currentAnswer) {
        quizScore += 1;
        quizStreak += 1;
        quizCorrectTotal += 1;
        writeJSON(QUIZ_CORRECT_KEY, quizCorrectTotal);
        quizFeedback.textContent = t('quiz.correct', { name: capitalize(currentAnswer) });
        quizFeedback.className = 'quiz-feedback correct';
        if (quizCorrectTotal >= 5) unlockAchievement('quiz_5');

        if (quizMode === 'sound') {
            quizSoundCorrectTotal += 1;
            writeJSON(QUIZ_SOUND_CORRECT_KEY, quizSoundCorrectTotal);
            if (quizSoundCorrectTotal >= 5) unlockAchievement('quiz_sound_5');
        }
        if (quizMode === 'timed') timedScore += 1;
    } else {
        quizStreak = 0;
        quizFeedback.textContent = t('quiz.wrong', { name: capitalize(currentAnswer) });
        quizFeedback.className = 'quiz-feedback wrong';
    }

    quizScoreEl.textContent = quizScore;
    quizStreakEl.textContent = quizStreak;

    if (quizMode === 'timed') {
        // Avança sozinho depois de uma pausa curta pra dar tempo de ler o
        // feedback — sem precisar clicar em "Próximo" contra o relógio.
        setTimeout(() => {
            if (quizMode === 'timed' && timedTimeLeft > 0) loadQuizRound();
        }, 500);
    } else {
        quizNext.hidden = false;
    }
});

quizNext.addEventListener('click', loadQuizRound);
if (quizReplayCryButton) quizReplayCryButton.addEventListener('click', playQuizCry);

// --- Contrarrelógio ---

const renderLeaderboard = (el) => {
    if (!el) return;
    const top = [...timedLeaderboard].sort((a, b) => b.score - a.score).slice(0, 5);
    el.innerHTML = top.length === 0
        ? `<li class="quiz-leaderboard-empty">${t('quiz.leaderboardEmpty')}</li>`
        : top.map((entry) => `<li><span class="quiz-leaderboard-score">${entry.score}</span><span class="quiz-leaderboard-date">${formatDateTime(entry.date)}</span></li>`).join('');
};

const stopTimedCountdown = () => {
    if (timedInterval) {
        clearInterval(timedInterval);
        timedInterval = null;
    }
};

const showTimedIntro = () => {
    quizPlayArea.hidden = true;
    quizTimedSummary.hidden = true;
    quizTimedIntro.hidden = false;
    quizTimerEl.hidden = true;
    renderLeaderboard(quizLeaderboardIntro);
};

const endTimedSession = () => {
    stopTimedCountdown();
    quizPlayArea.hidden = true;
    quizTimerEl.hidden = true;

    const bestBefore = timedLeaderboard.reduce((max, entry) => Math.max(max, entry.score), 0);
    const isRecord = timedScore > 0 && timedScore > bestBefore;
    timedLeaderboard.push({ score: timedScore, date: new Date().toISOString() });
    timedLeaderboard = timedLeaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
    writeJSON(QUIZ_TIMED_LEADERBOARD_KEY, timedLeaderboard);
    if (timedScore >= 10) unlockAchievement('quiz_speedster');

    quizTimeUpText.textContent = t('quiz.timeUp', { score: timedScore }) + (isRecord ? ` ${t('quiz.newRecord')}` : '');
    renderLeaderboard(quizLeaderboardSummary);
    quizTimedSummary.hidden = false;
};

const tickTimedCountdown = () => {
    timedTimeLeft -= 1;
    quizTimerEl.textContent = t('quiz.timeLeft', { s: timedTimeLeft });
    if (timedTimeLeft <= 0) endTimedSession();
};

const startTimedSession = () => {
    timedScore = 0;
    timedTimeLeft = TIMED_DURATION;
    quizTimedIntro.hidden = true;
    quizTimedSummary.hidden = true;
    quizPlayArea.hidden = false;
    quizTimerEl.hidden = false;
    quizTimerEl.textContent = t('quiz.timeLeft', { s: timedTimeLeft });
    stopTimedCountdown();
    timedInterval = setInterval(tickTimedCountdown, 1000);
    loadQuizRound();
};

if (quizStartTimedButton) quizStartTimedButton.addEventListener('click', startTimedSession);
if (quizPlayAgainButton) quizPlayAgainButton.addEventListener('click', showTimedIntro);

// --- Troca de modo ---

const setQuizMode = (mode) => {
    quizMode = mode;
    Object.entries(quizModeButtons).forEach(([name, btn]) => {
        if (btn) btn.classList.toggle('active', name === mode);
    });
    stopTimedCountdown();

    if (mode === 'timed') {
        showTimedIntro();
    } else {
        quizTimedIntro.hidden = true;
        quizTimedSummary.hidden = true;
        quizPlayArea.hidden = false;
        quizTimerEl.hidden = true;
        loadQuizRound();
    }
};

Object.entries(quizModeButtons).forEach(([name, btn]) => {
    if (btn) btn.addEventListener('click', () => setQuizMode(name));
});

document.addEventListener('pokedex:langChange', () => {
    if (!quizTimedIntro.hidden) renderLeaderboard(quizLeaderboardIntro);
    if (!quizTimedSummary.hidden) renderLeaderboard(quizLeaderboardSummary);
});
