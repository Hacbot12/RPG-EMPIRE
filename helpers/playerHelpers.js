const { stmts } = require('../db/queries');

function getPlayer(id) {
    const p = stmts.getPlayer.get(id);
    if (!p) return null;
    
    // Load inventory
    p.inventaire = stmts.getInventaire.all(id).map(r => r.itemNom);
    
    // Parse quiz data if exists
    if (p.currentQuiz) {
        try {
            p.currentQuiz = JSON.parse(p.currentQuiz);
        } catch {
            p.currentQuiz = null;
        }
    }
    
    return p;
}

function savePlayer(p) {
    const data = { ...p, currentQuiz: p.currentQuiz ? JSON.stringify(p.currentQuiz) : null };
    delete data.inventaire; // Inventory is in separate table
    stmts.updatePlayer.run(data);
}

function createPlayer(id, nom = 'Joueur') {
    stmts.insertPlayer.run({ id, nom });
    return getPlayer(id);
}

function isInPrison(p) {
    return p.prisonUntil && p.prisonUntil > 0; // Assuming gameTick check happens elsewhere
}

function isPolice(p) {
    return p.job === 'Policier' || p.job === 'Inspecteur' || p.job === 'Commissaire';
}

module.exports = { getPlayer, savePlayer, createPlayer, isInPrison, isPolice };
