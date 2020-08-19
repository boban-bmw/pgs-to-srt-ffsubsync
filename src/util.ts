export const END = Buffer.from([0x80]);

export const jump = {
  PG: 2,
  PTS: 4,
  DTS: 4,
  segmentType: 1,
  segmentSize: 2,
};

export const bufferToNumber = (buffer: Buffer): number =>
  parseInt(buffer.toString("hex"), 16);

export const bufferToTimestamp = (buffer: Buffer): number =>
  bufferToNumber(buffer) / 90;
