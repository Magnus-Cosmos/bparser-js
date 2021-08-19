# bparser-js
A minimal beatmap parse for **Node.js** that parses .osu files and calculates max score.

- [Usage](#usage)
- [Response](#response)
- [Methods](#methods)
	- [parseFile(filename, mods = 0)](#parsefile)
	- [parseData(data, mods = 0)](#parsedata)

## Usage

```javascript
const bparser = require("bparser-js");

var beatmap = bparser.BeatmapParser("path/Kuba Oms - My Love (W h i t e) [Normal].osu");
console.log(`Max score (NM): ${beatmap.maxScore}`);
console.log(`Max score (HDHRDTFL): ${beatmap.getMaxScore(1112)}`);
```

### Response
```
Max score (NM): 2956474
Max score (HDHRDTFL): 4119190
```

## Methods

### parseFile(filename, mods = 0)
Parse a file given the filename or path. Specify mods to parse with different mods (see mod values at https://github.com/ppy/osu-api/wiki#mods).
```javascript
const bparser = require("bparser-js");

var beatmap = bparser.BeatmapParser();
beatmap.parseFile("path/Kuba Oms - My Love (W h i t e) [Normal].osu", 1112);
console.log(`Max score (HDHRDTFL): ${beatmap.maxScore}`);
```

### parseData(data, mods = 0)
Parse the content of a file.
```javascript
const bparser = require("bparser-js");
const fs = require("fs");

var data = fs.readFileSync("path/Kuba Oms - My Love (W h i t e) [Normal].osu");
var beatmap = bparser.BeatmapParser();
beatmap.parseFile(data, 1112);
console.log(`Max score (HDHRDTFL): ${beatmap.maxScore}`);
```