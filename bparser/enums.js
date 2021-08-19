const FileSection = {
    UNKNOWN         : 0,
    GENERAL         : 1 << 0,
    COLOURS         : 1 << 1,
    EDITOR          : 1 << 2,
    METADATA        : 1 << 3,
    TIMINGPOINTS    : 1 << 4,
    EVENTS          : 1 << 5,
    HITOBJECTS      : 1 << 6,
    DIFFICULTY      : 1 << 7,
    VARIABLES       : 1 << 8,
}

const PlayModes = {
    OSU             : 0,
    TAIKO           : 1,
    FRUITS          : 2,
    MANIA           : 3,
}

const HitObjectType = {
    NORMAL          : 1,
    SLIDER          : 2,
    NEWCOMBO        : 4,
    SPINNER         : 8,
    COLOURHAX       : 112,
    HOLD            : 128,
}

const Mod = {
    NM              : 0,
    NF              : 1 << 0,
    EZ              : 1 << 1,
    TD              : 1 << 2,
    HD              : 1 << 3,
    HR              : 1 << 4,
    SD              : 1 << 5,
    DT              : 1 << 6,
    RX              : 1 << 7,
    HT              : 1 << 8,
    NC              : 1 << 9,
    FL              : 1 << 10,
    AT              : 1 << 11,
    SO              : 1 << 12,
    AP              : 1 << 13,
    PF              : 1 << 14,
    K4              : 1 << 15,
    K5              : 1 << 16,
    K6              : 1 << 17,
    K7              : 1 << 18,
    K8              : 1 << 19,
    FI              : 1 << 20,
    RD              : 1 << 21,
    CN              : 1 << 22,
    TP              : 1 << 23,
    K9              : 1 << 24,
    CO              : 1 << 25,
    K1              : 1 << 26,
    K3              : 1 << 27,
    K2              : 1 << 28,
    V2              : 1 << 29,
    MR              : 1 << 30,
}

module.exports = { FileSection, PlayModes, HitObjectType, Mod }