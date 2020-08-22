import fs from "fs";
import path from "path";
import yargs from "yargs";
import readdir from "recursive-readdir";
import minby from "lodash.minby";

import { generateTimestamps } from "./generateTimestamps";
import { generateSrt } from "./generateSrt";
import { getPGSStreams, extractSup } from "./ffmpeg";
import { makeSyncer, calcDiff, SyncResult } from "./ffs";

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
      try {
        console.log(`Found ${relevantSrts.length} relevant .srt file(s)`);

        const pgsStreams = (await getPGSStreams(mkv)).filter(Boolean);

        const supFiles = (
          await Promise.all(
            pgsStreams.map((pgsStream) => extractSup(mkv, pgsStream))
          )
        ).filter(Boolean);

        const generatedSrts = (
          await Promise.all(
            supFiles.map((sup) => {
              const timestamps = generateTimestamps(fs.readFileSync(sup));

              return generateSrt(timestamps, `${sup}.srt`);
            })
          )
        ).filter(Boolean);

        for (const srt of relevantSrts) {
          const syncWith = makeSyncer(srt);

          const results = (
            await Promise.all(generatedSrts.map(syncWith))
          ).filter((item): item is SyncResult => !!item);

          const bestMatch = minby(results, calcDiff);

          if (bestMatch) {
            fs.copyFileSync(bestMatch.filename, srt);

            console.log(
              `Best match - offset: ${bestMatch.offset}, framerate scale factor: ${bestMatch.framerateScaleFactor}`
            );
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      console.log(`No .srt files found for ${mkv}`);
    }
  }
}

run();
