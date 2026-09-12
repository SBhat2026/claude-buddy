/* Renders the buddy into a 1024px PNG for the app icon. No dependencies. */
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "..", "Resources", "common.js"), "utf8");
const win = {};
new Function("window", src)(win);
const CB = win.CB;

const SIZE = 1024;
const idle = CB.DEFAULT_ANIMATIONS.idle.frames[0];
const pal = CB.paletteFor(null);
const BG = [245, 244, 238, 255];

const px = Buffer.alloc(SIZE * SIZE * 4, 0);
function set(x, y, rgba) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  const i = (y * SIZE + x) * 4;
  px[i] = rgba[0]; px[i + 1] = rgba[1]; px[i + 2] = rgba[2]; px[i + 3] = rgba[3];
}
function hex(h) { const c = CB.hexToRgb(h); return [c.r, c.g, c.b, 255]; }

/* rounded-square backdrop, macOS-ish inset */
const inset = Math.round(SIZE * 0.08), r = Math.round(SIZE * 0.22);
for (let y = inset; y < SIZE - inset; y++) {
  for (let x = inset; x < SIZE - inset; x++) {
    const dx = Math.max(inset + r - x, 0, x - (SIZE - inset - r));
    const dy = Math.max(inset + r - y, 0, y - (SIZE - inset - r));
    if (dx * dx + dy * dy <= r * r) set(x, y, BG);
  }
}

/* the sprite, centred */
const cell = Math.floor((SIZE - inset * 2) * 0.72 / 16);
const ox = Math.round((SIZE - cell * 16) / 2);
const oy = Math.round((SIZE - cell * 16) / 2) + Math.round(cell * 0.4);
for (let gy = 0; gy < 16; gy++) {
  for (let gx = 0; gx < 16; gx++) {
    const ch = idle[gy][gx];
    if (ch === "." || !pal[ch]) continue;
    const col = hex(pal[ch]);
    for (let y = 0; y < cell; y++) for (let x = 0; x < cell; x++) set(ox + gx * cell + x, oy + gy * cell + y, col);
  }
}

/* PNG */
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body) >>> 0);
  return Buffer.concat([len, body, crc]);
}
let TABLE = null;
function crc32(buf) {
  if (!TABLE) {
    TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TABLE[n] = c; }
  }
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ -1;
}
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(SIZE, 0); ihdr.writeUInt32BE(SIZE, 4);
ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const raw = Buffer.alloc((SIZE * 4 + 1) * SIZE);
for (let y = 0; y < SIZE; y++) {
  raw[y * (SIZE * 4 + 1)] = 0;
  px.copy(raw, y * (SIZE * 4 + 1) + 1, y * SIZE * 4, (y + 1) * SIZE * 4);
}
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", ihdr),
  chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0))
]);
const out = process.argv[2] || path.join(__dirname, "..", "build", "icon.png");
fs.writeFileSync(out, png);
console.log("wrote", out, png.length + " bytes");

/* The menu bar gets the same creature, not a hand-drawn approximation of him.
   A template image is drawn where it is opaque and tinted by the system, so his
   body is black and his eyes are holes — which is why he reads on a light menu bar
   and on a dark one without two artworks. */
(function menubar() {
  const rows = idle;
  let x0 = 16, x1 = -1, y0 = 16, y1 = -1;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    if (rows[y][x] === ".") continue;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  const cell = 4, W2 = (x1 - x0 + 1) * cell, H2 = (y1 - y0 + 1) * cell;
  const buf = Buffer.alloc(W2 * H2 * 4, 0);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const ch = rows[y][x];
    if (ch !== "1") continue;                       /* eyes stay as holes */
    for (let dy = 0; dy < cell; dy++) for (let dx = 0; dx < cell; dx++) {
      const px2 = ((y - y0) * cell + dy) * W2 + ((x - x0) * cell + dx);
      buf[px2 * 4] = 0; buf[px2 * 4 + 1] = 0; buf[px2 * 4 + 2] = 0; buf[px2 * 4 + 3] = 255;
    }
  }
  const ih = Buffer.alloc(13);
  ih.writeUInt32BE(W2, 0); ih.writeUInt32BE(H2, 4);
  ih[8] = 8; ih[9] = 6;
  const raw2 = Buffer.alloc((W2 * 4 + 1) * H2);
  for (let y = 0; y < H2; y++) {
    raw2[y * (W2 * 4 + 1)] = 0;
    buf.copy(raw2, y * (W2 * 4 + 1) + 1, y * W2 * 4, (y + 1) * W2 * 4);
  }
  const out2 = path.join(__dirname, "..", "Resources", "menubar.png");
  fs.writeFileSync(out2, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ih),
    chunk("IDAT", zlib.deflateSync(raw2, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]));
  console.log("wrote", out2, W2 + "x" + H2);
})();
