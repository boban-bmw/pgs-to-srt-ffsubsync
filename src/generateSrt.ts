import fs from "fs";
import { timestampToSrt } from "./util";

export const generateSrt = (timestamps: number[]) => {
  const srtTimestamps = timestamps.map(timestampToSrt);

  const lines = [];

  let counter = 1;
  for (let i = 0; i < srtTimestamps.length; i += 2) {
    lines.push(`${counter.toString()}\n`);
    lines.push(`${srtTimestamps[i]} --> ${srtTimestamps[i + 1]}\n`);
    lines.push("PGS\n");
    lines.push("\n");

    counter += 1;
  }

  const outputStream = fs.createWriteStream("./output.srt");

  lines.forEach((line) => {
    outputStream.write(line);
  });
};
