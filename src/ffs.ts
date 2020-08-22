import child_process from "child_process";
type SyncResult = {
  offset: number;
  framerateScaleFactor: number;
  filename: string;
};

export const makeSyncer = (srt: string) => (generatedSrt: string) =>
  new Promise<SyncResult>((resolve, reject) => {
    console.log(`Syncing ${srt} with ${generatedSrt}...`);

    const filename = `${generatedSrt}-synced.srt`;

    let output = "";

    const child = child_process
      .spawn("ffs", [generatedSrt, "-i", srt, "-o", filename])
      .on("close", (code) => {
        if (code !== 0) {
          reject();
        } else {
          const offset = parseFloat(
            output.split("offset seconds: ")[1].slice(0, 5)
          );
          const framerateScaleFactor = parseFloat(
            output.split("framerate scale factor: ")[1].slice(0, 5)
          );

          resolve({
            offset,
            framerateScaleFactor,
            filename,
          });
        }
      });

    child.stderr.on("data", (chunk: Buffer) => {
      output += chunk.toString();
    });
  });

export const calcDiff = ({ offset, framerateScaleFactor }: SyncResult) =>
  Math.abs(offset) * (1 + Math.abs(framerateScaleFactor - 1));
