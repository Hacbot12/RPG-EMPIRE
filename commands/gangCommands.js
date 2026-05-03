const { getPlayer, savePlayer } = require('../helpers/playerHelpers');
const { stmts } = require('../db/queries');

module.exports = {
    handleCreateGangCommand(p, msg, bodyRaw) {
        const nom = bodyRaw.split(/\s+/).slice(1).join(' ').trim();
        if (!nom) return msg.reply("❌ *!creer_gang NomDuGang*");
        if (p.gang) return msg.reply("❌ Quitte ton gang d'abord avec *!quitter_gang*.");
        if (p.fric < 5000) return msg.reply("💸 Créer un gang coûte *5 000$*.");
        if (stmts.gangExists.get(nom)) return msg.reply("❌ Ce nom est déjà pris.");
        
        p.fric -= 5000;
        p.gang  = nom;
        savePlayer(p);
        stmts.insertGang.run({ nom, chef: p.id });
        stmts.insertMembre.run(nom, p.id);
        return msg.reply(`🛡️ Gang *${nom}* créé ! Tu en es le chef.\n💰 ${p.fric}$`);
    },

    handleJoinGangCommand(p, msg, bodyRaw) {
        const nom  = bodyRaw.split(/\s+/).slice(1).join(' ').trim();
        if (p.gang) return msg.reply("❌ Quitte ton gang actuel d'abord.");
        
        const gang = stmts.getGang.get(nom);
        if (!gang) return msg.reply("❌ Gang introuvable.");
        
        p.gang = gang.nom;
        savePlayer(p);
        stmts.insertMembre.run(gang.nom, p.id);
        return msg.reply(`🛡️ Tu as rejoint *${gang.nom}* !`);
    },

    handleLeaveGangCommand(p, msg) {
        if (!p.gang) return msg.reply("❌ Tu n'es dans aucun gang.");
        
        const gang    = stmts.getGang.get(p.gang);
        stmts.removeMembre.run(p.gang, p.id);
        
        if (gang && gang.chef === p.id) {
            const restants = stmts.getGangMembres.all(p.gang);
            if (restants.length > 0) stmts.updateGangChef.run(restants[0].playerId, p.gang);
            else stmts.deleteGang.run(p.gang);
        }
        
        p.gang = null;
        savePlayer(p);
        return msg.reply("👋 Tu as quitté ton gang.");
    },

    handleMyGangCommand(p, msg) {
        if (!p.gang) return msg.reply("❌ Tu n'es dans aucun gang.");
        
        const gang     = stmts.getGang.get(p.gang);
        if (!gang) return msg.reply("❌ Erreur : gang introuvable.");
        
        const membres  = stmts.getGangMembres.all(p.gang).map(r => getPlayer(r.playerId)?.nom ?? 'Inconnu');
        const chef     = getPlayer(gang.chef)?.nom ?? 'Inconnu';
        return msg.reply(
            `🛡️ *GANG : ${gang.nom}*\n👑 Chef : ${chef}\n👥 Membres (${membres.length}) : ${membres.join(', ')}\n💰 Trésor : ${gang.tresor}$`
        );
    },
};
