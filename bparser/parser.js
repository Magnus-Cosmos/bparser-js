const fs = require("fs");
const models = require("./models");
const enums = require("./enums");
const utils = require("./utils");

class BeatmapParser extends models.Beatmap {
    /**
     * Create a beatmap parser
     * @param {string} file - The .osu file or data to parse, defaults to `null`. If not specified nothing will be parsed
     * @param {number} mods - Integer value of the mods, defaults to `0` (NoMod)
     * @param {boolean} raw_data - Whether the parameter `file` is a filename or raw data, defaults to `false`
     */
    constructor(file = null, mods = 0, raw_data = false) {
        super();
        this.parsed = false;
        if (file != null) {
            if (raw_data)
                this.parseData(file, mods);
            else
                this.parseFile(file, mods);
        }
    }

    /**
     * Parse beatmap file
     * @param {string} filename - Path of .osu file
     * @param {number} mods - Integer value of the mods, defaults to `0` (NoMod)
     */
    parseFile(filename, mods = 0) {
        const data = fs.readFileSync(filename, "utf8");
        const lines = data.split(/\r?\n/);
        this._processHeaders(lines);
        this._parse(lines);
        this._parseObjects(mods);
    }

    /**
     * Parse beatmap data
     * @param {string} [data] String data of .osu file
     * @param {number} [mods=0] Integer value of the mods, defaults to `0` (NoMod)
     */
    parseData(data, mods = 0) {
        const lines = data.split(/\r?\n/);
        this._processHeaders(lines);
        this._parse(lines);
        this._parseObjects(mods);
    }

    /**
     * Max score of beatmap
     * @param {number} [mods=0] Integer value of mods, defaults to `0` (NoMod)
     */
    getMaxScore(mods = 0) {
        if (!this.parsed) {
            console.log("Beatmap has not been parsed yet");
            return;
        }
        if (this.mods == mods)
            return this.maxScore;
        this._parseObjects(mods);

        return this.maxScore;
    }

    _processHeaders(lines) {
        let arIsOd = true;
        let currentSection = enums.FileSection.UNKNOWN;
        let firstTime = -1;
        let lastTime = -1;
        let realLastTime = -1;
        let lastTimeStr = "";
        let realLastTimeStr = "";
        let breakTime = 0;
        try {
            try {
                let line = lines[0];
                if (line.indexOf("osu file format") == 0) {
                    this.beatmapVersion = parseInt(line.substring(line.lastIndexOf("v") + 1));
                }
            }
            catch (e) {
                console.log(`Missing file format for ${this.filename}`);
            }
            for (let i = 1; i < lines.length; i++) {
                let line = lines[i].trim();
                let left, right = "";
                if (line.length == 0 || line.startsWith("//"))
                    continue;
                
                if (currentSection != enums.FileSection.HITOBJECTS) {
                    let kv = line.split(":", 2);
                    if (kv.length > 1) {
                        left = kv[0].trim();
                        right = kv[1].trim();
                    }
                    else if (line.charAt(0) == '[') {
                        try {
                            currentSection = enums.FileSection[line.replace(/^\[+|\]+$/g, '').toUpperCase()]
                        }
                        catch {
                        }
                        continue;
                    }
                }
                switch (currentSection) {
                    case enums.FileSection.GENERAL:
                        if (left == "Mode")
                            this.mode = parseInt(right);
                        break;
                    case enums.FileSection.METADATA:
                        switch (left) {
                            case "Artist":
                                this.artist = right
                                break;
                            case "ArtistUnicode":
                                this.artistUnicode = right
                                break;
                            case "Title":
                                this.title = right
                                break;
                            case "TitleUnicode":
                                this.titleUnicode = right
                                break;
                            case "Creator":
                                this.creator = right
                                break;
                            case "Version":
                                this.version = right
                                break;
                            case "Tags":
                                this.tags = right
                                break;
                            case "Source":
                                this.source = right
                                break;
                            case "BeatmapID":
                                this.beatmapId = parseInt(right)
                                break;
                            case "BeatmapSetID":
                                this.beatmapsetId = parseInt(right)
                                break;
                        }
                        break;
                    case enums.FileSection.DIFFICULTY:
                        switch (left) {
                            case "HPDrainRate":
                                this.hp = Math.min(10, Math.max(0, parseFloat(right)));
                                break;
                            case "CircleSize":
                                if (this.mode == enums.PlayModes.MANIA)
                                    this.cs = Math.min(18, Math.max(1, parseFloat(right)));
                                else
                                    this.cs = Math.min(10, Math.max(0, parseFloat(right)));
                                break;
                            case "OverallDifficulty":
                                this.od = Math.min(10, Math.max(0, parseFloat(right)));
                                if (arIsOd)
                                    this.ar = this.od;
                                break;
                            case "SliderMultiplier":
                                this.sliderMultiplier = Math.max(0.4, Math.min(3.6, parseFloat(right)));
                                break;
                            case "SliderTickRate":
                                this.sliderTickRate = Math.max(0.5, Math.min(8, parseFloat(right)));
                                break;
                            case "ApproachRate":
                                this.ar = Math.min(10, Math.max(0, parseFloat(right)));
                                arIsOd = false;
                                break;
                        }
                        break;
                        case enums.FileSection.EVENTS:
                            if (line.charAt(0) == '2') {
                                let split = line.split(",");
                                breakTime += parseInt(split[2]) - parseInt(split[1]);
                            }
                            break;
                        case enums.FileSection.TIMINGPOINTS:
                            try {
                                let split = line.split(",");
                                if (split.length < 2)
                                    continue;
                                let offset = parseFloat(split[0].trim());
                                let beatLength = parseFloat(split[1].trim());
                                let timingChange = true;
                                if (split.length > 6)
                                    timingChange = (split[6].charAt(0) == '1');
                                let tp = new models.TimingPoint(offset, beatLength, timingChange);
                                this.timingPoints.push(tp);
                            }
                            catch (e) {
                                console.log(`Error parsing timing points for ${this.filename}\n${e}`);
                            }
                            break;
                        case enums.FileSection.HITOBJECTS:
                            let split = line.split(",", 7);

                            if (firstTime == -1)
                                firstTime = parseInt(split[2]);
                            
                            let objType = parseInt(split[3]) & 139;

                            switch (objType) {
                                case enums.HitObjectType.NORMAL:
                                    this.countCircles++;
                                    lastTimeStr = split[2];
                                    realLastTimeStr = lastTimeStr;
                                    break;
                                case enums.HitObjectType.SLIDER:
                                    this.countSliders++;
                                    lastTimeStr = split[2];
                                    realLastTimeStr = lastTimeStr;
                                    break;
                                case enums.HitObjectType.SPINNER:
                                    this.countSpinners++;
                                    lastTimeStr = split[2];
                                    realLastTimeStr = split[5];
                                    break;
                                case enums.HitObjectType.HOLD:
                                    this.countSliders++;
                                    lastTimeStr = split[5].split(":")[0];
                                    realLastTimeStr = lastTimeStr;
                                    break;
                            }
                            break;
                }
            }
        }
        catch (e) {
            console.log(`An error occured while processing ${this.filename}\n${e}`);
        }

        if (lastTimeStr.length > 0)
            lastTime = parseInt(lastTimeStr);
        if (realLastTimeStr.length > 0)
            realLastTime = parseInt(realLastTimeStr);

        this.drainLength = Math.trunc((lastTime - firstTime - breakTime) / 1000);
        this.totalLength = realLastTime;
        this.sliderScoringPointDistance = (100 * this.sliderMultiplier / this.sliderTickRate);
    }

    _parse(lines) {
        let currentSection = enums.FileSection.UNKNOWN;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.length == 0 || line.startsWith(" ") || line.startsWith("_") || line.startsWith("//"))
                continue;
            if (line.charAt(0) == '[') {
                try {
                    currentSection = enums.FileSection[line.replace(/^\[+|\]+$/g, '').toUpperCase()]
                }
                catch {
                }
                continue;
            }
            
            if (currentSection == enums.FileSection.HITOBJECTS) {
                let split = line.split(",");
                let objType = parseInt(split[3]) & 139;
                let x = Math.max(0, Math.min(512, parseInt(split[0])));
                let y = Math.max(0, Math.min(512, parseInt(split[1])));
                let pos = new models.Vector2(x, y);
                let time = parseInt(split[2]);
                let ho = null;

                switch (objType) {
                    case enums.HitObjectType.NORMAL:
                        ho = new models.HitCircle(pos, time, time);
                        break;
                    case enums.HitObjectType.SLIDER:
                        let length = 0;
                        let repeatCount = parseInt(split[6]);
                        if (split.length > 7)
                            length = parseFloat(split[7]);
                        ho = new models.Slider(pos, time, time, Math.max(1, repeatCount), length);
                        break;
                    case enums.HitObjectType.SPINNER:
                        let end_time = parseInt(split[5]);
                        ho = new models.Spinner(pos, time, end_time);
                        break;
                }

                if (ho != null)
                    this.hitObjects.push(ho);
            }
        }
    }

    _parseObjects(mods) {
        this.maxCombo = 0;
        this.maxScore = 0;
        let scoreMult = this._diffPpyStars() * utils.modsMultiplier(mods);
        for (let i = 0; i < this.hitObjects.length; i++) {
            let ho = this.hitObjects[i];
            switch (ho.objType) {
                case enums.HitObjectType.NORMAL:
                    this.maxScore += 300;
                    this.maxScore += Math.trunc(Math.max(0, this.maxCombo - 1) * (300 * scoreMult) / 25);
                    this.maxCombo++;
                    break;
                case enums.HitObjectType.SLIDER:
                    this.maxScore += 30;
                    if (!this.parsed)
                        this._parseSlider(ho);
                    this.maxScore += 10 * ho.ticks + 20 * ho.repeatCount;
                    if (ho.extraScore)
                        this.maxScore += 20;
                    this.maxCombo += 1 + ho.ticks;
                    this.maxScore += 300
                    this.maxScore += Math.trunc(Math.max(0, this.maxCombo - 1) * (300 * scoreMult) / 25);
                    break;
                case enums.HitObjectType.SPINNER:
                    this._parseSpinner(ho, mods);
                    this.maxScore += ho.bonusPoints;
                    this.maxScore += 300;
                    this.maxScore += Math.trunc(Math.max(0, this.maxCombo - 1) * (300 * scoreMult) / 25);
                    this.maxCombo++;
                    break;
            }
        }
        this.maxScore = Math.min(this.maxScore, 2147483647);
        this.parsed = true;
        this.mods = mods;
    }

    _parseSpinner(ho, mods) {
        ho.bonusPoints = 0;
        let rotRatio = utils.diffRange(this.od, 3, 5, 7.5, mods);
        let rotReq = Math.trunc(ho.length / 1000 * rotRatio);
        let length = ho.length;
        let firstFrame = Math.floor(utils.removeModsFromTime(1000 / 60, mods));
        let maxAccel = utils.applyModsToTime(0.00008 + Math.max(0, (5000 - length) / 1000 / 2000), mods);
        if (!(enums.Mod.SO & mods))
            length = Math.max(0, length - firstFrame);

        let rot1 = 0.0;
        if (0.05 / maxAccel <= length)
            rot1 = (0.05 / maxAccel * 0.05 / 2) / Math.PI;
        else
            rot1 = (length * 0.05 / 2) / Math.PI;   
        let rot2 = (Math.max(0, (length - 0.05 / maxAccel)) * 0.05) / Math.PI;

        let adj = 0.0;
        // We want to do riemann sum (with 32-bit floats), but looping through every ms of the spinner is rather inefficient
        // Instead we take the integral/area (`rot1` + `rot2`) and add a small adjustment
        // https://www.desmos.com/calculator/q2fmcg2wqy
        // Using step-wise functions
        // DT: https://www.desmos.com/calculator/c4fj2mbx9k
        if (ho.length < 25)
            adj = 0.0;
        else if (ho.length < 54)
            adj = -0.000270059419975 * Math.pow(ho.length, 2) + 0.0211619792196 * ho.length - 0.360204188548;
        else if (ho.length < 550)
            adj = 7.08877768273e-8 * ho.length - 0.00792123896377;
        else if (ho.length < 1039)
            adj = -3.87996955927e-7 * ho.length - 0.00766882330492;
        else if (ho.length < 4300)
            adj = 5.56455532781e-7 * ho.length - 0.00864999032506;
        else if (ho.length < 5003)
            adj = -1.52204906849e-157 * Math.pow(ho.length, 41.3873070645) + 1.55461382298e-8 * Math.pow(ho.length, 1.36603917014) - 0.00768603737329;
        else if (ho.length < 16579)
            adj = 0.000000576271509962 * ho.length - 0.00900373898631;
        else if (ho.length < 64789)
            adj = -0.0000146814720605 * ho.length + 0.243958571556;
        else if (ho.length < 258373)
            adj = 0.0000463528165568 * ho.length - 3.71039008873;
        else if (ho.length < 512573)
            adj = -0.00019778694081 * ho.length + 59.3687754661;
        else
            adj = 0.00029049430919 * ho.length - 190.91100969;

        let rot = Math.trunc(Math.max(0, rot1 + rot2 - adj));
        for (let i = 1; i <= rot; i++) {
            if (i > rotReq + 3 && (i - (rotReq + 3)) % 2 == 0)
                ho.bonusPoints += 1100;
            else if (i > 1 && i % 2 == 0)
                ho.bonusPoints += 100;
        }
    }

    _parseSlider(ho) {
        let velocity = this._sliderVecityAt(ho.startTime);
        let beatLength = this._beatLengthAt(ho.startTime);
        let tickDist;
        if (this.beatmapVersion < 8)
            tickDist = this.sliderScoringPointDistance;
        else
            tickDist = this.sliderScoringPointDistance / this._bpmMultAt(ho.startTime);
        
        let minTickDist = 0.01 * velocity;
        let scoringDist = ho.pixelLength;
        while (scoringDist >= tickDist) {
            scoringDist -= tickDist;
            if (scoringDist <= minTickDist)
                break;
            ho.ticks += 1
        }
        
        let duration = Math.trunc(ho.pixelLength / (100 * this.sliderMultiplier) * beatLength);
        
        if (ho.ticks > 0) {
            let tickDuration = Math.trunc(ho.ticks * tickDist / (100 * this.sliderMultiplier) * beatLength);
            if (tickDuration >= duration - 36 && ho.repeatCount % 2)
                ho.extraScore = true;
        }
        ho.ticks++;
        ho.ticks *= ho.repeatCount;
        ho.endTime = ho.startTime + duration * ho.repeatCount;
    }

    _sliderVecityAt(time) {
        let beatLength = this._beatLengthAt(time);

        if (beatLength > 0)
            return this.sliderScoringPointDistance * this.sliderTickRate * (1000 / beatLength)
        return this.sliderScoringPointDistance * this.sliderTickRate;
    }

    _beatLengthAt(time) {
        if (this.timingPoints.length == 0)
            return 0;
        
        let point = 0;
        let samplePoint = 0;
        for (let i = 0; i < this.timingPoints.length; i++) {
            if (this.timingPoints[i].offset <= time) {
                if (this.timingPoints[i].timingChange)
                    point = i;
                else
                    samplePoint = i;
            }
        }

        let mult = 1.0;
        
        if (samplePoint > point && this.timingPoints[samplePoint].beatLength< 0)
            mult = this.timingPoints[samplePoint]._bpmMultiplier();

        return this.timingPoints[point].beatLength * mult;
    }

    _bpmMultAt(time) {
        let tp = this._timingPointAt(time);
        if (tp == null)
            return 1;
        return tp._bpmMultiplier();
    }

    _timingPointAt(time) {
        if (this.timingPoints.length == 0)
            return null;
        
        let point = 0;
        for (let i = 0; i < this.timingPoints.length; i++) {
            if (this.timingPoints[i].offset <= time)
                point = i;
        }

        return this.timingPoints[point];
    }

    _diffPpyStars() {
        let objFactor = utils.clamp((this.hitObjects.length / Math.fround(this.drainLength)) * 8, 0, 16);
        return Math.round((Math.fround(this.hp) + Math.fround(this.od) + Math.fround(this.cs) + Math.fround(objFactor)) / 38 * 5);
    }
}

module.exports = { BeatmapParser }