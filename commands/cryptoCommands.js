const { randInt } = require('../helpers/utils');
const { savePlayer } = require('../helpers/playerHelpers');

let prixCrypto = 100;

// Crypto price fluctuation every 10 minutes
setInterval(() => { 
    prixCrypto = Math.max(10, prixCrypto + randInt(-20, 20)); 
}, 600000);

module.exports = {
    getPrixCrypto() {
        return prixCrypto;
    },

    handleBourseCommand(p, msg) {
        return msg.reply(
            `📈 *CRYPTO EMPIRE*\n💹 Prix : *${prixCrypto}$*/unité\n📊 Tes crypto : ${p.crypto} unités = *${p.crypto * prixCrypto}$*`
        );
    },

    handleBuyCryptoCommand(p, msg, body) {
        const qte  = parseInt(body.split(' ')[1], 10);
        const cout = qte * prixCrypto;
        
        if (!qte || qte <= 0) return msg.reply("❌ Quantité invalide.");
        if (p.fric < cout) return msg.reply(`💸 Il te faut *${cout}$*.`);
        
        p.fric -= cout;
        p.crypto += qte;
        savePlayer(p);
        return msg.reply(`✅ *${qte} crypto* achetées à ${prixCrypto}$/u.\n📈 Total : ${p.crypto}`);
    },

    handleSellCryptoCommand(p, msg, body) {
        const qte  = parseInt(body.split(' ')[1], 10);
        const gain = qte * prixCrypto;
        
        if (!qte || qte <= 0) return msg.reply("❌ Quantité invalide.");
        if (p.crypto < qte) return msg.reply(`❌ Tu n'as que ${p.crypto} crypto.`);
        
        p.crypto -= qte;
        p.fric += gain;
        savePlayer(p);
        return msg.reply(`💰 *${qte} crypto* vendues pour *${gain}$* !\n💰 Solde : ${p.fric}$`);
    },
};
