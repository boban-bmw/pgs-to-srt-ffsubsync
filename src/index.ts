import fs from "fs";
import path from "path";
import yargs from "yargs";
import readdir from "recursive-readdir";
import minby from "lodash.minby";

import { generateTimestamps } from "./generateTimestamps";
import { generateSrt } from "./generateSrt";
import { getPGSStreams, extractSup } from "./ffmpeg";
import { makeSyncer, calcDiff } from "./ffs";

const { argv } = yargs.options({
  src: {
    type: "string",
    demandOption: true,
    describe:
      "Source folder which will be recursively traversed for .mkv and .srt files.",
  },
});

async function run() {
  console.log(`Scanning ${argv.src}...`);

  const mkvs = await readdir(argv.src, ["!*.mkv"]);
  const srts = await readdir(argv.src, ["!*.srt"]);

  for (const mkv of mkvs) {
    console.log(`Processing ${mkv}...`);

    const directory = path.dirname(mkv);

    const relevantSrts = srts.filter((srt) => path.dirname(srt) === directory);

    if (relevantSrts.length !== 0) {
      console.log(`Found ${relevantSrts.length} relevant .srt file(s)`);

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

      for (const srt of relevantSrts) {
        const syncWith = makeSyncer(srt);

        const results = await Promise.all(generatedSrts.map(syncWith));

        const bestMatch = minby(results, calcDiff);

        fs.copyFileSync(
          bestMatch!.filename,
          path.join(directory, `${path.basename(srt)}-synced.srt`)
        );

        console.log(
          `Best match - offset: ${bestMatch!.offset}, framerate scale factor: ${
            bestMatch!.framerateScaleFactor
          }`
        );
      }
    } else {
      console.log(`No .srt files found for ${mkv}`);
    }
  }
}

run();
