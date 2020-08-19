import fs from "fs";
import { generateTimestamps } from "./generateTimestamps";
import { generateSrt } from "./generateSrt";

const pgs = fs.readFileSync("./test.sup");

const timestamps = generateTimestamps(pgs);

generateSrt(timestamps);
