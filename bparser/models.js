const enums = require("./enums");
const utils = require("./utils");

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class HitObject {
    constructor(pos, startTime, endTime) {
        this.pos = pos;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

class HitCircle extends HitObject {
    constructor(pos, startTime, endTime) {
        super(pos, startTime, endTime);
        this.objType = enums.HitObjectType.NORMAL;
    }
}

class Slider extends HitObject {
    constructor(pos, startTime, endTime, repeatCount, length) {
        super(pos, startTime, endTime);
        this.repeatCount = repeatCount;
        this.pixelLength = length;
        this.ticks = 0;
        this.extraScore = false;
        this.objType = enums.HitObjectType.SLIDER;
    }
}

class Spinner extends HitObject {
    constructor(pos, startTime, endTime) {
        super(pos, startTime, endTime);
        this.length = endTime - startTime;
        this.bonusPoints = 0;
        this.objType = enums.HitObjectType.SPINNER
    }
}

class TimingPoint {
    constructor(offset, beatLength, timingChange) {
        this.offset = offset;
        this.beatLength = beatLength;
        this.timingChange = timingChange;
    }

    _bpmMultiplier() {
        if (this.beatLength >= 0)
            return 1;
        return utils.clamp(-this.beatLength, 10, 1000) / 100.0;
    }
}

class Beatmap {
    //#region General
    mode = enums.PlayModes.OSU;
    //#endregion
    
    //#region Metadata
    title = "";
    titleUnicode;
    artist = "";
    artistUnicode;
    creator = "";
    version = "";
    source = "";
    tags = [];
    beatmapId = 0;
    beatmapsetId = -1;
    //#endregion

    //#region Difficulty
    hp = 5.0;
    cs = 5.0;
    od = 5.0;
    ar = 5.0;
    sliderMultiplier = 1.4;
    sliderTickRate = 1.0;
    sliderScoringPointDistance;
    //#endregion

    //#region HitObjects
    countCircles = 0;
    countSliders = 0;
    countSpinners = 0;
    hitObjects = []
    //#endregion

    //#region Others
    beatmapVersion = 14;
    drainLength = 0;
    totalLength = 0;
    timingPoints = [];
    maxCombo;
    maxScore;
    //#endregion
}

module.exports = { Vector2, HitCircle, Slider, Spinner, TimingPoint, Beatmap }