let gameTick = 0;

function advanceGameTime(minutes = 30) {
    gameTick += minutes;
}

function getGameHour() {
    const hour   = Math.floor(gameTick / 60) % 24;
    const minute = gameTick % 60;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getGameDay() {
    return Math.floor(gameTick / 1440);
}

function getGameTick() {
    return gameTick;
}

module.exports = { advanceGameTime, getGameHour, getGameDay, getGameTick };
