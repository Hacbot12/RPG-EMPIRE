const { randInt, clamp } = require('../helpers/utils');
const { getGameDay, getGameHour, advanceGameTime } = require('../helpers/gameTime');
const { getPlayer, savePlayer } = require('../helpers/playerHelpers');
const { stmts, transferMoney } = require('../db/queries');
const { JOBS, SHOP } = require('../config/constants');

// Re-export constants for display
const SHOP_BY_ID = Object.fromEntries(SHOP.map(item => [item.id, item]));
const CATEGORY_LABELS = {
    nourriture: "🍔 Nourriture & Boissons",
    sante:      "💊 Santé",
    gaming:     "🎮 Gaming",
    tech:       "💻 Tech",
    beaute:     "💄 Beauté & Style",
    maison:     "🏠 Maison",
    vehicule:   "🚘 Véhicules",
    inconnu:    "📦 Divers",
};

const CATEGORY_ALIASES = {
    nourriture: 'nourriture', boisson: 'nourriture', bouffe: 'nourriture',
    sante: 'sante', santé: 'sante',
    gaming: 'gaming', tech: 'tech',
    beaute: 'beaute', beauté: 'beaute',
    maison: 'maison',
    vehicule: 'vehicule', vehicules: 'vehicule', voiture: 'vehicule', voitures: 'vehicule',
};

const CATEGORY_ORDER = ['nourriture', 'sante', 'gaming', 'tech', 'beaute', 'maison', 'vehicule', 'inconnu'];

function formatInventoryByCategory(inventaire) {
    if (!inventaire?.length) return "🎒 *INVENTAIRE VIDE*\n\nVa au shop avec *!shop* !";
    const grouped = {};
    inventaire.forEach(item => grouped[item] = (grouped[item] || 0) + 1);
    const categorized = {};
    for (const [itemName, count] of Object.entries(grouped)) {
        const shopItem = SHOP.find(s => s.nom === itemName);
        const cat = shopItem?.categorie ?? 'inconnu';
        if (!categorized[cat]) categorized[cat] = [];
        categorized[cat].push({ name: itemName, count });
    }
    let output = `🎒 *TON INVENTAIRE* (${inventaire.length} objet${inventaire.length > 1 ? 's' : ''})\n\n`;
    for (const cat of CATEGORY_ORDER) {
        if (categorized[cat]?.length) {
            output += `*${CATEGORY_LABELS[cat]}*\n`;
            categorized[cat].sort((a, b) => b.count - a.count).forEach(i => output += `• ${i.name} ×${i.count}\n`);
            output += '\n';
        }
    }
    return output.trim();
}

function getShopDisplay(bodyRaw) {
    const categoryInput = bodyRaw.split(/\s+/)[1]?.toLowerCase().trim() ?? null;
    const realCategory  = categoryInput ? (CATEGORY_ALIASES[categoryInput] ?? null) : null;
    if (!realCategory) {
        let txt = "🛒 *SHOP EMPIRE RPG*\n\n📦 *CATÉGORIES DISPONIBLES*\n\n";
        [...new Set(SHOP.map(i => i.categorie))].forEach(cat => {
            const items = SHOP.filter(i => i.categorie === cat);
            txt += `${CATEGORY_LABELS[cat] ?? cat} — *${items.length} articles*\n`;
            txt += `Ex. : ${items.slice(0, 2).map(i => i.nom).join(' • ')}\n\n`;
        });
        txt += "💡 Tape *!shop nourriture* ou *!shop vehicule*.";
        return txt;
    }
    const items = SHOP.filter(i => i.categorie === realCategory);
    if (!items.length) return "❌ Catégorie inconnue.";
    let txt = `🛒 *SHOP - ${realCategory.toUpperCase()}* (${items.length} articles)\n\n`;
    items.forEach(item => txt += `🔹 ${item.id}. ${item.nom} — ${item.prix}$\n`);
    txt += "\n💡 !acheter ID";
    return txt;
}

function actionFatigante(p) {
    p.faim    = Math.max(0, p.faim    - 5);
    p.soif    = Math.max(0, p.soif    - (p.conjoint ? 3 : 5));
    p.energie = Math.max(0, p.energie - 5);
    advanceGameTime(30);
}

module.exports = {
    handleWorkCommand(p, msg) {
        if (p.energie < 20) return msg.reply("😴 Trop fatigué ! Mange ou repose-toi.");
        if (p.maladie) return msg.reply(`🦠 Tu es malade (${p.maladie}). Soigne-toi !`);
        
        const today = getGameDay();
        if (p.lastWorkDay === today && p.travailCount >= 3)
            return msg.reply("⏳ 3 travails max par jour. Reviens demain !");
        
        const jobDef  = JOBS.find(j => j.nom === p.job) || JOBS[0];
        const salaire = randInt(jobDef.salaireMin, jobDef.salaireMax);
        p.fric        += salaire;
        p.xp          += randInt(5, 15);
        p.travailCount = (p.lastWorkDay === today) ? p.travailCount + 1 : 1;
        p.lastWorkDay  = today;
        actionFatigante(p);
        
        let extra = '';
        if (p.xp >= p.niveau * 100 && p.niveau < 7) {
            p.niveau++;
            p.xp = 0;
            const newJob = JOBS.find(j => j.niveau === p.niveau);
            if (newJob) p.job = newJob.nom;
            extra += `\n🎉 *LEVEL UP !* Niv.${p.niveau} — ${p.job} !`;
        }
        
        savePlayer(p);
        return msg.reply(`💼 *${p.job}* — +${salaire}$\n💰 ${p.fric}$ | ⚡ ${p.energie}%${extra}`);
    },

    handleShopCommand(msg, bodyRaw) {
        return msg.reply(getShopDisplay(bodyRaw));
    },

    handleBuyCommand(p, msg, body) {
        const id   = parseInt(body.replace(/\D/g, ''), 10);
        const item = SHOP_BY_ID[id];
        if (!item) return msg.reply("❌ Objet introuvable. Vérifie l'ID dans *!shop*.");
        if (p.fric < item.prix) return msg.reply(`💸 Il te faut *${item.prix}$* (tu as ${p.fric}$).`);
        
        p.fric -= item.prix;
        savePlayer(p);
        stmts.addItem.run(p.id, item.nom);
        return msg.reply(`✅ *${item.nom}* acheté pour ${item.prix}$ !\n💰 Solde : ${p.fric}$`);
    },

    handleConsumeCommand(p, msg, body) {
        const type  = body === '!manger' ? 'faim' : body === '!boire' ? 'soif' : 'vie';
        const found = p.inventaire.find(nom => SHOP.find(s => s.nom === nom && s.type === type));
        if (!found) return msg.reply(`❌ Rien pour "${type}" dans ton inventaire.\n🛒 Va au *!shop* !`);
        
        const item = SHOP.find(s => s.nom === found);
        p[type] = clamp(p[type] + (item.valeur || 20), 0, 100);
        savePlayer(p);
        stmts.removeItem.run(p.id, found);
        const emoji = type === 'faim' ? '🍔' : type === 'soif' ? '💧' : '❤️';
        return msg.reply(`✅ *${found}* utilisé !\n${emoji} ${type} : ${p[type]}%`);
    },

    handleInventoryCommand(p, msg) {
        return msg.reply(formatInventoryByCategory(p.inventaire));
    },

    handleBankCommand(p, msg, body) {
        if (body === '!banque') {
            return msg.reply(`🏦 *BANQUE*\n💵 Liquide : ${p.fric}$\n🏦 Banque : ${p.banque}$\n📊 Total : ${p.fric + p.banque}$`);
        }
        
        if (body.startsWith('!deposer ')) {
            const montant = parseInt(body.split(' ')[1], 10);
            if (!montant || montant <= 0) return msg.reply("❌ Montant invalide.");
            if (p.fric < montant) return msg.reply(`💸 Tu n'as que ${p.fric}$.`);
            p.fric -= montant;
            p.banque += montant;
            savePlayer(p);
            return msg.reply(`✅ *${montant}$* déposés. Banque : ${p.banque}$`);
        }
        
        if (body.startsWith('!retirer ')) {
            const montant = parseInt(body.split(' ')[1], 10);
            if (!montant || montant <= 0) return msg.reply("❌ Montant invalide.");
            if (p.banque < montant) return msg.reply(`💸 Tu n'as que ${p.banque}$ en banque.`);
            p.banque -= montant;
            p.fric += montant;
            savePlayer(p);
            return msg.reply(`✅ *${montant}$* retirés. Liquide : ${p.fric}$`);
        }
    },

    handleTransferCommand(p, msg, bodyRaw) {
        const montant = parseInt(bodyRaw.split(/\s+/)[2], 10);
        const mention = msg.mentionedIds?.[0];
        if (!mention) return msg.reply("❌ *!donner @joueur montant*");
        if (!montant || montant <= 0) return msg.reply("❌ Montant invalide.");
        if (p.fric < montant) return msg.reply(`💸 Tu n'as que ${p.fric}$.`);
        
        const cible = getPlayer(mention);
        if (!cible) return msg.reply("❌ Ce joueur n'est pas inscrit.");
        if (cible.id === p.id) return msg.reply("🤡 Tu ne peux pas te donner de l'argent.");
        
        transferMoney(p.id, cible.id, montant);
        return msg.reply(`✅ *${montant}$* envoyés à *${cible.nom}* !\n💰 Ton solde : ${p.fric - montant}$`);
    },

    handleTopCommand(msg) {
        const top = stmts.getAllPlayers.all().slice(0, 10);
        const medals = ['🥇', '🥈', '🥉'];
        let txt = "🏆 *TOP 10 EMPIRE RPG*\n\n";
        top.forEach((pl, i) => txt += `${medals[i] ?? `${i + 1}.`} *${pl.nom}* — ${pl.fric + pl.banque}$ (Niv.${pl.niveau})\n`);
        return msg.reply(txt.trim());
    },
};
