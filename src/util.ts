export const END = Buffer.from([0x80]);

export const jump = {
  PG: 2,
  PTS: 4,
  DTS: 4,
  segmentType: 1,
  segmentSize: 2,
};

export const bufferToNumber = (buffer: Buffer) =>
  parseInt(buffer.toString("hex"), 16);

export const bufferToTimestamp = (buffer: Buffer) =>
  bufferToNumber(buffer) / 90;

const pad = (num: number) => num.toString().padStart(2, "0");

const padMilliseconds = (num: number) => num.toString().padStart(3, "0");

export const timestampToSrt = (timestamp: number) => {
  const milliseconds = padMilliseconds(timestamp % 1000);

  const timestampInSeconds = Math.floor(timestamp / 1000);
  const seconds = pad(timestampInSeconds % 60);

  const timestampInMinutes = Math.floor(timestampInSeconds / 60);
  const minutes = pad(timestampInMinutes % 60);

  const timestampInHours = Math.floor(timestampInMinutes / 60);
  const hours = pad(timestampInHours % 60);

  return `${hours}:${minutes}:${seconds},${milliseconds}`;
};
