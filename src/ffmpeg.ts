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

      resolve(
        (mkvData.streams.filter(
          (stream) => stream.codec_name === "hdmv_pgs_subtitle"
        ) as PGSStream[]).filter(
          (stream: PGSStream) => stream.tags.language === "eng"
        )
      );
    });
  });

export const extractStream = (mkv: string, pgsStream: PGSStream) =>
  new Promise((resolve, reject) => {
    const outputName = path.join(
      __dirname,
      "..",
      "tmp",
      `${path.basename(mkv)}-${pgsStream.index}.sup`
    );

    const command = ffmpeg()
      .input(fs.createReadStream(mkv))
      .output(outputName)
      .noAudio()
      .noVideo()
      .outputOptions("-map", `0:${pgsStream.index}`, "-c:s", "copy")
      .on("start", () => {
        console.log(`Processing ${mkv} stream ${pgsStream.index}...`);
      })
      .on("error", (e) => {
        reject(e);
      })
      .on("end", () => {
        console.log(`Extracted ${outputName}`);
        resolve(outputName);
      });

    command.run();
  });
