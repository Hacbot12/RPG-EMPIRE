const db = require('../config/database');

function initializeSchema() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS players (
            id              TEXT PRIMARY KEY,
            nom             TEXT    DEFAULT 'Joueur',
            naissance       INTEGER DEFAULT 1935,
            fric            INTEGER DEFAULT 100,
            niveau          INTEGER DEFAULT 1,
            xp              INTEGER DEFAULT 0,
            job             TEXT    DEFAULT 'Apprenti',
            vie             INTEGER DEFAULT 100,
            faim            INTEGER DEFAULT 100,
            soif            INTEGER DEFAULT 100,
            energie         INTEGER DEFAULT 100,
            banque          INTEGER DEFAULT 0,
            crypto          INTEGER DEFAULT 0,
            maladie         TEXT    DEFAULT NULL,
            prisonUntil     INTEGER DEFAULT NULL,
            wanted          INTEGER DEFAULT 0,
            travailCount    INTEGER DEFAULT 0,
            lastWorkDay     INTEGER DEFAULT NULL,
            conjoint        TEXT    DEFAULT NULL,
            demandeMarriage TEXT    DEFAULT NULL,
            gang            TEXT    DEFAULT NULL,
            quizCount       INTEGER DEFAULT 0,
            lastQuizDay     INTEGER DEFAULT NULL,
            currentQuiz     TEXT    DEFAULT NULL
        );

        CREATE TABLE IF NOT EXISTS inventaire (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            playerId TEXT    NOT NULL,
            itemNom  TEXT    NOT NULL,
            FOREIGN KEY (playerId) REFERENCES players(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS gangs (
            nom     TEXT PRIMARY KEY,
            chef    TEXT NOT NULL,
            tresor  INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS gang_membres (
            gangNom  TEXT NOT NULL,
            playerId TEXT NOT NULL,
            PRIMARY KEY (gangNom, playerId),
            FOREIGN KEY (gangNom) REFERENCES gangs(nom) ON DELETE CASCADE
        );
    `);
}

module.exports = { initializeSchema };
