const { getGameHour, getGameDay } = require('../helpers/gameTime');
const { getPlayer } = require('../helpers/playerHelpers');
const { stmts } = require('../db/queries');
const cryptoCommands = require('./cryptoCommands');

module.exports = {
    handleHelpCommand(msg) {
        return msg.reply(
`╔══════════════════════╗
🤖 ❖ *EMPIRE RPG* ❖ 🤖
╚══════════════════════╝

👤 *PROFIL*
• *!me* → Tes stats
• *!inv* → Inventaire
• *!manger* / *!boire* / *!soigner*

💼 *ÉCONOMIE*
• *!travailler* → Gagner ton salaire
• *!donner @mention montant*
• *!top* → Classement
• *!shop [catégorie]* → Boutique
• *!acheter ID* → Acheter
• *!banque* / *!deposer* / *!retirer*

🔫 *CRIME*
• *!voler @mention*
• *!wanted* → Niveau de recherche

👮 *POLICE*
• *!patrouille* / *!arreter @mention*

📈 *CRYPTO*
• *!bourse* / *!acheter_crypto qte* / *!vendre_crypto qte*

🛡️ *GANGS*
• *!creer_gang Nom* (5 000$)
• *!rejoindre_gang Nom* / *!quitter_gang* / *!mon_gang*

💍 *MARIAGE*
• *!marier @mention* / *!accepter* / *!divorce*

🎁 *!quiz* → Gagne des $`
        );
    },

    handleProfileCommand(p, msg) {
        const prixCrypto = cryptoCommands.getPrixCrypto();
        return msg.reply(
            `👤 *${p.nom}* [Niv.${p.niveau} — ${p.xp} XP]\n` +
            `🕒 ${getGameHour()} (Jour ${getGameDay()})\n` +
            `💼 ${p.job} | 💰 ${p.fric}$ | 🏦 ${p.banque}$\n` +
            `📈 Crypto : ${p.crypto} unités (≈${p.crypto * prixCrypto}$)\n` +
            `❤️ ${p.vie}% | 🍔 ${p.faim}% | 💧 ${p.soif}% | ⚡ ${p.energie}%\n` +
            `🦠 ${p.maladie || 'Aucune maladie'} | 🚨 Wanted ${p.wanted}/5\n` +
            `🛡️ Gang : ${p.gang || 'Aucun'} | 💍 ${p.conjoint ? (getPlayer(p.conjoint)?.nom ?? 'Inconnu') : 'Célibataire'}`
        );
    },

    handleRegistrationCommand(msg, senderId, safeName) {
        const { stmts } = require('../db/queries');
        const { getPlayer } = require('../helpers/playerHelpers');
        
        if (getPlayer(senderId)) return msg.reply('⚠️ Tu es déjà inscrit ! Tape *!me* pour tes stats.');
        
        stmts.insertPlayer.run({ id: senderId, nom: safeName });
        return msg.reply('🎮 Bienvenue dans l\'Empire ! Tape *!help* pour commencer.');
    },
};
