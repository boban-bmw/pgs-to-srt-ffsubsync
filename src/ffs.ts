import child_process from "child_process";
type SyncResult = {
  offset: number;
  framerateScaleFactor: number;
  filename: string;
};

export const makeSyncer = (srt: string) => (generatedSrt: string) =>
  new Promise<SyncResult>((resolve, reject) => {
    console.log(`Syncing ${srt} with ${generatedSrt}`);

    const filename = `${generatedSrt}-synced.srt`;

    const child = child_process.spawnSync(
      "ffs",
      [generatedSrt, "-i", srt, "-o", filename],
      { encoding: "utf-8" }
    );

    if (child.status !== 0) {
      reject();
    }

    const offset = parseFloat(
      child.stderr.split("offset seconds: ")[1].slice(0, 5)
    );
    const framerateScaleFactor = parseFloat(
      child.stderr.split("framerate scale factor: ")[1].slice(0, 5)
    );

    resolve({
      offset,
      framerateScaleFactor,
      filename,
    });
  });

export const calcDiff = ({ offset, framerateScaleFactor }: SyncResult) =>
  Math.abs(offset) * (1 + Math.abs(framerateScaleFactor - 1));
