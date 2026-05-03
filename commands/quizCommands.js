const { randInt } = require('../helpers/utils');
const { getGameDay } = require('../helpers/gameTime');
const { savePlayer } = require('../helpers/playerHelpers');
const { QUIZ } = require('../config/constants');

module.exports = {
    handleQuizCommand(p, msg) {
        const today = getGameDay();
        if (p.lastQuizDay === today && p.quizCount >= 5)
            return msg.reply("⏳ 5 quiz max par jour. Reviens demain !");
        
        const q = QUIZ[randInt(0, QUIZ.length - 1)];
        p.currentQuiz = q;
        savePlayer(p);
        return msg.reply(`❓ *QUIZ*\n\n${q.question}\n\nRéponds par *oui* ou *non* !`);
    },

    handleQuizAnswerCommand(p, msg, body) {
        if (!p.currentQuiz) return; // Silently ignore if no active quiz
        
        const q     = p.currentQuiz;
        const today = getGameDay();
        p.currentQuiz  = null;
        p.quizCount    = (p.lastQuizDay === today) ? p.quizCount + 1 : 1;
        p.lastQuizDay  = today;
        
        if (body === q.reponse) {
            p.fric += q.gain;
            savePlayer(p);
            return msg.reply(`✅ Bonne réponse ! *+${q.gain}$*\n💰 ${p.fric}$`);
        } else {
            savePlayer(p);
            return msg.reply(`❌ Mauvaise réponse ! C'était *${q.reponse}*.`);
        }
    },
};
