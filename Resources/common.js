/* Claude Buddy — shared sprite data, rendering and state. Used by pet.html and studio.html. */

/* ---------- pixel vocabulary ----------
   '.' transparent   '1' body   '2' shade   '3' light   '0' dark (eyes)   'w' white
   Every frame is 16 rows of 16 characters.                                        */

/* ---------- the character ----------
   Claude Code draws Clawd in the terminal with quadrant blocks. Decoded to pixels,
   that art is exactly:

       .############.     12 wide
       .##.######.##.     the eyes are NOTCHES, at the outer thirds
       #############.     13 wide — the widest row
       .##########...     10 wide
       #.#....#.#....     four legs, two pairs, a four-cell gap

   Those four body rows are copied cell for cell and never change again. The body is
   not squashed, stretched, leaned, tipped over or redrawn by any animation in this
   file — a character whose head changes shape every frame is a character that
   wobbles, and this one does not.

   Three things move, and only these three:

     the EYES   — open, shut, wide, or looking to one side
     the LEGS   — the rows under the body: lifted, splayed, tucked, kicked
     the ARMS   — cells to the left and right of the body, out or raised

   Everything below is a combination of those.                                    */

/* Paint spans into a 16-wide row: R(["1", 2, 13]) fills columns 2 to 13. */
function R(...spans) {
  const row = new Array(16).fill(".");
  for (const [ch, from, to] of spans) {
    for (let x = Math.max(0, from); x <= Math.min(to, 15); x++) row[x] = ch;
  }
  return row.join("");
}

const BLANK = R();

/* ── the body: four rows, fixed forever ── */
const HEAD  = R(["1", 2, 13]);                                  /* 12 wide */
const BULGE = R(["1", 1, 13]);                                  /* 13 wide */
const HIPS  = R(["1", 2, 11]);                                  /* 10 wide */

/* ── the eyes: notches where the original has them ── */
const EYES   = R(["1", 2, 13], ["0", 4, 4], ["0", 11, 11]);
const EYES_C = R(["1", 2, 13], ["2", 4, 4], ["2", 11, 11]);     /* shut      */
const EYES_W = R(["1", 2, 13], ["0", 4, 5], ["0", 10, 11]);     /* wide      */
const EYES_L = R(["1", 2, 13], ["0", 3, 3], ["0", 10, 10]);     /* looking left  */
const EYES_R = R(["1", 2, 13], ["0", 5, 5], ["0", 12, 12]);     /* looking right */

/* ── the arms: cells beside the body, never inside it ── */
const ARM_OUT_R  = R(["1", 1, 14]);        /* bulge row, right hand out      */
const ARM_OUT_L  = R(["1", 0, 13]);
const ARM_OUT_LR = R(["1", 0, 14]);
const ARM_UP_R   = R(["1", 2, 13], ["0", 4, 4], ["0", 11, 11], ["1", 14, 14]);
const ARM_UP_LR  = R(["1", 2, 13], ["0", 4, 4], ["0", 11, 11], ["1", 0, 0], ["1", 14, 14]);
const ARM_HIGH_R = R(["1", 14, 14]);                 /* hand above the head  */
const ARM_HIGH_LR= R(["1", 0, 0], ["1", 14, 14]);
const ARM_HOLD   = R(["1", 1, 13], ["3", 14, 15]);   /* holding a snack      */
const ARM_PAGE_A = R(["1", 1, 13], ["w", 14, 15]);   /* holding a page       */
const ARM_PAGE_B = R(["1", 1, 13], ["w", 14, 14], ["0", 15, 15]);
const ARM_MUG    = R(["1", 2, 13], ["2", 4, 4], ["2", 11, 11], ["1", 14, 14], ["c", 15, 15]);

/* ── the legs: the rows under the body ── */
const LEGS      = R(["1", 1, 1], ["1", 3, 3], ["1", 8, 8], ["1", 10, 10]);
const LEGS_FR   = R(["1", 1, 1], ["1", 3, 3]);                  /* front pair only */
const LEGS_BK   = R(["1", 8, 8], ["1", 10, 10]);                /* back pair only  */
const LEGS_WIDE = R(["1", 0, 0], ["1", 3, 3], ["1", 8, 8], ["1", 11, 11]);
const LEGS_IN   = R(["1", 2, 2], ["1", 4, 4], ["1", 7, 7], ["1", 9, 9]);
const LEGS_KICK = R(["1", 1, 1], ["1", 3, 3], ["1", 8, 8], ["1", 12, 12]);
const LEGS_KICK2= R(["1", 1, 1], ["1", 3, 3], ["1", 8, 8], ["1", 13, 13]);
const FEET      = R(["1", 1, 2], ["1", 10, 12]);                /* sitting         */

/* ── things around him, drawn clear of the body ── */
const BAND     = R(["0", 5, 10]);                      /* headphone band, above   */
const EYES_CUPS  = R(["1", 2, 13], ["0", 4, 4], ["0", 11, 11], ["0", 1, 1], ["0", 14, 14]);
const EYES_CUPS_C= R(["1", 2, 13], ["2", 4, 4], ["2", 11, 11], ["0", 1, 1], ["0", 14, 14]);
const BOX_TOP  = R(["0", 4, 11]);
const BOX_MID  = R(["0", 4, 4], ["3", 5, 10], ["0", 11, 11]);
const DESK     = R(["0", 0, 15]);
const DESK_LEG = R(["2", 1, 2], ["2", 12, 13]);
const Z_HI     = R(["0", 13, 13]);
const Z_LO     = R(["0", 14, 14]);
const NOTE_HI  = R(["3", 13, 13]);
const NOTE_LO  = R(["3", 1, 1]);

/* Frames are bottom-aligned: the last row you give S() lands on the floor. */
function S(...rows) {
  const out = new Array(16).fill(BLANK);
  const first = 14 - rows.length;
  for (let i = 0; i < rows.length; i++) out[first + i] = rows[i];
  return out;
}
/* A() floats something clear above him — a Z, a note, a box, a headband. */
function A(frame, row, content) {
  const out = frame.slice();
  out[row] = content;
  return out;
}

/* The body, with whichever eyes and arms this frame wants. Rows one and three are
   the only ones an animation may vary, and only outside the body's own columns. */
const B = (eyes, bulge) => [HEAD, eyes || EYES, bulge || BULGE, HIPS];

const F = {
  /* standing, legs together */
  idle:     S(...B(), LEGS, LEGS),
  blink:    S(...B(EYES_C), LEGS, LEGS),
  wideEyed: S(...B(EYES_W), LEGS, LEGS),

  /* walking: one pair of legs comes up, the body does not move a pixel */
  stepA:    S(...B(), LEGS, LEGS_FR),
  stepB:    S(...B(), LEGS, LEGS_BK),
  stepC:    S(...B(), LEGS_IN, LEGS_FR),
  stepD:    S(...B(), LEGS_IN, LEGS_BK),

  /* legs only: tucked for a crouch, long for a leap, splayed for a fall */
  tuck:     S(...B(EYES_W), LEGS),
  reachDown:S(...B(EYES_W), LEGS, LEGS, LEGS),
  splay:    S(...B(EYES_W), LEGS_WIDE, LEGS_WIDE),
  dangle:   S(...B(EYES_W), LEGS_WIDE, LEGS_FR),
  dangle2:  S(...B(EYES_W), LEGS_WIDE, LEGS_BK),
  squash:   S(...B(EYES_W), LEGS_IN),

  /* arms */
  waveUp:   S(HEAD, ARM_UP_R, BULGE, HIPS, LEGS, LEGS),
  waveHigh: A(S(HEAD, ARM_UP_R, BULGE, HIPS, LEGS, LEGS), 7, ARM_HIGH_R),
  reachR:   S(HEAD, EYES, ARM_OUT_R, HIPS, LEGS, LEGS),
  reachL:   S(HEAD, EYES, ARM_OUT_L, HIPS, LEGS, LEGS),
  armsOut:  S(HEAD, EYES_C, ARM_OUT_LR, HIPS, LEGS, LEGS),
  armsUp:   A(S(HEAD, ARM_UP_LR, BULGE, HIPS, LEGS, LEGS), 7, ARM_HIGH_LR),
  armsUp2:  A(S(HEAD, ARM_UP_LR, BULGE, HIPS, LEGS, LEGS_IN), 7, ARM_HIGH_LR),
  holdPageA:S(HEAD, EYES_C, ARM_PAGE_A, HIPS, LEGS, LEGS),
  holdPageB:S(HEAD, EYES_C, ARM_PAGE_B, HIPS, LEGS, LEGS),
  holdSnack:S(HEAD, EYES, ARM_HOLD, HIPS, LEGS, LEGS),
  sip:      S(HEAD, ARM_MUG, BULGE, HIPS, LEGS, LEGS),

  /* eyes only */
  lookL:    S(...B(EYES_L), LEGS, LEGS),
  lookR:    S(...B(EYES_R), LEGS, LEGS),
  shut:     S(...B(EYES_C), LEGS, LEGS),

  /* sitting: the legs fold, so he ends up lower — the body is the same body */
  sitA:     S(...B(), FEET),
  sitB:     S(...B(EYES_C), FEET),

  /* sleeping */
  sleepA:   S(...B(EYES_C), LEGS_IN),
  sleepB:   A(S(...B(EYES_C), LEGS_IN), 7, Z_HI),
  sleepC:   A(S(...B(EYES_C), LEGS_IN), 6, Z_LO),
  napA:     A(S(...B(EYES_C), FEET), 8, Z_HI),
  napB:     A(S(...B(EYES_C), FEET), 7, Z_LO),

  /* kicking: one leg swings forward */
  kickA:    S(...B(), LEGS, LEGS_KICK),
  kickB:    S(...B(), LEGS, LEGS_KICK2),

  /* thinking */
  thinkA:   A(S(...B(), LEGS, LEGS), 7, NOTE_HI),
  thinkB:   A(S(...B(EYES_C), LEGS, LEGS), 6, NOTE_HI),

  /* headphones sit above and beside the head, never on it */
  deskA:    A(S(HEAD, EYES_CUPS, BULGE, HIPS, DESK, DESK_LEG), 7, BAND),
  deskB:    A(S(HEAD, EYES_CUPS_C, ARM_OUT_R, HIPS, DESK, DESK_LEG), 7, BAND),
  grooveA:  A(A(S(HEAD, EYES_CUPS, BULGE, HIPS, LEGS, LEGS_FR), 7, BAND), 6, NOTE_HI),
  grooveB:  A(A(S(HEAD, EYES_CUPS, BULGE, HIPS, LEGS, LEGS_BK), 7, BAND), 6, NOTE_LO),

  /* carrying: the box rides above him */
  carryA:   A(A(S(HEAD, EYES_W, ARM_OUT_LR, HIPS, LEGS, LEGS), 6, BOX_TOP), 7, BOX_MID),
  carryB:   A(A(S(HEAD, EYES_W, ARM_OUT_LR, HIPS, LEGS, LEGS_FR), 6, BOX_TOP), 7, BOX_MID)
};

/* ---------- the animation library ---------- */

const DEFAULT_ANIMATIONS = {
  idle:  { name: "idle",  builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0,0,0],
           frames: [F.idle,F.idle,F.idle,F.idle,F.blink,F.idle] },
  walk:  { name: "walk",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.idle,F.stepB,F.idle] },
  run:   { name: "run",   builtin: true, fps: 14, loop: true,  bob: [0,0,0,0],
           frames: [F.stepC,F.stepA,F.stepD,F.stepB] },
  jump:  { name: "jump",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.tuck,F.reachDown,F.reachDown,F.tuck] },
  sleep: { name: "sleep", builtin: true, fps: 1.5,loop: true,  bob: [0,0,0],
           frames: [F.sleepA,F.sleepB,F.sleepC] },
  wave:  { name: "wave",  builtin: true, fps: 6,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.waveUp,F.waveHigh,F.waveUp] },
  work:  { name: "work",  builtin: true, fps: 7,  loop: true,  bob: [0,0,0,0],
           frames: [F.reachR,F.idle,F.reachR,F.idle] },
  dance: { name: "dance", builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.reachR,F.stepB,F.reachL] },
  think: { name: "think", builtin: true, fps: 2,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.thinkA,F.thinkB,F.thinkA] },
  held:  { name: "held",  builtin: true, fps: 5,  loop: true,  bob: [0,0],
           frames: [F.dangle,F.dangle2] },
  fall:  { name: "fall",  builtin: true, fps: 6,  loop: true,  bob: [0,0],
           frames: [F.splay,F.splay] },
  land:  { name: "land",  builtin: true, fps: 10, loop: false, bob: [0,0,0],
           frames: [F.squash,F.tuck,F.idle] },
  kick:  { name: "kick",  builtin: true, fps: 10, loop: false, bob: [0,0,0,0],
           frames: [F.stepB,F.kickA,F.kickB,F.idle] },
  flip:  { name: "hop",   builtin: true, fps: 11, loop: false, bob: [0,-3,-5,-2,0],
           frames: [F.tuck,F.tuck,F.reachDown,F.tuck,F.idle] },
  drink: { name: "drink", builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.sip,F.sip,F.idle] },
  abed:  { name: "in bed",builtin: true, fps: 1.2,loop: true,  bob: [0,0,0,0],
           frames: [F.napA,F.napB,F.napA,F.napB] },

  desk:  { name: "at the desk", builtin: true, fps: 5, loop: true, bob: [0,0,0,0],
           frames: [F.deskA,F.deskB,F.deskA,F.deskB] },
  chill: { name: "chilling",    builtin: true, fps: 1.4, loop: true, bob: [0,0,0,0],
           frames: [F.sitA,F.sitB,F.sitA,F.sitA] },
  sit:   { name: "sitting",     builtin: true, fps: 1.6, loop: true, bob: [0,0],
           frames: [F.sitA,F.sitA] },
  read:  { name: "reading",     builtin: true, fps: 1.6, loop: true, bob: [0,0,0],
           frames: [F.holdPageA,F.holdPageA,F.holdPageB] },
  stretch:{ name: "stretching", builtin: true, fps: 2.5, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.armsOut,F.armsOut,F.idle] },
  cheer: { name: "celebrating", builtin: true, fps: 9, loop: true, bob: [0,0,0,0],
           frames: [F.armsUp,F.armsUp2,F.armsUp,F.armsUp2] },
  peek:  { name: "looking round",builtin: true, fps: 1.6, loop: true, bob: [0,0,0,0],
           frames: [F.lookL,F.idle,F.lookR,F.idle] },
  carry: { name: "carrying",    builtin: true, fps: 6, loop: true, bob: [0,0,0,0],
           frames: [F.carryA,F.carryB,F.carryA,F.carryB] },
  snack: { name: "snacking",    builtin: true, fps: 3, loop: true, bob: [0,0,0,0],
           frames: [F.holdSnack,F.shut,F.holdSnack,F.idle] },
  groove:{ name: "grooving",    builtin: true, fps: 7, loop: true, bob: [0,0,0,0],
           frames: [F.grooveA,F.grooveB,F.grooveA,F.grooveB] },
  nap:   { name: "dozing",      builtin: true, fps: 1.2, loop: true, bob: [0,0],
           frames: [F.napA,F.napB] }
};

/* Animations he may pick on his own when he has nothing better to do. */
const DEFAULT_ROTATION = ["wave", "dance", "work", "think", "jump", "desk", "chill", "read", "stretch", "groove", "sit"];

/* Actions the engine needs and must never lose. */
const REQUIRED = ["idle", "walk", "run", "sleep", "held", "fall", "land"];

/* ---------- props ----------
   Small 8x8 things he can take out and use. Their own palette: they are objects in
   the world, not part of him, so they do not recolour when he does.               */

const PROP_PALETTE = {
  w: "#fbfaf6", k: "#2b1a14", m: "#e7e1d3", c: "#5a3a24",
  s: "#9ed4cb", r: "#d0574c", d: "#c9c2b4", y: "#e8c15a", g: "#6fae6a",
  f: "#8fa9d8"
};

const PROPS = {
  mug: { size: 8, frames: [
    ["........", "........", ".mmmmm..", ".mcccm.m", ".mcccmmm", ".mcccm.m", ".mmmmm..", "........"],
    ["...s....", "..s.....", ".mmmmm..", ".mcccm.m", ".mcccmmm", ".mcccm.m", ".mmmmm..", "........"],
    ["..s.....", "...s....", ".mmmmm..", ".mcccm.m", ".mcccmmm", ".mcccm.m", ".mmmmm..", "........"]
  ]},
  laptop: { size: 8, frames: [
    ["........", "..kkkk..", ".kssssk.", ".ksssk..", "kkkkkkkk", ".kkkkkk.", "........", "........"],
    ["........", "..kkkk..", ".kssskk.", ".kssssk.", "kkkkkkkk", ".kkkkkk.", "........", "........"]
  ]},
  heart: { size: 8, frames: [
    ["........", ".rr.rr..", "rrrrrrr.", "rrrrrrr.", ".rrrrr..", "..rrr...", "...r....", "........"]
  ]},
  /* built in three stages, so you see him put it up */
  /* Dark frame rather than the white a real goal has: white posts disappear into a
     pale desktop, and dark is the weight his own outline already carries. */
  goal: { size: 16, frames: [
    ["k..............k", "k..............k", "k..............k", "k..............k",
     "k..............k", "k..............k", "k..............k"],
    ["kkkkkkkkkkkkkkkk", "k..............k", "k..............k", "k..............k",
     "k..............k", "k..............k", "k..............k"],
    ["kkkkkkkkkkkkkkkk", "k.d...d...d...dk", "k...d...d...d..k", "k.d...d...d...dk",
     "k...d...d...d..k", "k.d...d...d...dk", "k..............k"]
  ]},
  /* carried folded, then unrolled */
  bed: { size: 16, frames: [
    ["................", "................", "......kffk......", "......kffk......"],
    ["..wwww..........", ".kffffffffffffk.", ".kffffffffffffk.", ".k............k."]
  ]},
  drone: { size: 8, frames: [
    ["........", "d......d", ".dd..dd.", "..kkkk..", "..kwwk..", "...kk...", "........", "........"],
    ["........", ".d....d.", "dd.dd.dd", "..kkkk..", "..kwwk..", "...kk...", "........", "........"]
  ]},
  puff: { size: 8, frames: [
    ["........", "........", "...dd...", "..d..d..", ".d....d.", "........", "........", "........"],
    ["........", "..d...d.", ".d.....d", "d.......", "......d.", "........", "........", "........"]
  ]}
};

function drawProp(ctx, name, frameIndex, o) {
  const prop = PROPS[name];
  if (!prop) return;
  const rows = prop.frames[Math.abs(frameIndex | 0) % prop.frames.length];
  const s = o.scale || 3;
  const h = rows.length, w = rows[0].length;
  const x0 = o.cx - (w * s) / 2;
  const y0 = o.baseY != null ? o.baseY - h * s : o.cy - (h * s) / 2;
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.flip) { ctx.translate(o.cx * 2, 0); ctx.scale(-1, 1); }
  for (let y = 0; y < h; y++) {
    const py = Math.round(y0 + y * s), ph = Math.round(y0 + (y + 1) * s) - py;
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (!ch || ch === ".") continue;
      const col = PROP_PALETTE[ch];
      if (!col) continue;
      const px = Math.round(x0 + x * s), pw = Math.round(x0 + (x + 1) * s) - px;
      ctx.fillStyle = col;
      ctx.fillRect(px, py, pw, ph);
    }
  }
  ctx.restore();
}


/* ---------- the ball ----------
   Everything else here is drawn on his 16x16 grid. The ball is not: a football
   rendered as eight fat squares reads as a dice, and at the size a real one would
   be next to him — about the length of one of his legs — there are not enough
   pixels left to say "football" at all. So it is drawn round, with the three
   curved panels of the 2026 tournament ball, and kept in his palette's key: warm
   white, his dark for the seams, and flat unshaded colour like the rest of him. */

const BALL_COLORS = { red: "#e0342b", blue: "#1f4fd0", green: "#1f9c4d", white: "#fdfbf5", seam: "#2b1a14" };

function pentagonPath(ctx, r) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const x = r * Math.cos(a), y = r * Math.sin(a);
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/* A football, not a pixel of one: a dark centre patch, three patches around it in
   the red/blue/green of the 2026 tournament ball, and one heavy dark rim — which is
   the same weight his own outline has, so it sits with him rather than on top of
   him. Panels tried as three big colour wedges read as a beach ball at this size;
   the patch layout is what makes fourteen pixels say "football". */
function drawBall(ctx, o) {
  const r = Math.max(3, o.r || 7);
  ctx.save();
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.translate(o.cx, o.cy);

  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fillStyle = BALL_COLORS.white;
  ctx.fill();

  ctx.save();
  ctx.clip();
  ctx.rotate(o.angle || 0);
  ctx.fillStyle = BALL_COLORS.seam;
  pentagonPath(ctx, r * 0.34);
  ctx.fill();
  const cols = [BALL_COLORS.red, BALL_COLORS.blue, BALL_COLORS.green];
  for (let i = 0; i < 3; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    ctx.save();
    ctx.translate(r * 0.78 * Math.cos(a), r * 0.78 * Math.sin(a));
    ctx.rotate(a);
    ctx.fillStyle = cols[i];
    pentagonPath(ctx, r * 0.26);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(0, 0, r - Math.max(0.5, r * 0.07), 0, Math.PI * 2);
  ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.strokeStyle = BALL_COLORS.seam;
  ctx.stroke();
  ctx.restore();
}

/* ---------- colours ---------- */

const DEFAULT_COLORS = { body: "#c4785a", shade: "#a05a41", light: "#e2a184", dark: "#2b1a14", white: "#ffffff" };

function hexToRgb(h) {
  h = String(h || "").replace("#", "");
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  const n = parseInt(h || "000000", 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHex(r, g, b) {
  const c = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}
function mix(hex, target, amount) {
  const a = hexToRgb(hex), b = hexToRgb(target);
  return rgbToHex(a.r + (b.r - a.r) * amount, a.g + (b.g - a.g) * amount, a.b + (b.b - a.b) * amount);
}
/* shade/light follow the body colour unless the user pinned them */
function resolveColors(colors) {
  const c = Object.assign({}, DEFAULT_COLORS, colors || {});
  if (!c.pinShade) c.shade = mix(c.body, "#000000", 0.28);
  if (!c.pinLight) c.light = mix(c.body, "#ffffff", 0.34);
  return c;
}
function paletteFor(colors) {
  const c = resolveColors(colors);
  return { "1": c.body, "2": c.shade, "3": c.light, "0": c.dark, "w": c.white };
}

/* ---------- drawing ---------- */

const GRID = 16;
/* Row 14 is the ground line the art stands on — the editor draws it, the engine honours it. */
const FOOT_ROW = 14;

function normalizeFrame(rows) {
  const out = [];
  for (let y = 0; y < GRID; y++) {
    let row = (rows && rows[y]) || "";
    row = String(row).slice(0, GRID);
    while (row.length < GRID) row += ".";
    out.push(row);
  }
  return out;
}

function normalizeAnim(a, fallbackName) {
  const anim = Object.assign({}, a);
  anim.name = anim.name || fallbackName || "untitled";
  anim.fps = Math.max(0.5, Math.min(30, Number(anim.fps) || 6));
  anim.loop = anim.loop !== false;
  anim.frames = (Array.isArray(anim.frames) && anim.frames.length ? anim.frames : [F.idle]).map(normalizeFrame);
  const bob = Array.isArray(anim.bob) ? anim.bob : [];
  anim.bob = anim.frames.map((_, i) => Number(bob[i]) || 0);
  return anim;
}

/* Draw one frame. (cx, baseY) is where the feet stand, in canvas pixels. */
function drawFrame(ctx, frame, opts) {
  const scale = opts.scale || 3;
  const pal = opts.palette || paletteFor(null);
  const flip = opts.flip ? -1 : 1;
  const bob = opts.bob || 0;
  const x0 = opts.cx - (GRID * scale) / 2;
  const y0 = opts.baseY - (GRID * scale) + bob * scale;
  ctx.save();
  if (opts.alpha != null) ctx.globalAlpha = opts.alpha;
  // Rotation is about the point his feet touch, so a quarter turn puts him on a
  // wall rather than sliding him off one.
  if (opts.angle) {
    ctx.translate(opts.cx, opts.baseY);
    ctx.rotate(opts.angle);
    ctx.translate(-opts.cx, -opts.baseY);
  }
  if (flip === -1) { ctx.translate(opts.cx * 2, 0); ctx.scale(-1, 1); }
  /* Cell edges are rounded rather than the cell size, so a fractional scale — 3.6
     rather than 4 — still tiles without seams or overlaps. */
  for (let y = 0; y < GRID; y++) {
    const row = frame[y] || "";
    const py = Math.round(y0 + y * scale), ph = Math.round(y0 + (y + 1) * scale) - py;
    for (let x = 0; x < GRID; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      const col = pal[ch];
      if (!col) continue;
      const px = Math.round(x0 + x * scale), pw = Math.round(x0 + (x + 1) * scale) - px;
      ctx.fillStyle = col;
      ctx.fillRect(px, py, pw, ph);
    }
  }
  ctx.restore();
}

function drawShadow(ctx, cx, baseY, scale, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 0.18 : alpha;
  ctx.fillStyle = "#000000";
  const w = GRID * scale * 0.62, h = Math.max(2, scale);
  ctx.beginPath();
  ctx.ellipse(cx, baseY + h * 0.4, w / 2, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* Draw a frame standing on groundY, with its shadow under its feet. */
function drawStanding(ctx, frame, o) {
  const s = o.scale || 3;
  if (o.shadow !== false) drawShadow(ctx, o.cx, o.groundY, s, o.shadowAlpha);
  drawFrame(ctx, frame, {
    cx: o.cx, baseY: o.groundY + (GRID - FOOT_ROW) * s, scale: s,
    palette: o.palette, flip: o.flip, bob: o.bob, alpha: o.alpha
  });
}

/* ---------- state ---------- */

const SPRITE_VERSION = 2;

const DEFAULT_STATE = {
  version: SPRITE_VERSION,
  name: "Claude",
  look: { scale: 4.8, colors: Object.assign({}, DEFAULT_COLORS), shadow: true, opacity: 1 },
  behavior: {
    energy: 0.5,          /* how often he decides to do something          */
    walkSpeed: 26,        /* screen px per second                          */
    runSpeed: 74,
    gravity: 1400,
    followCursor: false,
    clickReact: true,
    sleepAfter: 60,       /* seconds of nothing before he naps, 0 = never  */
    speech: true,
    phrases: ["thinking…", "reading the notes", "one sec", "compiling", "ship it", "hm.", "…", "beep"],
    alwaysOnTop: true,
    edgeMargin: 24,
    playBall: true,        /* he takes a ball out and knocks it about       */
    useProps: true,        /* laptop while working, mug on a coffee break   */
    nightMode: true,       /* dozes off sooner in the small hours           */
    talkOnClick: true,     /* click him and type at him                      */
    useWindows: true,      /* jumps onto search bars, toolbars, tab strips    */
    buildGoal: true,       /* puts up a goal and takes shots at it           */
    flyDrone: true,
    walkPet: true,         /* takes his own small pet out                    */
    useBed: true,          /* pulls out a bed rather than dropping where he stands */
    checkIn: true,         /* asks how it is going, now and then             */
    checkInMinutes: 45
  },

  /* What he does about whatever you are doing. First match wins; `match` is a
     case-insensitive regular expression tried against "<app> <window title>". */
  reactions: [
    { match: "xcode|vs ?code|cursor|terminal|iterm|zed|sublime|vim|emacs|claude", do: "work",  say: "" },
    { match: "spotify|music|soundcloud|apple music",                              do: "dance", say: "" },
    { match: "youtube|netflix|twitch|vimeo|quicktime",                            do: "idle",  say: "watching too" },
    { match: "slack|discord|messages|mail|teams|zoom",                            do: "wave",  say: "" },
    { match: "figma|photoshop|illustrator|blender|sketch|affinity",               do: "work",  say: "" },
    { match: "preview|books|notes|obsidian|notion|\\.pdf",                        do: "think", say: "" },
    { match: "steam|minecraft|epic games|game",                                   do: "ball",  say: "same" },
    { match: "safari|chrome|arc|firefox|edge",                                    do: "think", say: "" }
  ],
  awareness: {
    enabled: true,
    endpoint: "http://localhost:11434",
    model: "gemma3:1b",
    minGap: 150,           /* seconds between reactions                     */
    seeTitle: true,        /* the frontmost window's title (needs Accessibility) */
    persona: "You are a small pixel creature living on the edge of the user's screen. You are fond of them, easily distracted, and never solemn.",
    seeApp: true,
    seeIdle: true,
    seeTime: true
  },
  stats: { bestKeepies: 0, goals: 0, goalsDate: "", gifts: 0, happiness: 0.5 },
  rotation: DEFAULT_ROTATION.slice(),
  animations: {}          /* overrides of built-ins + custom animations    */
};

function mergeState(saved) {
  const s = JSON.parse(JSON.stringify(DEFAULT_STATE));
  if (!saved || typeof saved !== "object") return s;
  if (typeof saved.name === "string" && saved.name.trim()) s.name = saved.name.slice(0, 24);
  Object.assign(s.look, saved.look || {});
  /* He used to be eleven rows tall and is now six, so a size chosen for the old
     shape would leave him a smudge. Reset it once, and only once. */
  if (saved.version !== SPRITE_VERSION) s.look.scale = DEFAULT_STATE.look.scale;
  s.look.colors = Object.assign({}, DEFAULT_COLORS, (saved.look && saved.look.colors) || {});
  Object.assign(s.behavior, saved.behavior || {});
  if (Array.isArray(saved.behavior && saved.behavior.phrases)) s.behavior.phrases = saved.behavior.phrases.slice(0, 40);
  if (Array.isArray(saved.rotation)) s.rotation = saved.rotation.slice();
  if (Array.isArray(saved.reactions)) s.reactions = saved.reactions.slice(0, 40);
  Object.assign(s.awareness, saved.awareness || {});
  Object.assign(s.stats, saved.stats || {});
  s.animations = {};
  const anims = saved.animations || {};
  for (const k of Object.keys(anims)) {
    if (!anims[k]) continue;
    s.animations[k] = normalizeAnim(anims[k], k);
  }
  return s;
}

/* Built-ins plus everything the user made or changed. */
function animationsOf(state) {
  const out = {};
  for (const k of Object.keys(DEFAULT_ANIMATIONS)) out[k] = normalizeAnim(DEFAULT_ANIMATIONS[k], k);
  const custom = (state && state.animations) || {};
  for (const k of Object.keys(custom)) {
    out[k] = normalizeAnim(custom[k], k);
    out[k].builtin = !!DEFAULT_ANIMATIONS[k];
    out[k].edited = !!DEFAULT_ANIMATIONS[k];
  }
  return out;
}

function blankFrame() { return normalizeFrame([]); }

/* Which row the drawing actually starts on — he is six rows tall standing and
   fewer sitting, so anything placed above his head has to ask. */
function topRowOf(frame) {
  for (let y = 0; y < GRID; y++) if (/[^.]/.test(frame[y] || "")) return y;
  return GRID - 1;
}

if (typeof window !== "undefined") {
  window.CB = {
    GRID, F, DEFAULT_ANIMATIONS, DEFAULT_ROTATION, DEFAULT_COLORS, DEFAULT_STATE, REQUIRED,
    FOOT_ROW, SPRITE_VERSION, PROPS, PROP_PALETTE, drawProp, topRowOf, drawBall, BALL_COLORS, normalizeAnim, normalizeFrame, blankFrame, drawFrame, drawShadow, drawStanding,
    paletteFor, resolveColors, mergeState, animationsOf, mix, hexToRgb, rgbToHex
  };
}
