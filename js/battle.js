// Modo Batalha: cada lado monta um time de até 6 Pokémon. A luta usa as
// stats reais e, sempre que possível, os golpes reais de cada Pokémon
// (buscados da PokeAPI) — com efetividade de tipo oficial, STAB, crítico
// e troca automática pro próximo do time quando um desmaia.

const fighter1Form = document.getElementById('fighter1Form');
const fighter1Input = document.getElementById('fighter1Input');
const fighter1Card = document.getElementById('fighter1Card');
const roster1Strip = document.getElementById('roster1Strip');

const fighter2Form = document.getElementById('fighter2Form');
const fighter2Input = document.getElementById('fighter2Input');
const fighter2Card = document.getElementById('fighter2Card');
const roster2Strip = document.getElementById('roster2Strip');

const fightButton = document.getElementById('fightButton');
const resetTeamsButton = document.getElementById('resetTeamsButton');
const battleLog = document.getElementById('battleLog');
const battleArena = document.getElementById('battleArena');

const HP_MULTIPLIER = 3; // dá fôlego pra luta durar alguns turnos
const LEVEL = 50;
const MAX_TEAM_SIZE = 6;
const BATTLE_WINS_KEY = 'pokedexBattleWins';
const WIN_STREAK_KEY = 'pokedexWinStreak';

const team1 = { roster: [], activeIndex: 0 };
const team2 = { roster: [], activeIndex: 0 };
let battleInProgress = false;
const typeRelationsCache = {};

// Um lado de cada vez: time, elementos do card/roster e os controles de
// filtro (tipo/geração/categoria) + combo box de sugestões + aleatório.
const battleSides = [
    {
        team: team1,
        input: fighter1Input,
        card: fighter1Card,
        strip: roster1Strip,
        typeSelect: document.getElementById('fighter1Type'),
        genSelect: document.getElementById('fighter1Gen'),
        categorySelect: document.getElementById('fighter1Category'),
        datalist: document.getElementById('fighter1List'),
        randomButton: document.getElementById('fighter1Random'),
    },
    {
        team: team2,
        input: fighter2Input,
        card: fighter2Card,
        strip: roster2Strip,
        typeSelect: document.getElementById('fighter2Type'),
        genSelect: document.getElementById('fighter2Gen'),
        categorySelect: document.getElementById('fighter2Category'),
        datalist: document.getElementById('fighter2List'),
        randomButton: document.getElementById('fighter2Random'),
    },
];

const getActive = (team) => team.roster[team.activeIndex] || null;

const spawnConfetti = () => {
    const pieces = ['🎉', '⭐', '✨', '🎊'];
    for (let i = 0; i < 24; i += 1) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        piece.textContent = pieces[Math.floor(Math.random() * pieces.length)];
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 0.4}s`;
        piece.style.fontSize = `${14 + Math.random() * 14}px`;
        battleArena.appendChild(piece);
        piece.addEventListener('animationend', () => piece.remove());
    }
};

// Busca até 4 golpes de dano reais que o Pokémon aprende subindo de nível.
// Golpes de status (sem power, ex: Rugido) são ignorados aqui, já que este
// simulador só modela combate direto. Se nada for encontrado, retorna uma
// lista vazia e o combate cai num golpe genérico do próprio tipo.
const fetchFighterMoves = async (data) => {
    const levelUpMoves = data.moves.filter((move) =>
        move.version_group_details.some((detail) => detail.move_learn_method.name === 'level-up'));

    const candidates = levelUpMoves
        .map((move) => move.move)
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    const results = await Promise.allSettled(
        candidates.map((move) => fetch(move.url).then((res) => (res.ok ? res.json() : null))),
    );

    const moves = [];
    for (const result of results) {
        if (moves.length >= 4) break;
        if (result.status !== 'fulfilled' || !result.value) continue;
        const moveData = result.value;
        if (typeof moveData.power !== 'number' || moveData.power <= 0) continue;
        const ptName = moveData.names.find((n) => n.language.name === 'pt-BR');
        moves.push({
            name: ptName ? ptName.name : capitalize(moveData.name.replace(/-/g, ' ')),
            power: moveData.power,
            type: moveData.type.name,
            damageClass: moveData.damage_class.name,
        });
    }
    return moves;
};

const fetchFighter = async (query) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).trim().toLowerCase()}`);
    if (APIResponse.status !== 200) return null;
    const data = await APIResponse.json();
    const moves = await fetchFighterMoves(data);
    const maxHp = data.stats[0].base_stat * HP_MULTIPLIER;
    return {
        name: data.name,
        id: data.id,
        sprite: data.sprites.front_default,
        types: data.types.map((t) => t.type.name),
        stats: {
            hp: data.stats[0].base_stat,
            atk: data.stats[1].base_stat,
            def: data.stats[2].base_stat,
            satk: data.stats[3].base_stat,
            sdef: data.stats[4].base_stat,
            spd: data.stats[5].base_stat,
        },
        moves,
        maxHp,
        currentHp: maxHp,
    };
};

const renderFighterCard = (cardEl, fighter) => {
    cardEl.innerHTML = `
        <img src="${fighter.sprite}" alt="${fighter.name}" class="fighter-sprite">
        <p class="fighter-name">#${fighter.id} ${capitalize(fighter.name)}</p>
        <p class="fighter-types">
            ${fighter.types.map((type) => `<span class="type-badge" data-type="${type}" title="${capitalize(type)}" aria-label="${type}">${getTypeEnergySVG(type)}</span>`).join('')}
        </p>
        <div class="hp-bar-container"><div class="hp-bar"></div></div>
        <p class="hp-text"></p>
    `;
    cardEl.querySelectorAll('.type-badge').forEach((badge) => {
        badge.style.background = getTypeGradient(badge.dataset.type);
    });
    updateHpBar(fighter, cardEl);
};

const updateHpBar = (fighter, cardEl) => {
    const pct = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
    const hpBar = cardEl.querySelector('.hp-bar');
    const hpText = cardEl.querySelector('.hp-text');
    hpBar.style.width = `${pct}%`;
    hpBar.classList.toggle('hp-low', pct <= 20);
    hpBar.classList.toggle('hp-mid', pct > 20 && pct <= 50);
    hpText.textContent = `${Math.max(0, Math.ceil(fighter.currentHp))} / ${fighter.maxHp} HP`;
};

const renderRosterStrip = (stripEl, team) => {
    stripEl.innerHTML = team.roster.map((fighter, index) => `
        <img class="roster-icon${index === team.activeIndex ? ' active' : ''}${fighter.currentHp <= 0 ? ' fainted' : ''}"
             src="${fighter.sprite}" alt="${fighter.name}" title="${capitalize(fighter.name)}">
    `).join('');
};

const shakeCard = (cardEl) => {
    cardEl.classList.remove('shake');
    void cardEl.offsetWidth; // força reflow pra animação poder rodar de novo
    cardEl.classList.add('shake');
};

const logMessage = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    battleLog.appendChild(p);
    battleLog.scrollTop = battleLog.scrollHeight;
};

const updateFightButtonState = () => {
    fightButton.disabled = battleInProgress || team1.roster.length === 0 || team2.roster.length === 0;
};

const addFighterToTeam = async (team, input, card, strip) => {
    if (battleInProgress) return;
    const query = input.value.trim();
    if (!query) return;

    if (team.roster.length >= MAX_TEAM_SIZE) {
        logMessage(`⚠️ Esse time já tem o máximo de ${MAX_TEAM_SIZE} Pokémon.`);
        return;
    }

    const wasEmpty = team.roster.length === 0;
    if (wasEmpty) card.innerHTML = '<p class="fighter-placeholder">Carregando...</p>';

    const fighter = await fetchFighter(query);
    if (!fighter) {
        if (wasEmpty) card.innerHTML = '<p class="fighter-placeholder">❔<br>Pokémon não encontrado :c</p>';
        return;
    }

    team.roster.push(fighter);
    if (wasEmpty) {
        team.activeIndex = 0;
        renderFighterCard(card, fighter);
    }
    renderRosterStrip(strip, team);
    input.value = '';
    updateFightButtonState();
};

fighter1Form.addEventListener('submit', (event) => {
    event.preventDefault();
    addFighterToTeam(team1, fighter1Input, fighter1Card, roster1Strip);
});

fighter2Form.addEventListener('submit', (event) => {
    event.preventDefault();
    addFighterToTeam(team2, fighter2Input, fighter2Card, roster2Strip);
});

resetTeamsButton.addEventListener('click', () => {
    if (battleInProgress) return;
    team1.roster = [];
    team1.activeIndex = 0;
    team2.roster = [];
    team2.activeIndex = 0;
    fighter1Card.innerHTML = '<p class="fighter-placeholder">❔<br>Monte seu time (1 a 6)</p>';
    fighter2Card.innerHTML = '<p class="fighter-placeholder">❔<br>Monte seu time (1 a 6)</p>';
    roster1Strip.innerHTML = '';
    roster2Strip.innerHTML = '';
    battleLog.innerHTML = '';
    battleLog.style.display = 'none';
    battleSides.forEach((side) => {
        side.typeSelect.value = '';
        side.genSelect.value = '';
        side.categorySelect.value = '';
    });
    updateFightButtonState();
});

// Popula os selects de tipo e geração (as opções de categoria já vêm
// prontas no HTML, já que a lista é curta e fixa).
const capitalizeType = (type) => capitalize(type.replace(/-/g, ' '));

battleSides.forEach((side) => {
    Object.keys(TYPE_COLORS).forEach((type) => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = capitalizeType(type);
        side.typeSelect.appendChild(option);
    });
    GENERATIONS.forEach((gen) => {
        const option = document.createElement('option');
        option.value = gen.id;
        option.textContent = gen.label;
        side.genSelect.appendChild(option);
    });
});

const currentFilters = (side) => ({
    type: side.typeSelect.value || null,
    gen: side.genSelect.value || null,
    category: side.categorySelect.value || null,
});

// Recarrega as sugestões do combo box (datalist) de acordo com os filtros
// ativos daquele lado. Guarda um número de pedido pra ignorar uma resposta
// antiga caso o usuário troque de filtro de novo antes dela voltar.
const refreshSuggestions = async (side) => {
    side.suggestionRequest = (side.suggestionRequest || 0) + 1;
    const requestId = side.suggestionRequest;
    const candidates = await getFilteredCandidates(currentFilters(side));
    if (side.suggestionRequest !== requestId) return;
    side.datalist.innerHTML = candidates
        .slice(0, 400)
        .map((p) => `<option value="${capitalize(p.name)}"></option>`)
        .join('');
};

battleSides.forEach((side) => {
    [side.typeSelect, side.genSelect, side.categorySelect].forEach((select) => {
        select.addEventListener('change', () => refreshSuggestions(side));
    });
    // A lista completa (sem filtro nenhum) só é buscada quando o usuário
    // realmente for procurar — evita puxar ~1000 Pokémon toda vez que a
    // tela de batalha abre.
    side.input.addEventListener('focus', () => refreshSuggestions(side), { once: true });

    side.randomButton.addEventListener('click', async () => {
        if (battleInProgress) return;
        if (side.team.roster.length >= MAX_TEAM_SIZE) {
            logMessage(`⚠️ Esse time já tem o máximo de ${MAX_TEAM_SIZE} Pokémon.`);
            return;
        }
        side.randomButton.disabled = true;
        try {
            const candidates = await getFilteredCandidates(currentFilters(side));
            if (candidates.length === 0) {
                logMessage('⚠️ Nenhum Pokémon encontrado com esses filtros.');
                return;
            }
            const pick = candidates[Math.floor(Math.random() * candidates.length)];
            side.input.value = pick.name;
            await addFighterToTeam(side.team, side.input, side.card, side.strip);
        } finally {
            side.randomButton.disabled = false;
        }
    });
});

const getTypeMultiplier = async (attackType, defenderTypes) => {
    if (!typeRelationsCache[attackType]) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${attackType}`);
        const data = await res.json();
        typeRelationsCache[attackType] = data.damage_relations;
    }
    const relations = typeRelationsCache[attackType];
    let multiplier = 1;
    defenderTypes.forEach((defType) => {
        if (relations.double_damage_to.some((t) => t.name === defType)) multiplier *= 2;
        if (relations.half_damage_to.some((t) => t.name === defType)) multiplier *= 0.5;
        if (relations.no_damage_to.some((t) => t.name === defType)) multiplier *= 0;
    });
    return multiplier;
};

// Sorteia um dos golpes reais do Pokémon; se ele não tiver nenhum golpe de
// dano conhecido, cai num golpe genérico do próprio tipo como último recurso.
const pickMove = (fighter) => {
    if (fighter.moves.length > 0) {
        return fighter.moves[Math.floor(Math.random() * fighter.moves.length)];
    }
    const usesSpecial = fighter.stats.satk > fighter.stats.atk;
    return { name: 'Investida', power: 60, type: fighter.types[0], damageClass: usesSpecial ? 'special' : 'physical' };
};

// Quando o golpe escolhido não afeta o defensor (ex: Elétrico em Terra), a
// luta viraria uma derrota garantida — em vez disso o Pokémon tenta um
// "golpe de desespero" neutro, mais fraco e sem STAB.
const calculateDamage = async (attacker, defender) => {
    const move = pickMove(attacker);
    const isSpecial = move.damageClass === 'special';
    const atkStat = isSpecial ? attacker.stats.satk : attacker.stats.atk;
    const defStat = isSpecial ? defender.stats.sdef : defender.stats.def;

    let multiplier = await getTypeMultiplier(move.type, defender.types);
    const struggling = multiplier === 0;
    if (struggling) multiplier = 1;

    const stab = !struggling && attacker.types.includes(move.type) ? 1.5 : 1;
    const isCrit = Math.random() < 1 / 16;
    const randomFactor = 0.85 + Math.random() * 0.15;

    let damage = (((2 * LEVEL) / 5 + 2) * move.power * (atkStat / defStat)) / 50 + 2;
    damage = Math.floor(damage * stab * multiplier * (isCrit ? 1.5 : 1) * randomFactor);
    if (struggling) damage = Math.floor(damage * 0.5);
    damage = Math.max(1, damage);

    return { damage, multiplier: struggling ? 0 : multiplier, isCrit, move, struggling };
};

// Se o ativo atual desmaiou, manda o próximo vivo do time pra batalha.
// Retorna false se o time inteiro já desmaiou (perdeu).
const advanceIfFainted = (side) => {
    const active = getActive(side.team);
    if (active && active.currentHp > 0) return true;

    const nextIndex = side.team.roster.findIndex((f) => f.currentHp > 0);
    if (nextIndex === -1) return false;

    side.team.activeIndex = nextIndex;
    const next = getActive(side.team);
    renderFighterCard(side.card, next);
    renderRosterStrip(side.strip, side.team);
    logMessage(`🔄 ${side.label} manda ${capitalize(next.name)} para a batalha!`);
    return true;
};

const recordBattleWin = (winnerFighterName) => {
    unlockAchievement('first_battle');

    const totalWins = readJSON(BATTLE_WINS_KEY, 0) + 1;
    writeJSON(BATTLE_WINS_KEY, totalWins);
    if (totalWins >= 10) unlockAchievement('battle_veteran');

    const previousStreak = readJSON(WIN_STREAK_KEY, { name: null, count: 0 });
    const streak = previousStreak.name === winnerFighterName
        ? { name: winnerFighterName, count: previousStreak.count + 1 }
        : { name: winnerFighterName, count: 1 };
    writeJSON(WIN_STREAK_KEY, streak);
    if (streak.count >= 3) unlockAchievement('win_streak_3');
};

const endBattle = (winningSide) => {
    logMessage(`🏆 ${winningSide.label} venceu com ${capitalize(getActive(winningSide.team).name)}!`);
    spawnConfetti();
    recordBattleWin(capitalize(getActive(winningSide.team).name));
    battleInProgress = false;
    updateFightButtonState();
};

const runBattle = async () => {
    if (battleInProgress || team1.roster.length === 0 || team2.roster.length === 0) return;
    battleInProgress = true;
    updateFightButtonState();
    battleLog.innerHTML = '';
    battleLog.style.display = 'block';

    [...team1.roster, ...team2.roster].forEach((fighter) => { fighter.currentHp = fighter.maxHp; });
    team1.activeIndex = 0;
    team2.activeIndex = 0;
    renderFighterCard(fighter1Card, getActive(team1));
    renderFighterCard(fighter2Card, getActive(team2));
    renderRosterStrip(roster1Strip, team1);
    renderRosterStrip(roster2Strip, team2);

    logMessage(`⚔️ Time 1 (${team1.roster.length} Pokémon) VS Time 2 (${team2.roster.length} Pokémon)!`);
    await sleep(500);

    const sideA = { team: team1, card: fighter1Card, strip: roster1Strip, label: 'Time 1' };
    const sideB = { team: team2, card: fighter2Card, strip: roster2Strip, label: 'Time 2' };

    let round = 1;
    while (round <= 200) {
        const first = getActive(sideA.team).stats.spd >= getActive(sideB.team).stats.spd ? sideA : sideB;
        const second = first === sideA ? sideB : sideA;

        for (const [attackerSide, defenderSide] of [[first, second], [second, first]]) {
            if (!advanceIfFainted(attackerSide)) return endBattle(defenderSide);
            if (!advanceIfFainted(defenderSide)) return endBattle(attackerSide);

            const attacker = getActive(attackerSide.team);
            const defender = getActive(defenderSide.team);

            const { damage, multiplier, isCrit, move, struggling } = await calculateDamage(attacker, defender);
            defender.currentHp = Math.max(0, defender.currentHp - damage);
            updateHpBar(defender, defenderSide.card);
            shakeCard(defenderSide.card);
            renderRosterStrip(defenderSide.strip, defenderSide.team);

            let message = `${attackerSide === sideA ? '🔵' : '🔴'} ${capitalize(attacker.name)} usou ${move.name}! Causa ${damage} de dano em ${capitalize(defender.name)}.`;
            if (isCrit) message += ' 💥 Crítico!';
            if (struggling) message += ' 😖 Não afeta, tenta um golpe de desespero!';
            else if (multiplier > 1) message += ' Super efetivo!';
            else if (multiplier < 1) message += ' Pouco efetivo...';
            logMessage(message);

            await sleep(900);
        }
        round += 1;
    }

    battleInProgress = false;
    updateFightButtonState();
};

fightButton.addEventListener('click', runBattle);
