// Random integer between min and max (inclusive)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

module.exports = { randInt, clamp };
