/**
 * Generate minimal valid PNG icons for PWA (pure Node.js, no deps)
 * Uses zlib + PNG chunk encoding
 */

const fs = require('fs');
const zlib = require('zlib');

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const header = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([header, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, header, data, crc]);
}

function createPng(width, height, bgColor) {
  // Create raw image data with solid color fill
  const rawData = [];
  const [r, g, b] = bgColor;
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b, 255); // RGBA
    }
  }
  const rawBuffer = Buffer.from(rawData);
  const compressed = zlib.deflateSync(rawBuffer);

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const png = Buffer.concat([
    signature,
    writeChunk('IHDR', ihdr),
    writeChunk('IDAT', compressed),
    writeChunk('IEND', Buffer.alloc(0)),
  ]);

  return png;
}

// 192x192 with deep ink background (#0E1318)
const icon192 = createPng(192, 192, [14, 19, 24]);
fs.writeFileSync('/Users/A.D.189/Work/seasonal-wellness/web-app/public/icons/icon-192.png', icon192);
console.log('Created icon-192.png');

// 512x512 with deep ink background
const icon512 = createPng(512, 512, [14, 19, 24]);
fs.writeFileSync('/Users/A.D.189/Work/seasonal-wellness/web-app/public/icons/icon-512.png', icon512);
console.log('Created icon-512.png');
