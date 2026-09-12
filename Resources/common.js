/* Claude Buddy — shared sprite data, rendering and state. Used by pet.html and studio.html. */

/* ---------- pixel vocabulary ----------
   '.' transparent   '1' body   '2' shade   '3' light   '0' dark (eyes)   'w' white
   Every frame is 16 rows of 16 characters.                                        */

/* ---------- the character ----------
   The proportions are not invented. Claude Code draws Clawd in the terminal with
   quadrant blocks, and decoded to pixels that art is:

       .############.     12 wide
       .##.######.##.     the eyes are NOTCHES, at the outer thirds
       #############.     13 wide — the widest row
       .##########...     10 wide
       #.#....#.#....     four legs, two pairs, a four-cell gap between them

   So: a solid block that bulges by one cell rather than a narrow body with arms
   bolted on, eyes set wide rather than centred, and the right pair of legs tucked
   in from the edge. Those horizontal proportions are copied exactly here, mapping
   the original's 13 columns onto columns 2-14 of this grid.

   The one deliberate departure is height. The original is 13x5, which is too flat
   to walk, sit, or lie down without the legs being the whole animation; this is
   13x8, which keeps the silhouette and leaves room to move.                     */

/* Paint spans into a 16-wide row: R(["1", 3, 14]) fills columns 3 to 14. */
function R(...spans) {
  const row = new Array(16).fill(".");
  for (const [ch, from, to] of spans) {
    for (let x = Math.max(0, from); x <= Math.min(to, 15); x++) row[x] = ch;
  }
  return row.join("");
}

const BLANK  = R();
const TOP    = R(["1", 3, 14]);                                   /* 12 wide      */
const EYES   = R(["1", 3, 14], ["0", 5, 5], ["0", 12, 12]);       /* set wide     */
const EYESC  = R(["1", 3, 14], ["2", 5, 5], ["2", 12, 12]);       /* shut         */
const EYESW  = R(["1", 3, 14], ["0", 4, 5], ["0", 12, 13]);       /* wide open    */
const WIDE   = R(["1", 2, 14]);                                   /* 13 wide      */
const NARROW = R(["1", 3, 12]);                                   /* 10 wide      */
const LEGS   = R(["1", 2, 2], ["1", 4, 4], ["1", 9, 9], ["1", 11, 11]);
const LEG_A  = R(["1", 2, 2], ["1", 4, 4]);                       /* front pair   */
const LEG_B  = R(["1", 9, 9], ["1", 11, 11]);                     /* back pair    */

/* leaning a cell either way, for dancing and peering round things */
const TOP_L    = R(["1", 2, 13]);
const EYES_L   = R(["1", 2, 13], ["0", 4, 4], ["0", 11, 11]);
const WIDE_L   = R(["1", 1, 13]);
const NARROW_L = R(["1", 2, 11]);
const LEGS_L   = R(["1", 1, 1], ["1", 3, 3], ["1", 8, 8], ["1", 10, 10]);
const TOP_R    = R(["1", 4, 15]);
const EYES_R   = R(["1", 4, 15], ["0", 6, 6], ["0", 13, 13]);
const WIDE_R   = R(["1", 3, 15]);
const NARROW_R = R(["1", 4, 13]);
const LEGS_R   = R(["1", 3, 3], ["1", 5, 5], ["1", 10, 10], ["1", 12, 12]);

/* arms, such as they are: the bulge row reaching further out */
const ARM_UP    = R(["1", 3, 14], ["1", 15, 15]);
const ARM_HIGH  = R(["1", 3, 14], ["1", 15, 15], ["1", 14, 14]);
const ARMS_OUT  = R(["1", 1, 15]);
const ARMS_UP   = R(["1", 3, 3], ["1", 14, 14]);   /* raised, and still attached */
const REACH     = R(["1", 2, 14], ["1", 15, 15]);
const REACH2    = R(["1", 2, 14], ["1", 15, 15], ["1", 0, 0]);

/* headphones: a band over the top and a cup either side of the head */
const BAND      = R(["0", 6, 11]);                 /* the headband, over the crown */
const PHONES    = R(["1", 3, 14], ["0", 5, 5], ["0", 12, 12], ["0", 2, 2], ["0", 15, 15]);
const PHONES_C  = R(["1", 3, 14], ["2", 5, 5], ["2", 12, 12], ["0", 2, 2], ["0", 15, 15]);

/* a desk he sits behind, drawn in the frame rather than as a prop so his hands
   can rest on it */
const DESK_TOP  = R(["0", 0, 15]);
const DESK_LEG  = R(["2", 1, 2], ["2", 13, 14]);

/* sitting: the block settles, and two feet come out in front */
const SEAT      = R(["1", 3, 12]);
const FEET      = R(["1", 3, 4], ["1", 12, 14]);
const FEET2     = R(["1", 3, 4], ["1", 11, 13]);

/* things he holds */
const PAGE_A    = R(["1", 2, 12], ["w", 13, 15]);
const PAGE_B    = R(["1", 2, 12], ["w", 13, 14], ["0", 15, 15]);
const BOX_TOP   = R(["0", 5, 12]);
const BOX_MID   = R(["0", 5, 5], ["3", 6, 11], ["0", 12, 12]);
const SNACK     = R(["1", 3, 14], ["0", 5, 5], ["0", 12, 12], ["3", 15, 15]);
const SNACK2    = R(["1", 3, 14], ["2", 5, 5], ["2", 12, 12], ["3", 14, 15]);
const NOTE_HI   = R(["3", 13, 13]);
const NOTE_LO   = R(["3", 1, 1]);

/* lying down: head to the left, eye shut, legs folded under */
const LIE_TOP   = R(["1", 2, 12]);
const LIE_MID   = R(["1", 1, 13], ["2", 2, 2]);
const LIE_LEGS  = R(["1", 3, 3], ["1", 5, 5], ["1", 9, 9], ["1", 11, 11]);
const Z_HI      = R(["0", 13, 13]);
const Z_LO      = R(["0", 14, 14]);

/* Frames are bottom-aligned on the floor: S(...rows) puts the last row you give it
   on row 13, which is where the ground is. Saying what he is made of beats counting
   blank rows, and it is why every pose here lines up with every other. */
function S(...rows) {
  const out = new Array(16).fill(BLANK);
  const first = 14 - rows.length;
  for (let i = 0; i < rows.length; i++) out[first + i] = rows[i];
  return out;
}
/* …and A(frame, row, content) floats something above him — a Z, a note, a box. */
function A(frame, row, content) {
  const out = frame.slice();
  out[row] = content;
  return out;
}

/* The standing stack. Ten rows: head, eyes, head, head, the bulge, the narrow row,
   and FOUR rows of leg. The legs are a third of his height on purpose: he is a wide
   character, and a wide character with short legs reads as furniture. The step is
   only visible if there is leg to move. */
const STAND = [TOP, EYES, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS];
const body = (eyes, ...tail) => [TOP, eyes, TOP, TOP, WIDE, WIDE, NARROW, ...tail];

const F = {
  idle:    S(...STAND),
  blink:   S(...body(EYESC, LEGS, LEGS, LEGS, LEGS)),
  breathe: S(TOP, EYES, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  /* a step is a pair shortened by a row, not a pair that vanishes */
  stepA:   S(...body(EYES, LEGS, LEGS, LEGS, LEG_A)),
  stepB:   S(...body(EYES, LEGS, LEGS, LEGS, LEG_B)),
  crouch:  S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS),
  stretchUp: S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS, LEGS),
  sleepA:  S(TOP, EYESC, TOP, WIDE, WIDE, NARROW, LEGS, LEGS),
  sleepB:  A(S(TOP, EYESC, TOP, WIDE, WIDE, NARROW, LEGS, LEGS), 4, Z_HI),
  sleepC:  A(S(TOP, EYESC, TOP, WIDE, WIDE, NARROW, LEGS, LEGS), 3, Z_LO),
  wave1:   S(TOP, EYES, ARM_UP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  wave2:   S(ARM_UP, EYES, ARM_HIGH, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  work1:   S(TOP, EYES, TOP, TOP, WIDE, WIDE, REACH, LEGS, LEGS, LEGS, LEGS),
  work2:   S(TOP, EYES, TOP, TOP, WIDE, WIDE, REACH2, LEGS, LEGS, LEGS, LEGS),
  danceL:  S(TOP_L, EYES_L, TOP_L, TOP_L, WIDE_L, WIDE_L, NARROW_L, LEGS_L, LEGS_L, LEGS_L, LEGS_L),
  danceR:  S(TOP_R, EYES_R, TOP_R, TOP_R, WIDE_R, WIDE_R, NARROW_R, LEGS_R, LEGS_R, LEGS_R, LEGS_R),
  heldA:   S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEG_A),
  heldB:   S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEG_B),
  fall:    S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS),
  think1:  A(S(...STAND), 2, NOTE_HI),
  think2:  A(S(...body(EYESC, LEGS, LEGS, LEGS, LEGS)), 1, NOTE_HI),
  squash:  S(TOP, EYESW, WIDE, WIDE, NARROW, LEGS),
  windup:  S(TOP_L, EYES_L, TOP_L, TOP_L, WIDE_L, WIDE_L, NARROW_L, LEGS_L, LEGS_L, LEGS_L, LEGS_L),
  strike:  S(TOP_R, EYES_R, TOP_R, TOP_R, WIDE_R, WIDE_R, NARROW_R,
             R(["1",3,3],["1",5,5],["1",11,11],["1",13,13]),
             R(["1",3,3],["1",5,5],["1",12,12],["1",14,14]),
             R(["1",3,3],["1",5,5],["1",13,13],["1",15,15])),
  upside:  S(LEGS, LEGS, LEGS, LEGS, NARROW, WIDE, WIDE, TOP, TOP, EYESW, TOP),
  tuck:    S(TOP, EYESW, TOP, WIDE, WIDE, NARROW, LEG_A, LEG_A),
  sip:     S(TOP, EYESC, ARM_UP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  lieA:    A(S(LIE_TOP, LIE_MID, LIE_LEGS), 8, Z_HI),
  lieB:    A(S(LIE_TOP, LIE_MID, LIE_LEGS), 7, Z_LO),

  /* ── the ten from the reference sheet ── */
  deskA:   S(BAND, TOP, PHONES, TOP, TOP, WIDE, WIDE, NARROW, DESK_TOP, DESK_LEG, DESK_LEG),
  deskB:   S(BAND, TOP, PHONES_C, TOP, TOP, WIDE, REACH, NARROW, DESK_TOP, DESK_LEG, DESK_LEG),
  sitA:    S(TOP, EYES, TOP, TOP, WIDE, WIDE, SEAT, FEET),
  sitB:    S(TOP, EYES, TOP, WIDE, WIDE, SEAT, FEET2),
  chillA:  S(TOP, EYESC, TOP, TOP, WIDE, WIDE, SEAT, FEET),
  chillB:  S(TOP, EYESC, TOP, WIDE, WIDE, SEAT, FEET2),
  readA:   S(TOP, EYESC, TOP, TOP, PAGE_A, PAGE_A, NARROW, LEGS, LEGS, LEGS, LEGS),
  readB:   S(TOP, EYESC, TOP, TOP, PAGE_B, PAGE_A, NARROW, LEGS, LEGS, LEGS, LEGS),
  stretchA:S(TOP, EYESC, TOP, TOP, ARMS_OUT, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  stretchB:S(ARMS_UP, TOP, EYESC, TOP, ARMS_OUT, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  cheerA:  S(ARMS_UP, TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS),
  cheerB:  A(S(TOP, EYESW, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEG_A), 2, ARMS_UP),
  peekA:   S(TOP_L, EYES_L, TOP_L, TOP_L, WIDE_L, WIDE_L, NARROW_L, LEGS_L, LEGS_L, LEGS_L, LEGS_L),
  peekB:   S(TOP_L, EYESW, TOP_L, WIDE_L, WIDE_L, NARROW_L, LEGS_L, LEGS_L, LEGS_L, LEGS_L),
  carryA:  A(A(A(S(...body(EYESW, LEGS, LEGS, LEGS)), 1, BOX_TOP), 2, BOX_MID), 3, BOX_TOP),
  carryB:  A(A(A(S(...body(EYESW, LEGS, LEGS, LEG_A)), 0, BOX_TOP), 1, BOX_MID), 2, BOX_TOP),
  snackA:  S(TOP, SNACK, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  snackB:  S(TOP, SNACK2, TOP, TOP, WIDE, WIDE, NARROW, LEGS, LEGS, LEGS, LEGS),
  grooveA: A(S(BAND, TOP_L, PHONES, TOP_L, WIDE_L, WIDE_L, NARROW_L, LEGS_L, LEGS_L, LEGS_L, LEGS_L), 2, NOTE_HI),
  grooveB: A(S(BAND, TOP_R, PHONES_C, TOP_R, WIDE_R, WIDE_R, NARROW_R, LEGS_R, LEGS_R, LEGS_R, LEGS_R), 1, NOTE_LO),
  napA:    A(S(TOP, EYESC, TOP, WIDE, WIDE, SEAT, FEET), 5, Z_HI),
  napB:    A(S(TOP, EYESC, TOP, WIDE, WIDE, SEAT, FEET2), 4, Z_LO)
};

/* ---------- the animation library ---------- */

const DEFAULT_ANIMATIONS = {
  idle:  { name: "idle",  builtin: true, fps: 4,  loop: true,  bob: [0,0,0,0,0,0,0,0],
           frames: [F.idle,F.idle,F.idle,F.breathe,F.idle,F.idle,F.idle,F.blink] },
  walk:  { name: "walk",  builtin: true, fps: 8,  loop: true,  bob: [0,-1,0,-1],
           frames: [F.idle,F.stepA,F.idle,F.stepB] },
  run:   { name: "run",   builtin: true, fps: 14, loop: true,  bob: [0,-2,0,-2],
           frames: [F.idle,F.stepA,F.idle,F.stepB] },
  jump:  { name: "jump",  builtin: true, fps: 8,  loop: true,  bob: [0,-3,-4,-1],
           frames: [F.crouch,F.stretchUp,F.stretchUp,F.crouch] },
  sleep: { name: "sleep", builtin: true, fps: 1.5,loop: true,  bob: [0,0,0],
           frames: [F.sleepA,F.sleepB,F.sleepC] },
  wave:  { name: "wave",  builtin: true, fps: 6,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.wave1,F.wave2,F.wave1] },
  work:  { name: "work",  builtin: true, fps: 7,  loop: true,  bob: [0,0,0,0],
           frames: [F.work1,F.work2,F.work1,F.idle] },
  dance: { name: "dance", builtin: true, fps: 8,  loop: true,  bob: [0,-1,0,-1],
           frames: [F.danceL,F.idle,F.danceR,F.idle] },
  think: { name: "think", builtin: true, fps: 2,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.think1,F.think2,F.think1] },
  held:  { name: "held",  builtin: true, fps: 5,  loop: true,  bob: [0,-1],
           frames: [F.heldA,F.heldB] },
  fall:  { name: "fall",  builtin: true, fps: 6,  loop: true,  bob: [0,0],
           frames: [F.fall,F.fall] },
  land:  { name: "land",  builtin: true, fps: 10, loop: false, bob: [0,0,0],
           frames: [F.squash,F.crouch,F.idle] },
  kick:  { name: "kick",  builtin: true, fps: 10, loop: false, bob: [0,-1,0,0],
           frames: [F.windup,F.strike,F.strike,F.idle] },
  flip:  { name: "flip",  builtin: true, fps: 11, loop: false, bob: [0,-4,-7,-3,0],
           frames: [F.crouch,F.tuck,F.upside,F.tuck,F.crouch] },
  drink: { name: "drink", builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.sip,F.sip,F.idle] },
  abed:  { name: "in bed",builtin: true, fps: 1.2,loop: true,  bob: [0,0,-1,0],
           frames: [F.lieA,F.lieB,F.lieA,F.lieB] },

  /* ── ten more, from how the character is actually drawn ── */
  desk:  { name: "at the desk", builtin: true, fps: 5, loop: true, bob: [0,0,0,0],
           frames: [F.deskA,F.deskB,F.deskA,F.deskB] },
  chill: { name: "chilling",    builtin: true, fps: 1.4, loop: true, bob: [0,-1,0,-1],
           frames: [F.chillA,F.chillB,F.chillA,F.chillB] },
  sit:   { name: "sitting",     builtin: true, fps: 1.6, loop: true, bob: [0,-1],
           frames: [F.sitA,F.sitB] },
  read:  { name: "reading",     builtin: true, fps: 1.6, loop: true, bob: [0,0,0],
           frames: [F.readA,F.readA,F.readB] },
  stretch:{ name: "stretching", builtin: true, fps: 2.5, loop: true, bob: [0,-1,-1,0],
           frames: [F.idle,F.stretchA,F.stretchB,F.stretchA] },
  cheer: { name: "celebrating", builtin: true, fps: 9, loop: true, bob: [0,-3,0,-3],
           frames: [F.cheerA,F.cheerB,F.cheerA,F.cheerB] },
  peek:  { name: "peeking",     builtin: true, fps: 2, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.peekA,F.peekB,F.peekA] },
  carry: { name: "carrying",    builtin: true, fps: 6, loop: true, bob: [0,-1,0,-1],
           frames: [F.carryA,F.carryB,F.carryA,F.carryB] },
  snack: { name: "snacking",    builtin: true, fps: 3, loop: true, bob: [0,0,0,0],
           frames: [F.snackA,F.snackB,F.snackA,F.idle] },
  groove:{ name: "grooving",    builtin: true, fps: 7, loop: true, bob: [0,-1,0,-1],
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

const DEFAULT_STATE = {
  version: 1,
  name: "Claude",
  look: { scale: 3.6, colors: Object.assign({}, DEFAULT_COLORS), shadow: true, opacity: 1 },
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

if (typeof window !== "undefined") {
  window.CB = {
    GRID, F, DEFAULT_ANIMATIONS, DEFAULT_ROTATION, DEFAULT_COLORS, DEFAULT_STATE, REQUIRED,
    FOOT_ROW, PROPS, PROP_PALETTE, drawProp, drawBall, BALL_COLORS, normalizeAnim, normalizeFrame, blankFrame, drawFrame, drawShadow, drawStanding,
    paletteFor, resolveColors, mergeState, animationsOf, mix, hexToRgb, rgbToHex
  };
}
