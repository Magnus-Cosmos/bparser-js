const enums = require("./enums");

function clamp(value, min, max) {
    if (value > max)
        return max;
    if (value < min)
        return min;
    return value;
}

function applyModsToDiff(diff, mods) {
    if (enums.Mod.EZ & mods)
        diff = Math.max(0, diff / 2);
    if (enums.Mod.HR & mods)
        diff = Math.min(10, diff * 1.4);
    return diff;
}

function removeModsFromTime(time, mods) {
    if (enums.Mod.DT & mods)
        return time * 1.5;
    else if (enums.Mod.HT & mods)
        return time * 0.75;
    return time;
}

function applyModsToTime(time, mods) {
    if (enums.Mod.DT & mods)
        return time / 1.5;
    else if (enums.Mod.HT & mods)
        return time / 0.75;
    return time;
}

function diffRange(diff, min, mid, max, mods) {
    diff = applyModsToDiff(diff, mods);
    if (diff > 5)
        return mid + (max - mid) * (diff - 5) / 5;
    if (diff < 5)
        return mid - (mid - min) * (5 - diff) / 5;
    return mid;
}

function modsMultiplier(mods) {
    let multiplier = 1.0;
    if (enums.Mod.NF & mods)
        multiplier *= 0.5;
    if (enums.Mod.EZ & mods)
        multiplier *= 0.5;
    if (enums.Mod.HT & mods)
        multiplier *= 0.3;
    if (enums.Mod.HD & mods)
        multiplier *= 1.06;
    if (enums.Mod.HR & mods)
        multiplier *= 1.06;
    if (enums.Mod.DT & mods)
        multiplier *= 1.12;
    if (enums.Mod.FL & mods)
        multiplier *= 1.12;
    if (enums.Mod.SO & mods)
        multiplier *= 0.9;
    if ((enums.Mod.RX & mods) || (enums.Mod.AP & mods))
        multiplier *= 0;
    return multiplier;
}

module.exports = { clamp, modsMultiplier, diffRange, applyModsToTime, removeModsFromTime }