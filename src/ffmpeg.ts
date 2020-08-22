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
