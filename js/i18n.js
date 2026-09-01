// Sistema de tradução pt-BR / en-US. Textos estáticos do HTML usam os
// atributos data-i18n* (aplicados por applyI18n); textos gerados via JS
// (mensagens de batalha, conquistas, etc.) chamam t(chave, variáveis).
// Guarda a escolha no localStorage e dispara 'pokedex:langChange' no
// document sempre que muda, pra cada módulo poder re-renderizar o que já
// tinha desenhado na tela antes da troca.

const LANG_KEY = 'pokedexLang';
let currentLang = readJSON(LANG_KEY, 'pt');

const I18N = {
    pt: {
        'menu.subtitle': 'Explore, batalhe, divirta-se',
        'menu.pokedex': '📖 Pokédex',
        'menu.battle': '⚔️ Batalha',
        'menu.quiz': '🎯 Quiz',
        'menu.achievements': '🏆 Conquistas',
        'menu.hallOfFame': '🏅 Hall da Fama',
        'menu.themeTitle': 'Alternar tema',
        'menu.langTitle': 'Idioma / Language',

        'common.backMenu': '🏠 Menu',
        'common.loading': 'Carregando...',

        'pokedex.shinyTitle': 'Alternar sprite shiny',
        'pokedex.soundTitle': 'Ativar/desativar som',
        'pokedex.volumeTitle': 'Volume do som',
        'pokedex.searchPlaceholder': '🔍 Nome ou número',
        'pokedex.prev': ' < Prev ',
        'pokedex.next': ' Next > ',
        'pokedex.loadingName': 'Carregando...',
        'pokedex.notFound': 'Não encontrado :c',
        'pokedex.favoriteAdd': 'Favoritar',
        'pokedex.favoriteRemove': 'Remover dos favoritos',
        'pokedex.tabAbout': 'Sobre',
        'pokedex.tabWeaknesses': 'Fraquezas',
        'pokedex.tabEvolution': 'Evolução',
        'pokedex.tabFavorites': '⭐ Favoritos',
        'pokedex.noDescription': 'Descrição não encontrada.',
        'pokedex.noEvolution': 'Esse Pokémon não evolui.',
        'pokedex.favoritesEmpty': 'Nenhum favorito ainda. Toque na estrela ☆ pra adicionar!',
        'pokedex.weak': 'Fraco contra (x2 ou mais)',
        'pokedex.resist': 'Resiste a (x0.5 ou menos)',
        'pokedex.immune': 'Imune a',
        'pokedex.noWeaknesses': 'Sem fraquezas nem resistências notáveis.',
        'pokedex.evolvesInto': 'evolui para',

        'battle.title': 'Arena de Batalha ⚔️',
        'battle.subtitle': 'Monte um time de 1 a 6 Pokémon pra cada lado',
        'battle.typeFilter': 'Tipo',
        'battle.genFilter': 'Geração',
        'battle.categoryFilter': 'Categoria',
        'battle.categoryLegendary': 'Lendário',
        'battle.categoryMythical': 'Mítico',
        'battle.categoryNormal': 'Comum',
        'battle.addPlaceholder': 'Adicionar Pokémon',
        'battle.addButton': '+ Add',
        'battle.random': '🎲 Aleatório',
        'battle.placeholder': '❔<br>Monte seu time (1 a 6)',
        'battle.notFound': '❔<br>Pokémon não encontrado :c',
        'battle.loadingFighter': 'Carregando...',
        'battle.fight': 'Lutar! 🔥',
        'battle.resetTeams': '🔄 Reiniciar times',
        'battle.modeFree': '⚔️ Livre',
        'battle.modeCampaign': '🏅 Campanha',
        'battle.teamFullWarn': '⚠️ Esse time já tem o máximo de {max} Pokémon.',
        'battle.team1Label': 'Time 1',
        'battle.team2Label': 'Time 2',
        'battle.log.start': '⚔️ Time 1 ({count1} Pokémon) VS Time 2 ({count2} Pokémon)!',
        'battle.log.switch': '🔄 {label} manda {name} para a batalha!',
        'battle.log.attack': '{emoji} {attacker} usou {move}! Causa {damage} de dano em {defender}.',
        'battle.log.crit': ' 💥 Crítico!',
        'battle.log.struggle': ' 😖 Não afeta, tenta um golpe de desespero!',
        'battle.log.superEffective': ' Super efetivo!',
        'battle.log.notVeryEffective': ' Pouco efetivo...',
        'battle.log.win': '🏆 {label} venceu com {name}!',
        'battle.log.noCandidates': '⚠️ Nenhum Pokémon encontrado com esses filtros.',

        'quiz.title': 'Quem é esse Pokémon? 🎯',
        'quiz.scoreLabel': 'Acertos',
        'quiz.streakLabel': 'Sequência',
        'quiz.guessPlaceholder': 'Nome do Pokémon',
        'quiz.guessButton': 'Palpite',
        'quiz.next': 'Próximo ➡️',
        'quiz.correct': '✅ Isso mesmo, é {name}!',
        'quiz.wrong': '❌ Não! Era {name}.',
        'quiz.loadError': 'Erro ao carregar o Pokémon misterioso, tente de novo.',
        'quiz.modeVisual': '👁️ Visual',
        'quiz.modeSound': '🔊 Som',
        'quiz.modeTimed': '⏱️ Contrarrelógio',
        'quiz.timeLeft': 'Tempo: {s}s',
        'quiz.timeUp': '⏰ Tempo esgotado! Pontuação final: {score}',
        'quiz.newRecord': '🏆 Novo recorde!',
        'quiz.leaderboardTitle': 'Melhores pontuações',
        'quiz.leaderboardEmpty': 'Nenhuma pontuação ainda.',
        'quiz.playAgain': '🔁 Jogar de novo',
        'quiz.replayCry': '🔊 Ouvir de novo',
        'quiz.soundPrompt': 'Ouça o grito e adivinhe quem é!',
        'quiz.startTimed': '▶️ Começar (60s)',

        'achievements.title': 'Conquistas 🏆',
        'achievements.unlockedToast': 'Conquista desbloqueada!',

        'hallOfFame.title': 'Hall da Fama 🏅',
        'hallOfFame.empty': 'Nenhuma vitória registrada ainda. Vença uma batalha!',
        'hallOfFame.clear': '🗑️ Limpar histórico',
        'hallOfFame.count': '{count} vitória(s) registrada(s)',
        'hallOfFame.wonAgainst': 'venceu {opponent} em {date}',

        'campaign.stageLabel': 'Estágio {n}/{total}: {name}',
        'campaign.opponentPreview': 'Adversários deste estágio:',
        'campaign.champion': '🏆 Você é o Campeão da Liga!',
        'campaign.defeated': '😵 Seu time foi derrotado neste estágio. Tente de novo!',
        'campaign.restart': '🔄 Reiniciar campanha',
        'campaign.needTeam': '⚠️ Monte pelo menos 1 Pokémon no seu time pra jogar a campanha.',
        'campaign.stageCleared': '✅ Estágio vencido! Avançando...',
        'campaign.completeSubtitle': 'Você venceu todos os estágios!',
        'campaign.stage1Name': 'Arena Grama',
        'campaign.stage2Name': 'Arena Água',
        'campaign.stage3Name': 'Arena Elétrica',
        'campaign.stage4Name': 'Arena de Fogo',
        'campaign.stage5Name': 'Liga Campeã',

        'battle.gen1': 'Geração 1 (Kanto)',
        'battle.gen2': 'Geração 2 (Johto)',
        'battle.gen3': 'Geração 3 (Hoenn)',
        'battle.gen4': 'Geração 4 (Sinnoh)',
        'battle.gen5': 'Geração 5 (Unova)',
        'battle.gen6': 'Geração 6 (Kalos)',
        'battle.gen7': 'Geração 7 (Alola)',
        'battle.gen8': 'Geração 8 (Galar)',
        'battle.gen9': 'Geração 9 (Paldea)',

        'achievements.first_view.name': 'Primeira Vista',
        'achievements.first_view.desc': 'Veja seu primeiro Pokémon na Pokédex',
        'achievements.explorer_10.name': 'Explorador',
        'achievements.explorer_10.desc': 'Veja 10 Pokémon diferentes',
        'achievements.explorer_50.name': 'Mestre Pokédex',
        'achievements.explorer_50.desc': 'Veja 50 Pokémon diferentes',
        'achievements.shiny_hunter.name': 'Caçador de Shiny',
        'achievements.shiny_hunter.desc': 'Ative o modo shiny',
        'achievements.shiny_luck.name': 'Sortudo',
        'achievements.shiny_luck.desc': 'Encontre um shiny raro por acaso (1 em 100!)',
        'achievements.first_battle.name': 'Primeira Luta',
        'achievements.first_battle.desc': 'Vença uma batalha',
        'achievements.battle_veteran.name': 'Veterano de Batalha',
        'achievements.battle_veteran.desc': 'Vença 10 batalhas',
        'achievements.win_streak_3.name': 'Sequência Quente',
        'achievements.win_streak_3.desc': 'O mesmo Pokémon vence 3 batalhas seguidas',
        'achievements.quiz_5.name': 'Bom Adivinhador',
        'achievements.quiz_5.desc': 'Acerte 5 respostas no Quiz',
        'achievements.favorite_first.name': 'Fã de Carteirinha',
        'achievements.favorite_first.desc': 'Favorite seu primeiro Pokémon',
        'achievements.favorite_10.name': 'Colecionador',
        'achievements.favorite_10.desc': 'Favorite 10 Pokémon',
        'achievements.campaign_champion.name': 'Campeão da Liga',
        'achievements.campaign_champion.desc': 'Vença o Modo Campanha inteiro',
        'achievements.quiz_sound_5.name': 'Ouvido Treinado',
        'achievements.quiz_sound_5.desc': 'Acerte 5 respostas no Quiz por som',
        'achievements.quiz_speedster.name': 'Raio Veloz',
        'achievements.quiz_speedster.desc': 'Marque 10 pontos ou mais no Contrarrelógio',
    },
    en: {
        'menu.subtitle': 'Explore, battle, have fun',
        'menu.pokedex': '📖 Pokédex',
        'menu.battle': '⚔️ Battle',
        'menu.quiz': '🎯 Quiz',
        'menu.achievements': '🏆 Achievements',
        'menu.hallOfFame': '🏅 Hall of Fame',
        'menu.themeTitle': 'Toggle theme',
        'menu.langTitle': 'Idioma / Language',

        'common.backMenu': '🏠 Menu',
        'common.loading': 'Loading...',

        'pokedex.shinyTitle': 'Toggle shiny sprite',
        'pokedex.soundTitle': 'Toggle sound',
        'pokedex.volumeTitle': 'Sound volume',
        'pokedex.searchPlaceholder': '🔍 Name or number',
        'pokedex.prev': ' < Prev ',
        'pokedex.next': ' Next > ',
        'pokedex.loadingName': 'Loading...',
        'pokedex.notFound': 'Not found :c',
        'pokedex.favoriteAdd': 'Add to favorites',
        'pokedex.favoriteRemove': 'Remove from favorites',
        'pokedex.tabAbout': 'About',
        'pokedex.tabWeaknesses': 'Weaknesses',
        'pokedex.tabEvolution': 'Evolution',
        'pokedex.tabFavorites': '⭐ Favorites',
        'pokedex.noDescription': 'Description not found.',
        'pokedex.noEvolution': "This Pokémon doesn't evolve.",
        'pokedex.favoritesEmpty': 'No favorites yet. Tap the ☆ star to add one!',
        'pokedex.weak': 'Weak to (x2 or more)',
        'pokedex.resist': 'Resists (x0.5 or less)',
        'pokedex.immune': 'Immune to',
        'pokedex.noWeaknesses': 'No notable weaknesses or resistances.',
        'pokedex.evolvesInto': 'evolves into',

        'battle.title': 'Battle Arena ⚔️',
        'battle.subtitle': 'Build a team of 1 to 6 Pokémon for each side',
        'battle.typeFilter': 'Type',
        'battle.genFilter': 'Generation',
        'battle.categoryFilter': 'Category',
        'battle.categoryLegendary': 'Legendary',
        'battle.categoryMythical': 'Mythical',
        'battle.categoryNormal': 'Common',
        'battle.addPlaceholder': 'Add Pokémon',
        'battle.addButton': '+ Add',
        'battle.random': '🎲 Random',
        'battle.placeholder': '❔<br>Build your team (1 to 6)',
        'battle.notFound': '❔<br>Pokémon not found :c',
        'battle.loadingFighter': 'Loading...',
        'battle.fight': 'Fight! 🔥',
        'battle.resetTeams': '🔄 Reset teams',
        'battle.modeFree': '⚔️ Free',
        'battle.modeCampaign': '🏅 Campaign',
        'battle.teamFullWarn': '⚠️ This team already has the max of {max} Pokémon.',
        'battle.team1Label': 'Team 1',
        'battle.team2Label': 'Team 2',
        'battle.log.start': '⚔️ Team 1 ({count1} Pokémon) VS Team 2 ({count2} Pokémon)!',
        'battle.log.switch': '🔄 {label} sends {name} into battle!',
        'battle.log.attack': '{emoji} {attacker} used {move}! Deals {damage} damage to {defender}.',
        'battle.log.crit': ' 💥 Critical hit!',
        'battle.log.struggle': ' 😖 No effect, tries a desperate move!',
        'battle.log.superEffective': ' Super effective!',
        'battle.log.notVeryEffective': ' Not very effective...',
        'battle.log.win': '🏆 {label} won with {name}!',
        'battle.log.noCandidates': '⚠️ No Pokémon found with these filters.',

        'quiz.title': "Who's that Pokémon? 🎯",
        'quiz.scoreLabel': 'Score',
        'quiz.streakLabel': 'Streak',
        'quiz.guessPlaceholder': 'Pokémon name',
        'quiz.guessButton': 'Guess',
        'quiz.next': 'Next ➡️',
        'quiz.correct': "✅ That's right, it's {name}!",
        'quiz.wrong': '❌ Nope! It was {name}.',
        'quiz.loadError': 'Error loading the mystery Pokémon, try again.',
        'quiz.modeVisual': '👁️ Visual',
        'quiz.modeSound': '🔊 Sound',
        'quiz.modeTimed': '⏱️ Time Attack',
        'quiz.timeLeft': 'Time: {s}s',
        'quiz.timeUp': "⏰ Time's up! Final score: {score}",
        'quiz.newRecord': '🏆 New record!',
        'quiz.leaderboardTitle': 'Best scores',
        'quiz.leaderboardEmpty': 'No scores yet.',
        'quiz.playAgain': '🔁 Play again',
        'quiz.replayCry': '🔊 Listen again',
        'quiz.soundPrompt': 'Listen to the cry and guess who it is!',
        'quiz.startTimed': '▶️ Start (60s)',

        'achievements.title': 'Achievements 🏆',
        'achievements.unlockedToast': 'Achievement unlocked!',

        'hallOfFame.title': 'Hall of Fame 🏅',
        'hallOfFame.empty': 'No wins recorded yet. Win a battle!',
        'hallOfFame.clear': '🗑️ Clear history',
        'hallOfFame.count': '{count} win(s) recorded',
        'hallOfFame.wonAgainst': 'beat {opponent} on {date}',

        'campaign.stageLabel': 'Stage {n}/{total}: {name}',
        'campaign.opponentPreview': "This stage's opponents:",
        'campaign.champion': "🏆 You're the League Champion!",
        'campaign.defeated': '😵 Your team was defeated at this stage. Try again!',
        'campaign.restart': '🔄 Restart campaign',
        'campaign.needTeam': '⚠️ Build at least 1 Pokémon on your team to play the campaign.',
        'campaign.stageCleared': '✅ Stage cleared! Advancing...',
        'campaign.completeSubtitle': 'You beat every stage!',
        'campaign.stage1Name': 'Grass Gym',
        'campaign.stage2Name': 'Water Gym',
        'campaign.stage3Name': 'Electric Gym',
        'campaign.stage4Name': 'Fire Gym',
        'campaign.stage5Name': 'Champion League',

        'battle.gen1': 'Generation 1 (Kanto)',
        'battle.gen2': 'Generation 2 (Johto)',
        'battle.gen3': 'Generation 3 (Hoenn)',
        'battle.gen4': 'Generation 4 (Sinnoh)',
        'battle.gen5': 'Generation 5 (Unova)',
        'battle.gen6': 'Generation 6 (Kalos)',
        'battle.gen7': 'Generation 7 (Alola)',
        'battle.gen8': 'Generation 8 (Galar)',
        'battle.gen9': 'Generation 9 (Paldea)',

        'achievements.first_view.name': 'First Sight',
        'achievements.first_view.desc': 'See your first Pokémon in the Pokédex',
        'achievements.explorer_10.name': 'Explorer',
        'achievements.explorer_10.desc': 'See 10 different Pokémon',
        'achievements.explorer_50.name': 'Pokédex Master',
        'achievements.explorer_50.desc': 'See 50 different Pokémon',
        'achievements.shiny_hunter.name': 'Shiny Hunter',
        'achievements.shiny_hunter.desc': 'Turn on shiny mode',
        'achievements.shiny_luck.name': 'Lucky One',
        'achievements.shiny_luck.desc': 'Find a rare shiny by chance (1 in 100!)',
        'achievements.first_battle.name': 'First Fight',
        'achievements.first_battle.desc': 'Win a battle',
        'achievements.battle_veteran.name': 'Battle Veteran',
        'achievements.battle_veteran.desc': 'Win 10 battles',
        'achievements.win_streak_3.name': 'Hot Streak',
        'achievements.win_streak_3.desc': 'The same Pokémon wins 3 battles in a row',
        'achievements.quiz_5.name': 'Good Guesser',
        'achievements.quiz_5.desc': 'Get 5 correct answers in the Quiz',
        'achievements.favorite_first.name': 'Card-Carrying Fan',
        'achievements.favorite_first.desc': 'Favorite your first Pokémon',
        'achievements.favorite_10.name': 'Collector',
        'achievements.favorite_10.desc': 'Favorite 10 Pokémon',
        'achievements.campaign_champion.name': 'League Champion',
        'achievements.campaign_champion.desc': 'Beat the whole Campaign Mode',
        'achievements.quiz_sound_5.name': 'Trained Ear',
        'achievements.quiz_sound_5.desc': 'Get 5 correct answers in Sound Quiz mode',
        'achievements.quiz_speedster.name': 'Speedster',
        'achievements.quiz_speedster.desc': 'Score 10 or more in Time Attack mode',
    },
};

// Devolve a tradução de `key` no idioma atual (cai pro pt como fallback e,
// na falta de tudo, devolve a própria chave pra nunca quebrar a tela).
// `vars`, se passado, substitui placeholders {nome} no texto.
const t = (key, vars) => {
    let str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.pt[key] || key;
    if (vars) {
        Object.entries(vars).forEach(([name, value]) => {
            str = str.replace(new RegExp(`\\{${name}\\}`, 'g'), value);
        });
    }
    return str;
};

// Aplica as traduções em todo elemento marcado com data-i18n* no HTML.
const applyI18n = () => {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        el.innerHTML = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'pt-BR';
};

const langToggleButton = document.getElementById('langToggle');

const setLang = (lang) => {
    currentLang = lang;
    writeJSON(LANG_KEY, lang);
    if (langToggleButton) langToggleButton.textContent = lang === 'en' ? '🇧🇷' : '🇺🇸';
    applyI18n();
    document.dispatchEvent(new CustomEvent('pokedex:langChange'));
};

if (langToggleButton) {
    langToggleButton.textContent = currentLang === 'en' ? '🇧🇷' : '🇺🇸';
    langToggleButton.addEventListener('click', () => setLang(currentLang === 'en' ? 'pt' : 'en'));
}

applyI18n();
