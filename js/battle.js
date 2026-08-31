// Modo Batalha: simula uma luta por turnos usando as stats base de cada
// Pokémon (a mesma fórmula de dano da série principal, simplificada) e a
// tabela oficial de efetividade de tipo vinda da própria PokeAPI.

const battleToggleButton = document.getElementById('toggleBattle');
const battleArena = document.getElementById('battleArena');

const fighter1Form = document.getElementById('fighter1Form');
const fighter1Input = document.getElementById('fighter1Input');
const fighter1Card = document.getElementById('fighter1Card');

const fighter2Form = document.getElementById('fighter2Form');
const fighter2Input = document.getElementById('fighter2Input');
const fighter2Card = document.getElementById('fighter2Card');

const fightButton = document.getElementById('fightButton');
const battleLog = document.getElementById('battleLog');

const HP_MULTIPLIER = 3; // dá fôlego pra luta durar alguns turnos
const LEVEL = 50;
const MOVE_POWER = 60;

let fighter1 = null;
let fighter2 = null;
let battleInProgress = false;
const typeRelationsCache = {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

battleToggleButton.addEventListener('click', () => {
    const isHidden = battleArena.style.display !== 'flex';
    battleArena.style.display = isHidden ? 'flex' : 'none';
    battleToggleButton.textContent = isHidden ? '🧭 Modo Pokédex' : '⚔️ Modo Batalha';
});

const fetchFighter = async (query) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${String(query).trim().toLowerCase()}`);
    if (APIResponse.status !== 200) return null;
    const data = await APIResponse.json();
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
    };
};

const renderFighterCard = (cardEl, fighter) => {
    const maxHp = fighter.stats.hp * HP_MULTIPLIER;
    fighter.maxHp = maxHp;
    fighter.currentHp = maxHp;
    fighter.cardEl = cardEl;

    cardEl.innerHTML = `
        <img src="${fighter.sprite}" alt="${fighter.name}" class="fighter-sprite">
        <p class="fighter-name">#${fighter.id} ${capitalize(fighter.name)}</p>
        <p class="fighter-types">
            ${fighter.types.map((type) => `<span class="type-badge" data-type="${type}">${type}</span>`).join('')}
        </p>
        <div class="hp-bar-container"><div class="hp-bar"></div></div>
        <p class="hp-text">${maxHp} / ${maxHp} HP</p>
    `;

    cardEl.querySelectorAll('.type-badge').forEach((badge) => {
        badge.style.backgroundColor = getTypeColor(badge.dataset.type);
    });
};

const updateHpBar = (fighter) => {
    const pct = Math.max(0, (fighter.currentHp / fighter.maxHp) * 100);
    const hpBar = fighter.cardEl.querySelector('.hp-bar');
    const hpText = fighter.cardEl.querySelector('.hp-text');
    hpBar.style.width = `${pct}%`;
    hpBar.classList.toggle('hp-low', pct <= 20);
    hpBar.classList.toggle('hp-mid', pct > 20 && pct <= 50);
    hpText.textContent = `${Math.max(0, Math.ceil(fighter.currentHp))} / ${fighter.maxHp} HP`;
};

const shakeCard = (fighter) => {
    fighter.cardEl.classList.remove('shake');
    void fighter.cardEl.offsetWidth; // força reflow pra animação poder rodar de novo
    fighter.cardEl.classList.add('shake');
};

const logMessage = (text) => {
    const p = document.createElement('p');
    p.textContent = text;
    battleLog.appendChild(p);
    battleLog.scrollTop = battleLog.scrollHeight;
};

const updateFightButtonState = () => {
    fightButton.disabled = !fighter1 || !fighter2 || battleInProgress;
};

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

// Cada Pokémon "ataca" com seu próprio tipo primário (bônus STAB garantido),
// escolhendo entre ATK/DEF ou S.ATK/S.DEF conforme seu maior stat ofensivo.
const calculateDamage = async (attacker, defender) => {
    const usesSpecial = attacker.stats.satk > attacker.stats.atk;
    const atkStat = usesSpecial ? attacker.stats.satk : attacker.stats.atk;
    const defStat = usesSpecial ? defender.stats.sdef : defender.stats.def;
    const attackType = attacker.types[0];
    const multiplier = await getTypeMultiplier(attackType, defender.types);

    const isCrit = Math.random() < 1 / 16;
    const randomFactor = 0.85 + Math.random() * 0.15;
    const stab = 1.5;

    let damage = (((2 * LEVEL) / 5 + 2) * MOVE_POWER * (atkStat / defStat)) / 50 + 2;
    damage = Math.floor(damage * stab * multiplier * (isCrit ? 1.5 : 1) * randomFactor);
    damage = multiplier === 0 ? 0 : Math.max(1, damage);

    return { damage, multiplier, isCrit, usesSpecial };
};

fighter1Form.addEventListener('submit', async (event) => {
    event.preventDefault();
    fighter1Card.innerHTML = '<p class="fighter-placeholder">Carregando...</p>';
    const data = await fetchFighter(fighter1Input.value);
    if (!data) {
        fighter1Card.innerHTML = '<p class="fighter-placeholder">Pokémon não encontrado :c</p>';
        fighter1 = null;
    } else {
        fighter1 = data;
        renderFighterCard(fighter1Card, fighter1);
    }
    updateFightButtonState();
});

fighter2Form.addEventListener('submit', async (event) => {
    event.preventDefault();
    fighter2Card.innerHTML = '<p class="fighter-placeholder">Carregando...</p>';
    const data = await fetchFighter(fighter2Input.value);
    if (!data) {
        fighter2Card.innerHTML = '<p class="fighter-placeholder">Pokémon não encontrado :c</p>';
        fighter2 = null;
    } else {
        fighter2 = data;
        renderFighterCard(fighter2Card, fighter2);
    }
    updateFightButtonState();
});

const runBattle = async () => {
    if (!fighter1 || !fighter2 || battleInProgress) return;
    battleInProgress = true;
    updateFightButtonState();
    battleLog.innerHTML = '';

    fighter1.currentHp = fighter1.maxHp;
    fighter2.currentHp = fighter2.maxHp;
    updateHpBar(fighter1);
    updateHpBar(fighter2);

    logMessage(`⚔️ ${capitalize(fighter1.name)} VS ${capitalize(fighter2.name)}!`);
    await sleep(500);

    const [first, second] = fighter1.stats.spd >= fighter2.stats.spd
        ? [fighter1, fighter2]
        : [fighter2, fighter1];
    logMessage(`${capitalize(first.name)} é mais rápido e ataca primeiro!`);
    await sleep(500);

    let round = 1;
    while (first.currentHp > 0 && second.currentHp > 0 && round <= 50) {
        for (const [attacker, defender] of [[first, second], [second, first]]) {
            if (attacker.currentHp <= 0 || defender.currentHp <= 0) break;

            const { damage, multiplier, isCrit, usesSpecial } = await calculateDamage(attacker, defender);
            defender.currentHp = Math.max(0, defender.currentHp - damage);
            updateHpBar(defender);
            shakeCard(defender);

            let message = `${usesSpecial ? '✨' : '👊'} ${capitalize(attacker.name)} ataca ${capitalize(defender.name)} e causa ${damage} de dano!`;
            if (isCrit) message += ' 💥 Golpe crítico!';
            if (multiplier > 1) message += ' Super efetivo!';
            else if (multiplier === 0) message += ' Não afeta o oponente...';
            else if (multiplier < 1) message += ' Não é muito efetivo...';
            logMessage(message);

            await sleep(900);

            if (defender.currentHp <= 0) {
                logMessage(`🏆 ${capitalize(attacker.name)} venceu a batalha!`);
                battleInProgress = false;
                updateFightButtonState();
                return;
            }
        }
        round += 1;
    }

    battleInProgress = false;
    updateFightButtonState();
};

fightButton.addEventListener('click', runBattle);
