const bparser = require("../bparser/parser");
const path = require("path");
const fs = require("fs");

var folderName = path.join(__dirname, "..", "test", "osu_files");
var files = fs.readdirSync(folderName);
console.log(`Beatmap`.padEnd(80) + `Max Score`.padStart(10));
console.log(``.padEnd(80, "-") + ``.padStart(10, "-"));
for (let i = 0; i < files.length; i++) {
    let beatmap = new bparser.BeatmapParser(path.join(folderName, files[i]));
    console.log(`CS:${beatmap.cs} AR:${beatmap.ar} OD:${beatmap.od} HP:${beatmap.hp}`);
    console.log(`${beatmap.artist} - ${beatmap.title} [${beatmap.version}] +NM`.padEnd(80) + `${beatmap.maxScore}`.padStart(10));
    console.log(`${beatmap.artist} - ${beatmap.title} [${beatmap.version}] +HDHRDT`.padEnd(80) + `${beatmap.getMaxScore(88)}`.padStart(10));
    console.log(`${beatmap.artist} - ${beatmap.title} [${beatmap.version}] +HDHRDTFL`.padEnd(80) + `${beatmap.getMaxScore(1112)}`.padStart(10));
}