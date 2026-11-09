const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function generatePng(width, height, isMaskable = false) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Scanlines
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Colors:
  // Forest Green: #425B48 -> R: 66, G: 91, B: 72
  // Warm Ivory: #F5F3ED -> R: 245, G: 243, B: 237
  // Terracotta: #C38367 -> R: 195, G: 131, B: 103
  const bgR = 66, bgG = 91, bgB = 72;
  const fgR = 245, fgG = 243, fgB = 237;
  const accentR = 195, accentG = 131, accentB = 103;

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.45 : width * 0.42;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Base background:
      let r = bgR;
      let g = bgG;
      let b = bgB;
      let a = 255;

      // Corner rounding if not maskable
      if (!isMaskable) {
        const cornerRadius = width * 0.18;
        const dx = Math.abs(x - cx) - (cx - cornerRadius);
        const dy = Math.abs(y - cy) - (cy - cornerRadius);
        if (dx > 0 && dy > 0 && Math.sqrt(dx * dx + dy * dy) > cornerRadius) {
          a = 0; // Transparent outside rounded rect
        }
      }

      // Draw stylized 'W' monogram inside center
      if (a === 255) {
        const nx = (x - cx) / (width * 0.3); // -1 to 1
        const ny = (y - cy) / (height * 0.3); // -1 to 1

        // Monogram W: 4 diagonal strokes
        // Left stroke: from (-0.8, -0.6) to (-0.4, 0.6)
        // Mid-left stroke: from (-0.4, 0.6) to (0.0, -0.1)
        // Mid-right stroke: from (0.0, -0.1) to (0.4, 0.6)
        // Right stroke: from (0.4, 0.6) to (0.8, -0.6)
        const thickness = 0.18;
        let isStroke = false;

        function distToSegment(px, py, x1, y1, x2, y2) {
          const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
          if (l2 === 0) return Math.hypot(px - x1, py - y1);
          let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
          t = Math.max(0, Math.min(1, t));
          return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
        }

        const d1 = distToSegment(nx, ny, -0.75, -0.55, -0.38, 0.55);
        const d2 = distToSegment(nx, ny, -0.38, 0.55, 0.0, -0.1);
        const d3 = distToSegment(nx, ny, 0.0, -0.1, 0.38, 0.55);
        const d4 = distToSegment(nx, ny, 0.38, 0.55, 0.75, -0.55);

        const minDist = Math.min(d1, d2, d3, d4);
        if (minDist < thickness) {
          r = fgR;
          g = fgG;
          b = fgB;
        }

        // Small terracotta dot above right peak
        const dotDist = Math.hypot(nx - 0.75, ny - (-0.75));
        if (dotDist < 0.12) {
          r = accentR;
          g = accentG;
          b = accentB;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), generatePng(192, 192, false));
console.log('Generated icon-192.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), generatePng(512, 512, false));
console.log('Generated icon-512.png');

fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), generatePng(512, 512, true));
console.log('Generated icon-512-maskable.png');

fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), generatePng(180, 180, false));
console.log('Generated apple-touch-icon.png');
