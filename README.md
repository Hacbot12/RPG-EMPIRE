# Empire RPG Bot - Modular Architecture

## 📁 Project Structure

```
empire-rpg/
├── index.js                      # Main entry point (orchestrator)
├── package.json                  # Dependencies
├── empire.db                      # SQLite database
│
├── config/                        # Configuration
│   ├── database.js               # DB connection setup
│   └── constants.js              # Game constants (JOBS, SHOP, QUIZ)
│
├── db/                           # Database layer
│   ├── schema.js                 # Table creation & initialization
│   └── queries.js                # Prepared statements & transactions
│
├── helpers/                      # Utility functions
│   ├── utils.js                  # randInt(), clamp()
│   ├── gameTime.js               # Game clock management
│   └── playerHelpers.js          # getPlayer(), savePlayer(), etc
│
└── commands/                     # Command handlers (modular)
    ├── profileCommands.js        # !help, !me, !reg
    ├── economyCommands.js        # !travailler, !shop, !banque, !donner, !top
    ├── crimeCommands.js          # !voler, !wanted
    ├── policeCommands.js         # !patrouille, !arreter
    ├── gangCommands.js           # !creer_gang, !rejoindre_gang, etc
    ├── marriageCommands.js       # !marier, !accepter, !divorce
    ├── quizCommands.js           # !quiz, answer handler
    └── cryptoCommands.js         # !bourse, !acheter_crypto, !vendre_crypto
```

## 🎯 Benefits of This Architecture

✅ **Separation of Concerns**
- Each command module handles one feature area
- Database logic isolated in `db/`
- Utilities and helpers separate

✅ **Easy to Maintain & Scale**
- Adding new commands? Create a new module in `/commands`
- Changing DB queries? Edit `db/queries.js`
- Update constants? Modify `config/constants.js`

✅ **Reduced Code Duplication**
- Shared helpers (getPlayer, savePlayer) in one place
- Game time logic centralized
- Constants defined once

✅ **Better Readability**
- 700-line monolith → ~100 lines per file
- Clear responsibility for each module
- Easy to understand the code flow

## 🔄 Data Flow

```
User Message
    ↓
index.js (orchestrator)
    ↓
Command handlers in /commands
    ↓
Database layer (/db)
    ↓
SQLite
    ↓
Response to user
```

## 📝 Adding a New Command

**Example: Adding a `!workout` command**

1. Create `/commands/fitnessCommands.js`
2. Export your handler function
3. Import it in `index.js`
4. Add the routing logic

```javascript
// commands/fitnessCommands.js
const { savePlayer } = require('../helpers/playerHelpers');

module.exports = {
    handleWorkoutCommand(p, msg) {
        p.energie = Math.min(100, p.energie + 20);
        savePlayer(p);
        return msg.reply('💪 Entraînement complété !');
    },
};

// In index.js
const fitnessCommands = require('./commands/fitnessCommands');

// Then in message handler
if (body === '!workout') return fitnessCommands.handleWorkoutCommand(p, msg);
```

## 🔧 Modifying Database Queries

All prepared statements are in `/db/queries.js`:

```javascript
const stmts = {
    getPlayer: db.prepare('SELECT * FROM players WHERE id = ?'),
    // Add new queries here
    getPlayerByName: db.prepare('SELECT * FROM players WHERE nom = ?'),
};
```

## 📊 Game Constants

Edit `/config/constants.js` to:
- Add/remove job tiers
- Modify shop items
- Update quiz questions

## 🎮 Running the Bot

```bash
npm install
node index.js
```

Scan the QR code with WhatsApp and you're ready!

## 🚀 Future Improvements

- [ ] Admin commands in separate module
- [ ] Logging system
- [ ] Configuration file for prices/salaries
- [ ] Event system for random occurrences
- [ ] Pet/companion system
- [ ] Housing system
