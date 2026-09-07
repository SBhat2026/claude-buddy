/* Renders every animation frame to one PNG, for looking at the art outside the app. */
const fs = require("fs"), zlib = require("zlib"), path = require("path");
const src = fs.readFileSync(path.join(__dirname, "..", "Resources", "common.js"), "utf8");
const win = {}; new Function("window", src)(win);
const CB = win.CB;

const only = process.argv[3] ? process.argv[3].split(",") : null;
const keys = Object.keys(CB.DEFAULT_ANIMATIONS).filter(k => !only || only.includes(k));
const CELL = 6, PAD = 8, COLS = Math.max(...keys.map(k => CB.DEFAULT_ANIMATIONS[k].frames.length));
const CW = 16 * CELL + PAD, CH = 16 * CELL + PAD + 10;
const W = COLS * CW, H = keys.length * CH;
const px = Buffer.alloc(W * H * 4, 0);
const bg = [245, 244, 238, 255];
for (let i = 0; i < W * H; i++) { px[i*4]=bg[0]; px[i*4+1]=bg[1]; px[i*4+2]=bg[2]; px[i*4+3]=255; }
const pal = CB.paletteFor(null);
function set(x, y, c) { if (x<0||y<0||x>=W||y>=H) return; const i=(y*W+x)*4; px[i]=c[0];px[i+1]=c[1];px[i+2]=c[2];px[i+3]=255; }
function hex(h){const c=CB.hexToRgb(h);return [c.r,c.g,c.b];}
keys.forEach((k, row) => {
  const a = CB.normalizeAnim(CB.DEFAULT_ANIMATIONS[k], k);
  a.frames.forEach((f, col) => {
    const ox = col * CW + PAD/2, oy = row * CH + PAD/2;
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const ch = f[y][x];
      if (ch === "." || !pal[ch]) continue;
      const c = hex(pal[ch]);
      for (let dy = 0; dy < CELL; dy++) for (let dx = 0; dx < CELL; dx++) set(ox+x*CELL+dx, oy+y*CELL+dy, c);
    }
    for (let x = 0; x < 16*CELL; x++) set(ox+x, oy+16*CELL+2, [200,195,185]);
  });
});
function crc32(buf){let T=crc32.t;if(!T){T=crc32.t=new Int32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c;}}let c=-1;for(let i=0;i<buf.length;i++)c=T[(c^buf[i])&0xff]^(c>>>8);return c^-1;}
function chunk(t,d){const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const b=Buffer.concat([Buffer.from(t,"ascii"),d]);const c=Buffer.alloc(4);c.writeUInt32BE(crc32(b)>>>0);return Buffer.concat([l,b,c]);}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;
const raw=Buffer.alloc((W*4+1)*H);
for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;px.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);}
fs.writeFileSync(process.argv[2], Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",zlib.deflateSync(raw,{level:9})),chunk("IEND",Buffer.alloc(0))]));
console.log("wrote", process.argv[2], W+"x"+H);
