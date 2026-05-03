const { randInt, clamp } = require('../helpers/utils');
const { getPlayer, savePlayer, isInPrison } = require('../helpers/playerHelpers');
const { stmts, transferMoney } = require('../db/queries');

function actionFatigante(p) {
    const { advanceGameTime } = require('../helpers/gameTime');
    p.faim    = Math.max(0, p.faim    - 5);
    p.soif    = Math.max(0, p.soif    - (p.conjoint ? 3 : 5));
    p.energie = Math.max(0, p.energie - 5);
    advanceGameTime(30);
}

module.exports = {
    handleWantedCommand(p, msg) {
        const stars = '⭐'.repeat(p.wanted) + '☆'.repeat(5 - p.wanted);
        return msg.reply(`🚨 *WANTED : ${p.wanted}/5*\n${stars}`);
    },

    handleTheftCommand(p, msg) {
        if (isInPrison(p)) return msg.reply("🔒 Tu es en prison !");
        
        const mention = msg.mentionedIds?.[0];
        if (!mention) return msg.reply("❌ *!voler @joueur*");
        
        const cible = getPlayer(mention);
        if (!cible) return msg.reply("❌ Ce joueur n'est pas inscrit.");
        if (cible.id === p.id) return msg.reply("🤡 Tu ne peux pas te voler toi-même.");
        if (isInPrison(cible)) return msg.reply("❌ Cette personne est en prison, laisse-la tranquille !");
        if (cible.fric <= 0) return msg.reply(`💸 *${cible.nom}* n'a rien à voler.`);

        if (Math.random() < 0.4) {
            const vol = randInt(10, Math.min(500, Math.floor(cible.fric * 0.2)));
            transferMoney(cible.id, p.id, vol);
            p.wanted  = clamp(p.wanted + 1, 0, 5);
            actionFatigante(p);
            savePlayer(p);
            return msg.reply(
                `🔫 Braquage réussi !\n` +
                `💰 *+${vol}$* volés à *${cible.nom}*\n` +
                `💵 Ton solde : ${p.fric}$\n` +
                `🚨 Wanted : ${p.wanted}/5`
            );
        } else {
            p.wanted      = clamp(p.wanted + 1, 0, 5);
            p.prisonUntil = p.prisonUntil || 0; // Initialize if needed
            p.prisonUntil += 60; // Will be adjusted with gameTick elsewhere
            actionFatigante(p);
            savePlayer(p);
            return msg.reply(
                `👮 Raté ! La police t'a chopé !\n` +
                `🔒 Prison pendant 60 ticks\n` +
                `🚨 Wanted : ${p.wanted}/5`
            );
        }
    },
};
