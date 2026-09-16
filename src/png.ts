const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;
const SRGB_CHUNK_TYPE = [0x73, 0x52, 0x47, 0x42] as const;

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < CRC_TABLE.length; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  CRC_TABLE[index] = value >>> 0;
}

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunkType(bytes: Uint8Array, offset: number) {
  return String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
}

function createSrgbChunk() {
  const chunk = new Uint8Array(13);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, 1);
  chunk.set(SRGB_CHUNK_TYPE, 4);
  chunk[8] = 0;
  view.setUint32(9, crc32(chunk.subarray(4, 9)));
  return chunk;
}

export async function ensureSrgbPng(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (!PNG_SIGNATURE.every((byte, index) => bytes[index] === byte)) {
    throw new Error("Cannot add an sRGB profile to a non-PNG image");
  }

  let offset: number = PNG_SIGNATURE.length;
  let insertionOffset = -1;
  while (offset + 12 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    const end = offset + length + 12;
    if (end > bytes.length) throw new Error("Invalid PNG chunk length");
    const type = chunkType(bytes, offset);
    if (type === "sRGB" || type === "iCCP") return blob;
    if (type === "IHDR") insertionOffset = end;
    if (type === "IEND") break;
    offset = end;
  }

  if (insertionOffset < 0) throw new Error("PNG is missing its IHDR chunk");
  const srgb = createSrgbChunk();
  const tagged = new Uint8Array(bytes.length + srgb.length);
  tagged.set(bytes.subarray(0, insertionOffset));
  tagged.set(srgb, insertionOffset);
  tagged.set(bytes.subarray(insertionOffset), insertionOffset + srgb.length);
  return new Blob([tagged], { type: "image/png" });
}
