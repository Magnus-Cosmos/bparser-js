# bparser-js
[![NPM Package](https://img.shields.io/npm/v/bparser-js)](https://www.npmjs.com/package/bparser-js)

A minimal beatmap parse for **Node.js** that parses .osu files and calculates max score.

## Usage

```javascript
const bparser = require("bparser-js");

var beatmap = new bparser.BeatmapParser("path/Kuba Oms - My Love (W h i t e) [Normal].osu");
console.log(`Max score (NM): ${beatmap.maxScore}`);
console.log(`Max score (HDHRDTFL): ${beatmap.getMaxScore(1112)}`);
```

### Response
```
Max score (NM): 2956474
Max score (HDHRDTFL): 4119190
```
