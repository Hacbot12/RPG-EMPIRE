const Database = require('better-sqlite3');

// Initialize database
const db = new Database('./empire.db');

// Enable WAL mode for better performance and crash resistance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
