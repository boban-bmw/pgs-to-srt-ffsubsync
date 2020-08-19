import fs from "fs";
import { bufferToTimestamp, jump, END, bufferToNumber } from "./util";

const file = fs.readFileSync("./test.sup");

let i = 0;

const output = [];

while (true) {
  i += jump.PG;

  const timestampBuffer = file.slice(i, i + jump.PTS);

  i += jump.PTS;
  i += jump.DTS;

  const segmentType = file.slice(i, i + jump.segmentType);

  i += jump.segmentType;

  const segmentSize = file.slice(i, i + jump.segmentSize);

  i += jump.segmentSize;
  i += bufferToNumber(segmentSize);

  if (END.equals(segmentType)) {
    output.push(bufferToTimestamp(timestampBuffer));
  }

  if (i >= file.length) {
    break;
  }
}

console.log(output);
