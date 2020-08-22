import fs from "fs";
import path from "path";
import yargs from "yargs";
import readdir from "recursive-readdir";

import { generateTimestamps } from "./generateTimestamps";
import { generateSrt } from "./generateSrt";
import { getPGSStreams } from "./ffmpeg";

const { argv } = yargs.options({
  src: {
    type: "string",
    demandOption: true,
    describe:
      "Source folder which will be recursively traversed for .mkv and .srt files.",
  },
});

async function run() {
  const mkvs = await readdir(argv.src, ["!*.mkv"]);
  const srts = await readdir(argv.src, ["!*.srt"]);

  for (const mkv of mkvs) {
    const directory = path.dirname(mkv);

    const relevantSrts = srts.filter((path) => path.startsWith(directory));

    if (relevantSrts.length !== 0) {
      const PGSStreams = await getPGSStreams(mkv);

      console.log(PGSStreams);
    }
  }
}

// const pgs = fs.readFileSync("./test.sup");

// const timestamps = generateTimestamps(pgs);

// generateSrt(timestamps);

run();
