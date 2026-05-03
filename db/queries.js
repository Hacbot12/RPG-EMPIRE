const db = require('../config/database');

const stmts = {
    // Players queries
    getPlayer:      db.prepare('SELECT * FROM players WHERE id = ?'),
    insertPlayer:   db.prepare(`
        INSERT INTO players (id, nom) VALUES (@id, @nom)
    `),
    updatePlayer:   db.prepare(`
        UPDATE players SET
            nom = @nom, fric = @fric, niveau = @niveau, xp = @xp,
            job = @job, vie = @vie, faim = @faim, soif = @soif,
            energie = @energie, banque = @banque, crypto = @crypto,
            maladie = @maladie, prisonUntil = @prisonUntil, wanted = @wanted,
            travailCount = @travailCount, lastWorkDay = @lastWorkDay,
            conjoint = @conjoint, demandeMarriage = @demandeMarriage,
            gang = @gang, quizCount = @quizCount, lastQuizDay = @lastQuizDay,
            currentQuiz = @currentQuiz
        WHERE id = @id
    `),
    getAllPlayers:   db.prepare('SELECT * FROM players ORDER BY fric + banque DESC'),

    // Inventory queries
    getInventaire:  db.prepare('SELECT itemNom FROM inventaire WHERE playerId = ? ORDER BY id'),
    addItem:        db.prepare('INSERT INTO inventaire (playerId, itemNom) VALUES (?, ?)'),
    removeItem:     db.prepare(`
        DELETE FROM inventaire WHERE id = (
            SELECT id FROM inventaire WHERE playerId = ? AND itemNom = ? LIMIT 1
        )
    `),
    clearInventaire:db.prepare('DELETE FROM inventaire WHERE playerId = ?'),

    // Gang queries
    getGang:        db.prepare('SELECT * FROM gangs WHERE nom = ?'),
    getGangByPlayer:db.prepare('SELECT g.* FROM gangs g JOIN gang_membres gm ON g.nom = gm.gangNom WHERE gm.playerId = ?'),
    getGangMembres: db.prepare('SELECT playerId FROM gang_membres WHERE gangNom = ?'),
    insertGang:     db.prepare('INSERT INTO gangs (nom, chef) VALUES (@nom, @chef)'),
    insertMembre:   db.prepare('INSERT OR IGNORE INTO gang_membres (gangNom, playerId) VALUES (?, ?)'),
    removeMembre:   db.prepare('DELETE FROM gang_membres WHERE gangNom = ? AND playerId = ?'),
    deleteGang:     db.prepare('DELETE FROM gangs WHERE nom = ?'),
    updateGangChef: db.prepare('UPDATE gangs SET chef = ? WHERE nom = ?'),
    gangExists:     db.prepare('SELECT nom FROM gangs WHERE LOWER(nom) = LOWER(?)'),
};

// Transaction for atomic money transfers
const transferMoney = db.transaction((fromId, toId, montant) => {
    db.prepare('UPDATE players SET fric = fric - ? WHERE id = ?').run(montant, fromId);
    db.prepare('UPDATE players SET fric = fric + ? WHERE id = ?').run(montant, toId);
});

module.exports = { stmts, transferMoney };
