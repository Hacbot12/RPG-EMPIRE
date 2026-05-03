const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// ──────────────────────────────────────────────────
// CRASH HANDLING
// ──────────────────────────────────────────────────
process.on('uncaughtException', err => console.error('🚨 CRASH ÉVITÉ:', err));
process.on('unhandledRejection', err => console.error('🚨 ERREUR PROMESSE:', err));

// ──────────────────────────────────────────────────
// DATABASE INITIALIZATION
// ──────────────────────────────────────────────────
const db = require('./config/database');
const { initializeSchema } = require('./db/schema');
initializeSchema();

// ──────────────────────────────────────────────────
// IMPORTS
// ──────────────────────────────────────────────────
const { getPlayer, savePlayer, createPlayer, isInPrison } = require('./helpers/playerHelpers');
const { getGameHour, getGameDay, getGameTick, advanceGameTime } = require('./helpers/gameTime');
const { randInt, clamp } = require('./helpers/utils');
const { stmts } = require('./db/queries');
const { JOBS, SHOP } = require('./config/constants');

// Command modules
const profileCommands = require('./commands/profileCommands');
const economyCommands = require('./commands/economyCommands');
const crimeCommands = require('./commands/crimeCommands');
const policeCommands = require('./commands/policeCommands');
const gangCommands = require('./commands/gangCommands');
const marriageCommands = require('./commands/marriageCommands');
const quizCommands = require('./commands/quizCommands');
const cryptoCommands = require('./commands/cryptoCommands');

// ──────────────────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────────────────
const MALADIES = ['Grippe', 'Paludisme', 'Virus-Z', 'Fatigue Chronique'];

function safeNameFromMsg(msg) {
    return msg._data?.notifyName || msg.pushname || 'Joueur';
}

function actionFatigante(p) {
    p.faim    = Math.max(0, p.faim    - 5);
    p.soif    = Math.max(0, p.soif    - (p.conjoint ? 3 : 5));
    p.energie = Math.max(0, p.energie - 5);
    advanceGameTime(30);
}

// ──────────────────────────────────────────────────
// WHATSAPP CLIENT
// ──────────────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth(),
    authTimeoutMs: 60000,
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'] },
});

client.on('qr', qr => qrcode.generate(qr, { small: true }));
client.on('ready', () => {
    console.log('🚀 EMPIRE RPG → BOT DÉMARRÉ AVEC SQLITE !');
    client.pupPage?.evaluate(() => {
        window.Store?.StatusUtils && (window.Store.StatusUtils.canCheckStatusRankingPosterGating = () => false);
    }).catch(() => {});
});
client.on('auth_failure', () => console.error('❌ Échec authentification WhatsApp'));
client.on('disconnected', reason => console.warn('⚠️ Bot déconnecté:', reason));

// ──────────────────────────────────────────────────
// MAIN MESSAGE HANDLER
// ──────────────────────────────────────────────────
client.on('message', async (msg) => {
    // Ignore status, broadcast, and bot's own messages
    if (msg.from === 'status@broadcast') return;
    if (msg.fromMe) return;
    if (msg.isStatus) return;

    const senderId = msg.author || msg.from;
    const bodyRaw  = (msg.body || '').trim();
    const body     = bodyRaw.toLowerCase();

    // Ignore empty/too long messages and non-commands (except quiz replies)
    const isQuizReply = body === 'oui' || body === 'non';
    if (!body || body.length > 300) return;
    if (!body.startsWith('!') && !isQuizReply) return;

    // ──────────────────────────────────────────────────
    // REGISTRATION
    // ──────────────────────────────────────────────────
    if (body === '!reg') {
        return profileCommands.handleRegistrationCommand(msg, senderId, safeNameFromMsg(msg));
    }

    // Get or create player
    let p = getPlayer(senderId);
    
    // Silently ignore quiz replies from unregistered users
    if (!p && isQuizReply) return;
    
    // Require registration for all other commands
    if (!p) return msg.reply('❌ Tu n\'es pas inscrit. Tape *!reg* pour rejoindre l\'Empire !');

    // Auto-release from prison if time has passed
    if (isInPrison(p) && getGameTick() >= p.prisonUntil) {
        p.prisonUntil = null;
        savePlayer(p);
    }

    // ──────────────────────────────────────────────────
    // HELP & PROFILE COMMANDS
    // ──────────────────────────────────────────────────
    if (body === '!help') return profileCommands.handleHelpCommand(msg);
    if (body === '!me' || body === '!etat') return profileCommands.handleProfileCommand(p, msg);

    // ──────────────────────────────────────────────────
    // INVENTORY & SHOP
    // ──────────────────────────────────────────────────
    if (body === '!inv') return economyCommands.handleInventoryCommand(p, msg);
    if (body === '!shop' || body.startsWith('!shop ')) return economyCommands.handleShopCommand(msg, bodyRaw);
    if (/^!(acheter|buy)\s+\d+$/.test(body)) return economyCommands.handleBuyCommand(p, msg, body);
    if (['!manger', '!boire', '!soigner'].includes(body)) return economyCommands.handleConsumeCommand(p, msg, body);

    // ──────────────────────────────────────────────────
    // WORK & ECONOMY
    // ──────────────────────────────────────────────────
    if (body === '!travailler') {
        if (isInPrison(p)) return msg.reply("🔒 Tu es en prison !");
        return economyCommands.handleWorkCommand(p, msg);
    }

    if (body === '!banque' || body.startsWith('!deposer ') || body.startsWith('!retirer ')) {
        return economyCommands.handleBankCommand(p, msg, body);
    }

    if (body.startsWith('!donner ')) return economyCommands.handleTransferCommand(p, msg, bodyRaw);
    if (body === '!top') return economyCommands.handleTopCommand(msg);

    // ──────────────────────────────────────────────────
    // CRYPTO
    // ──────────────────────────────────────────────────
    if (body === '!bourse') return cryptoCommands.handleBourseCommand(p, msg);
    if (body.startsWith('!acheter_crypto ')) return cryptoCommands.handleBuyCryptoCommand(p, msg, body);
    if (body.startsWith('!vendre_crypto ')) return cryptoCommands.handleSellCryptoCommand(p, msg, body);

    // ──────────────────────────────────────────────────
    // CRIME & WANTED
    // ──────────────────────────────────────────────────
    if (body === '!wanted') return crimeCommands.handleWantedCommand(p, msg);
    if (body.startsWith('!voler')) {
        if (isInPrison(p)) return msg.reply("🔒 Tu es en prison !");
        return crimeCommands.handleTheftCommand(p, msg);
    }

    // ──────────────────────────────────────────────────
    // POLICE
    // ──────────────────────────────────────────────────
    if (body === '!patrouille') return policeCommands.handlePatrolCommand(p, msg);
    if (body.startsWith('!arreter')) return policeCommands.handleArrestCommand(p, msg);

    // ──────────────────────────────────────────────────
    // GANGS
    // ──────────────────────────────────────────────────
    if (body.startsWith('!creer_gang ')) return gangCommands.handleCreateGangCommand(p, msg, bodyRaw);
    if (body.startsWith('!rejoindre_gang ')) return gangCommands.handleJoinGangCommand(p, msg, bodyRaw);
    if (body === '!quitter_gang') return gangCommands.handleLeaveGangCommand(p, msg);
    if (body === '!mon_gang') return gangCommands.handleMyGangCommand(p, msg);

    // ──────────────────────────────────────────────────
    // MARRIAGE
    // ──────────────────────────────────────────────────
    if (body.startsWith('!marier')) return marriageCommands.handleMarriageCommand(p, msg);
    if (body === '!accepter') return marriageCommands.handleAcceptMarriageCommand(p, msg);
    if (body === '!divorce') return marriageCommands.handleDivorceCommand(p, msg);

    // ──────────────────────────────────────────────────
    // QUIZ
    // ──────────────────────────────────────────────────
    if (body === '!quiz') return quizCommands.handleQuizCommand(p, msg);
    if ((body === 'oui' || body === 'non') && p.currentQuiz) {
        return quizCommands.handleQuizAnswerCommand(p, msg, body);
    }
});

// ──────────────────────────────────────────────────
// START BOT
// ──────────────────────────────────────────────────
client.initialize();
