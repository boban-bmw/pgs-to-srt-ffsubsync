import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";

type PGSStream = ffmpeg.FfprobeStream & {
  tags: {
    language: string;
  };
};

export const getPGSStreams = (mkv: string) =>
  new Promise<PGSStream[]>((resolve, reject) => {
    ffmpeg.ffprobe(mkv, (err, mkvData) => {
      if (err) {
        reject(err);
        return;
      }

      const pgsStreams = (mkvData.streams.filter(
        (stream) => stream.codec_name === "hdmv_pgs_subtitle"
      ) as PGSStream[]).filter(
        (stream: PGSStream) => stream.tags.language === "eng"
      );

      console.log(`Found ${pgsStreams.length} PGS stream(s)`);

      resolve(pgsStreams);
    });
  });

export const extractSup = (mkv: string, pgsStream: PGSStream) =>
  new Promise<string>((resolve, reject) => {
    const outputName = path.join(
      __dirname,
      "..",
      "tmp",
      `${path.basename(mkv)}-${pgsStream.index}.sup`
    );

    if (fs.existsSync(outputName)) {
      console.log(`Stream ${pgsStream.index} already extracted, skipping...`);

      resolve(outputName);
      return;
    }

    const command = ffmpeg()
      .input(fs.createReadStream(mkv))
      .output(outputName)
      .noAudio()
      .noVideo()
      .outputOptions("-map", `0:${pgsStream.index}`, "-c:s", "copy")
      .on("start", () => {
        console.log(`Processing stream ${pgsStream.index}...`);
      })
      .on("error", (e) => {
        reject(e);
      })
      .on("end", () => {
        console.log(`Extracted stream ${pgsStream.index}`);
        resolve(outputName);
      });

    command.run();
  });
