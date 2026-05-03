const { randInt } = require('../helpers/utils');
const { getPlayer, savePlayer, isPolice, isInPrison } = require('../helpers/playerHelpers');

function actionFatigante(p) {
    const { advanceGameTime } = require('../helpers/gameTime');
    p.faim    = Math.max(0, p.faim    - 5);
    p.soif    = Math.max(0, p.soif    - (p.conjoint ? 3 : 5));
    p.energie = Math.max(0, p.energie - 5);
    advanceGameTime(30);
}

module.exports = {
    handlePatrolCommand(p, msg) {
        if (!isPolice(p)) return msg.reply("❌ Réservé à la police.");
        
        const prime = randInt(50, 200);
        p.fric += prime;
        actionFatigante(p);
        savePlayer(p);
        return msg.reply(`👮 Patrouille effectuée ! *+${prime}$*\n💰 ${p.fric}$`);
    },

    handleArrestCommand(p, msg) {
        if (!isPolice(p)) return msg.reply("❌ Réservé à la police.");
        
        const mention = msg.mentionedIds?.[0];
        if (!mention) return msg.reply("❌ *!arreter @joueur*");
        
        const cible = getPlayer(mention);
        if (!cible) return msg.reply("❌ Joueur introuvable.");
        if (cible.id === p.id) return msg.reply("🤡 Tu ne peux pas t'arrêter toi-même.");
        if (isInPrison(cible)) return msg.reply(`❌ *${cible.nom}* est déjà en prison.`);
        if (cible.wanted === 0) return msg.reply(`✅ *${cible.nom}* n'est pas recherché.`);

        const { getGameTick } = require('../helpers/gameTime');
        const gameTick = getGameTick();
        
        const prisonDuree = cible.wanted * 30;
        const prime = cible.wanted * 100;
        cible.prisonUntil = gameTick + prisonDuree;
        cible.wanted = 0;
        savePlayer(cible);
        p.fric += prime;
        savePlayer(p);
        return msg.reply(
            `👮 *${cible.nom}* arrêté et mis en prison !\n` +
            `⏳ Durée : ${prisonDuree} ticks\n` +
            `💰 Prime : *+${prime}$* | Solde : ${p.fric}$`
        );
    },
};
