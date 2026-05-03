const { getPlayer, savePlayer } = require('../helpers/playerHelpers');

module.exports = {
    handleMarriageCommand(p, msg) {
        const mention = msg.mentionedIds?.[0];
        if (!mention) return msg.reply("❌ *!marier @joueur*");
        
        if (p.conjoint) {
            const conjointActuel = getPlayer(p.conjoint);
            return msg.reply(`❌ Tu es déjà marié(e) avec *${conjointActuel?.nom ?? 'quelqu\'un'}*.`);
        }
        
        const cible = getPlayer(mention);
        if (!cible || cible.id === p.id) return msg.reply("❌ Cible invalide.");
        if (cible.conjoint) return msg.reply(`❌ *${cible.nom}* est déjà marié(e).`);
        
        cible.demandeMarriage = p.id;
        savePlayer(cible);
        return msg.reply(`💍 Demande envoyée à *${cible.nom}* !\nIl/elle doit taper *!accepter*.`);
    },

    handleAcceptMarriageCommand(p, msg) {
        if (!p.demandeMarriage) return msg.reply("❌ Aucune demande en attente.");
        
        const partenaire = getPlayer(p.demandeMarriage);
        if (!partenaire) return msg.reply("❌ Le demandeur n'est plus inscrit.");
        
        p.conjoint = partenaire.id;
        p.demandeMarriage = null;
        partenaire.conjoint = p.id;
        
        savePlayer(p);
        savePlayer(partenaire);
        return msg.reply(`💍 *${p.nom}* & *${partenaire.nom}* sont mariés ! 🎉`);
    },

    handleDivorceCommand(p, msg) {
        if (!p.conjoint) return msg.reply("❌ Tu n'es pas marié(e).");
        
        const ex = getPlayer(p.conjoint);
        if (ex) {
            ex.conjoint = null;
            savePlayer(ex);
        }
        
        p.conjoint = null;
        savePlayer(p);
        return msg.reply(`💔 Divorce prononcé. Tu es célibataire.`);
    },
};
