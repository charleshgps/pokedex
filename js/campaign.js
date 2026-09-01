// Modo Campanha: uma sequência fixa de "arenas" pra desafiar com o time 1
// montado na tela de Batalha. Reaproveita toda a engine de luta existente
// em battle.js (fetchFighter, runBattle, endBattle) — só troca quem entra
// no time 2 e escuta o evento pokedex:battleEnd pra avançar de estágio.

const CAMPAIGN_STAGES = [
    { nameKey: 'campaign.stage1Name', emoji: '🌿', team: ['bulbasaur', 'oddish', 'bellsprout'] },
    { nameKey: 'campaign.stage2Name', emoji: '💧', team: ['squirtle', 'poliwag', 'horsea'] },
    { nameKey: 'campaign.stage3Name', emoji: '⚡', team: ['pikachu', 'magnemite', 'voltorb'] },
    { nameKey: 'campaign.stage4Name', emoji: '🔥', team: ['charmander', 'growlithe', 'ponyta'] },
    { nameKey: 'campaign.stage5Name', emoji: '🏆', team: ['gyarados', 'alakazam', 'gengar', 'dragonite'] },
];

const battleModeFreeBtn = document.getElementById('battleModeFree');
const battleModeCampaignBtn = document.getElementById('battleModeCampaign');
const fighter2Controls = document.getElementById('fighter2Controls');
const fighter2ControlsFilters = document.getElementById('fighter2Controls-filters');
const campaignPanel = document.getElementById('campaignPanel');
const campaignStageLabel = document.getElementById('campaignStageLabel');
const campaignRestartButton = document.getElementById('campaignRestart');

const CAMPAIGN_STAGE_KEY = 'pokedexCampaignStage';
let campaignStageIndex = readJSON(CAMPAIGN_STAGE_KEY, 0);
let campaignMode = false;

const isCampaignComplete = () => campaignStageIndex >= CAMPAIGN_STAGES.length;

const updateCampaignLabel = () => {
    if (!campaignStageLabel) return;
    if (isCampaignComplete()) {
        campaignStageLabel.textContent = t('campaign.champion');
        return;
    }
    const stage = CAMPAIGN_STAGES[campaignStageIndex];
    campaignStageLabel.textContent = `${stage.emoji} ${t('campaign.stageLabel', {
        n: campaignStageIndex + 1,
        total: CAMPAIGN_STAGES.length,
        name: t(stage.nameKey),
    })}`;
};

// Carrega o time fixo do estágio atual dentro do time 2, reaproveitando
// exatamente as mesmas funções de render que o picker usa ao adicionar um
// Pokémon manualmente.
const loadCampaignStage = async (index) => {
    const stage = CAMPAIGN_STAGES[index];
    if (!stage || battleInProgress) return;

    team2.roster = [];
    team2.activeIndex = 0;
    fighter2Card.innerHTML = `<p class="fighter-placeholder">${t('battle.loadingFighter')}</p>`;
    roster2Strip.innerHTML = '';
    updateFightButtonState();

    for (const name of stage.team) {
        const fighter = await fetchFighter(name);
        if (fighter) team2.roster.push(fighter);
    }

    if (team2.roster.length > 0) {
        team2.activeIndex = 0;
        renderFighterCard(fighter2Card, team2.roster[0]);
        renderRosterStrip(roster2Strip, team2);
    }
    updateFightButtonState();
};

const setCampaignMode = (on) => {
    campaignMode = on;
    if (battleModeFreeBtn) battleModeFreeBtn.classList.toggle('active', !on);
    if (battleModeCampaignBtn) battleModeCampaignBtn.classList.toggle('active', on);
    if (fighter2Controls) fighter2Controls.hidden = on;
    if (fighter2ControlsFilters) fighter2ControlsFilters.hidden = on;
    if (campaignPanel) campaignPanel.hidden = !on;
    updateCampaignLabel();
    if (on && !isCampaignComplete()) loadCampaignStage(campaignStageIndex);
};

if (battleModeFreeBtn) battleModeFreeBtn.addEventListener('click', () => setCampaignMode(false));
if (battleModeCampaignBtn) battleModeCampaignBtn.addEventListener('click', () => setCampaignMode(true));

if (campaignRestartButton) {
    campaignRestartButton.addEventListener('click', () => {
        campaignStageIndex = 0;
        writeJSON(CAMPAIGN_STAGE_KEY, campaignStageIndex);
        updateCampaignLabel();
        loadCampaignStage(campaignStageIndex);
    });
}

document.addEventListener('pokedex:battleEnd', (event) => {
    if (!campaignMode || isCampaignComplete()) return;

    if (event.detail.winnerIsTeam1) {
        campaignStageIndex += 1;
        writeJSON(CAMPAIGN_STAGE_KEY, campaignStageIndex);
        logMessage(t('campaign.stageCleared'));
        updateCampaignLabel();
        if (isCampaignComplete()) {
            unlockAchievement('campaign_champion');
        } else {
            loadCampaignStage(campaignStageIndex);
        }
    } else {
        logMessage(t('campaign.defeated'));
        loadCampaignStage(campaignStageIndex); // não retrocede — deixa tentar de novo
    }
});

// Se o usuário resetar os times enquanto está na campanha, recarrega o
// estágio atual em vez de deixar o time 2 vazio.
document.addEventListener('pokedex:teamsReset', () => {
    if (campaignMode && !isCampaignComplete()) loadCampaignStage(campaignStageIndex);
});

document.addEventListener('pokedex:langChange', updateCampaignLabel);

updateCampaignLabel();
