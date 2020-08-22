import fs from "fs";
import path from "path";
import yargs from "yargs";
import readdir from "recursive-readdir";
import ffmpeg from "fluent-ffmpeg";

import { generateTimestamps } from "./generateTimestamps";
import { generateSrt } from "./generateSrt";
import { getPGSStreams, extractSup } from "./ffmpeg";

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

    const relevantSrts = srts.filter((srt) => path.dirname(srt) === directory);

    if (relevantSrts.length !== 0) {
      const pgsStreams = await getPGSStreams(mkv);

      const supFiles = await Promise.all(
        pgsStreams.map((pgsStream) => extractSup(mkv, pgsStream))
      );

      const generatedSrts = await Promise.all(
        supFiles.map((sup) => {
          const timestamps = generateTimestamps(fs.readFileSync(sup));

          return generateSrt(timestamps, `${sup}.srt`);
        })
      );
    }
  }
}

run();
