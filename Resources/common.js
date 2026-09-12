/* Claude Buddy — shared sprite data, rendering and state. Used by pet.html and studio.html. */

/* ---------- pixel vocabulary ----------
   '.' transparent   '1' body   '2' shade   '3' light   '0' dark (eyes)   'w' white
   Every frame is 16 rows of 16 characters.                                        */

/* ---------- the character ----------
   Drawn from the onboarding block — a body wider than it is tall, two square eyes
   set wide in the upper half, an arm nub out each side at mid height, and four legs
   in two pairs with a gap between them — with a little of the walking sprite's
   character in the eyes, which are the only part of his face that ever moves.

       .###########.
       .###########.
       ..#.#####.#..     eyes, set wide
       .###########.
       .###########.
       #############     the arm nubs, one each side
       #############
       .###########.
       ..#.#...#.#..     four legs, two pairs

   The body is copied into every frame and never changes: not squashed, not
   stretched, not leaned, not tipped over. A character whose head changes shape
   while it walks is a character that wobbles, which is exactly what was wrong.

   Three things move, and only these three:

     the EYES   — open, shut, wide, pleased, or looking to one side
     the LEGS   — the three rows beneath the body
     the ARMS   — the nubs at the sides, and cells beyond them

   All 27 animations are combinations of those.                                  */

/* Paint spans into a 16-wide row: R(["1", 3, 13]) fills columns 3 to 13. */
function R(...spans) {
  const row = new Array(16).fill(".");
  for (const [ch, from, to] of spans) {
    for (let x = Math.max(0, from); x <= Math.min(to, 15); x++) row[x] = ch;
  }
  return row.join("");
}

const BLANK = R();

/* ── the body: 11 wide, with the arm nubs reaching 13 ── */
const BODY = R(["1", 3, 13]);
const ARMS = R(["1", 2, 14]);

/* ── the eyes, which carry the whole face ── */
const EYE_L = 5, EYE_R = 11;
const EYES   = R(["1", 3, 13], ["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R]);
const EYES_T = R(["1", 3, 13], ["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R]);  /* tall: with BROW_T below */
const BROW_T = R(["1", 3, 13], ["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R]);
const EYES_C = R(["1", 3, 13], ["2", EYE_L - 1, EYE_L + 1], ["2", EYE_R - 1, EYE_R + 1]);
const EYES_H = R(["1", 3, 13], ["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R]);  /* pleased, with CARET */
const CARET  = R(["1", 3, 13], ["0", EYE_L - 1, EYE_L - 1], ["0", EYE_L + 1, EYE_L + 1],
                               ["0", EYE_R - 1, EYE_R - 1], ["0", EYE_R + 1, EYE_R + 1]);
const EYES_LK = R(["1", 3, 13], ["0", EYE_L - 1, EYE_L - 1], ["0", EYE_R - 1, EYE_R - 1]);
const EYES_RK = R(["1", 3, 13], ["0", EYE_L + 1, EYE_L + 1], ["0", EYE_R + 1, EYE_R + 1]);

/* ── the arms: the nub rows, reaching further or lifting ── */
const ARMS_OUT  = R(["1", 1, 15]);
const ARMS_R    = R(["1", 2, 15]);
const ARMS_L    = R(["1", 1, 14]);
const EYE_SPAN  = [["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R]];
const ARM_UP_R  = R(["1", 3, 13], ...EYE_SPAN, ["1", 14, 14]);   /* hand up beside the head */
const ARM_UP_LR = R(["1", 3, 13], ...EYE_SPAN, ["1", 2, 2], ["1", 14, 14]);
const HIGH_R    = R(["1", 14, 14]);                        /* …and above it           */
const HIGH_LR   = R(["1", 2, 2], ["1", 14, 14]);
const ARM_MUG   = R(["1", 3, 13], ["2", EYE_L - 1, EYE_L + 1], ["2", EYE_R - 1, EYE_R + 1], ["1", 14, 14], ["c", 15, 15]);
const ARM_PAGE  = R(["1", 2, 14], ["w", 15, 15]);
const ARM_PAGE2 = R(["1", 2, 14], ["0", 15, 15]);
const ARM_SNACK = R(["1", 2, 14], ["3", 15, 15]);

/* ── the legs ── */
const LEGS      = R(["1", 4, 4], ["1", 6, 6], ["1", 10, 10], ["1", 12, 12]);
const LEGS_FR   = R(["1", 4, 4], ["1", 6, 6]);
const LEGS_BK   = R(["1", 10, 10], ["1", 12, 12]);
const LEGS_WIDE = R(["1", 3, 3], ["1", 6, 6], ["1", 10, 10], ["1", 13, 13]);
const LEGS_IN   = R(["1", 5, 5], ["1", 7, 7], ["1", 9, 9], ["1", 11, 11]);
const LEGS_KICK = R(["1", 4, 4], ["1", 6, 6], ["1", 10, 10], ["1", 14, 14]);
const LEGS_KICK2= R(["1", 4, 4], ["1", 6, 6], ["1", 10, 10], ["1", 15, 15]);
const FEET      = R(["1", 4, 5], ["1", 11, 13]);

/* ── things around him, always clear of the body ── */
const BAND     = R(["0", 5, 11]);
const EYES_CUP = R(["1", 3, 13], ["0", EYE_L, EYE_L], ["0", EYE_R, EYE_R], ["0", 2, 2], ["0", 14, 14]);
const EYES_CUPC= R(["1", 3, 13], ["2", EYE_L - 1, EYE_L + 1], ["2", EYE_R - 1, EYE_R + 1], ["0", 2, 2], ["0", 14, 14]);
const BOX_TOP  = R(["0", 4, 12]);
const BOX_MID  = R(["0", 4, 4], ["3", 5, 11], ["0", 12, 12]);
const DESK     = R(["0", 0, 15]);
const DESK_LEG = R(["2", 2, 3], ["2", 12, 13]);
const Z_HI     = R(["0", 14, 14]);
const Z_LO     = R(["0", 15, 15]);
const NOTE     = R(["3", 14, 14]);
const NOTE2    = R(["3", 1, 1]);

/* Frames are bottom-aligned: the last row given to S() lands on the floor. */
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

/* The body, eight rows of it, with whichever eyes and arms this frame wants.
   Everything standing is BODY(...) followed by exactly three rows of leg, so the
   head lands on the same row in every frame and cannot bob, squash or drift. */
const BODY8 = (eyes, brow, arms) => [
  BODY, BODY, eyes || EYES, brow || BODY, BODY, arms || ARMS, ARMS, BODY
];
const stand = (legs, eyes, brow, arms) =>
  S(...BODY8(eyes, brow, arms), legs[0] || LEGS, legs[1] || LEGS, legs[2] || LEGS);

const F = {
  idle:      stand([LEGS, LEGS, LEGS]),
  blink:     stand([LEGS, LEGS, LEGS], EYES_C),
  pleased:   stand([LEGS, LEGS, LEGS], EYES_H, CARET),
  wide:      stand([LEGS, LEGS, LEGS], EYES_T, BROW_T),
  lookL:     stand([LEGS, LEGS, LEGS], EYES_LK),
  lookR:     stand([LEGS, LEGS, LEGS], EYES_RK),
  shut:      stand([LEGS, LEGS, LEGS], EYES_C),

  /* walking — three rows of leg in every frame, so the body cannot move a pixel */
  stepA:     stand([LEGS, LEGS, LEGS_FR]),
  stepB:     stand([LEGS, LEGS, LEGS_BK]),
  stepC:     stand([LEGS, LEGS, LEGS_WIDE]),
  stepD:     stand([LEGS_WIDE, LEGS_WIDE, LEGS_BK]),
  splay:     stand([LEGS_WIDE, LEGS_WIDE, LEGS_WIDE], EYES_T, BROW_T),
  dangleA:   stand([LEGS_WIDE, LEGS_WIDE, LEGS_FR], EYES_T, BROW_T),
  dangleB:   stand([LEGS_WIDE, LEGS_WIDE, LEGS_BK], EYES_T, BROW_T),
  kickA:     stand([LEGS, LEGS, LEGS_KICK]),
  kickB:     stand([LEGS, LEGS, LEGS_KICK2]),

  /* crouching and sitting: the legs fold, which is the only thing that lowers him */
  crouch:    S(...BODY8(EYES_T, BROW_T), LEGS, LEGS),
  tucked:    S(...BODY8(EYES_T, BROW_T), LEGS_IN),
  tall:      S(...BODY8(EYES_T, BROW_T), LEGS, LEGS, LEGS, LEGS),
  sitA:      S(...BODY8(), FEET),
  sitB:      S(...BODY8(EYES_C), FEET),
  sleepA:    S(...BODY8(EYES_C), LEGS_IN),
  sleepB:    A(S(...BODY8(EYES_C), LEGS_IN), 4, Z_HI),
  sleepC:    A(S(...BODY8(EYES_C), LEGS_IN), 3, Z_LO),
  napA:      A(S(...BODY8(EYES_C), FEET), 4, Z_HI),
  napB:      A(S(...BODY8(EYES_C), FEET), 3, Z_LO),

  /* arms */
  waveA:     stand([LEGS, LEGS, LEGS], ARM_UP_R),
  waveB:     A(stand([LEGS, LEGS, LEGS], ARM_UP_R), 2, HIGH_R),
  reachR:    stand([LEGS, LEGS, LEGS], null, null, ARMS_R),
  reachL:    stand([LEGS, LEGS, LEGS], null, null, ARMS_L),
  armsOut:   stand([LEGS, LEGS, LEGS], EYES_C, null, ARMS_OUT),
  cheerA:    A(stand([LEGS, LEGS, LEGS], ARM_UP_LR), 2, HIGH_LR),
  cheerB:    A(stand([LEGS, LEGS, LEGS_IN], ARM_UP_LR), 2, HIGH_LR),
  sip:       stand([LEGS, LEGS, LEGS], ARM_MUG),
  pageA:     stand([LEGS, LEGS, LEGS], EYES_C, null, ARM_PAGE),
  pageB:     stand([LEGS, LEGS, LEGS], EYES_C, null, ARM_PAGE2),
  snackA:    stand([LEGS, LEGS, LEGS], null, null, ARM_SNACK),
  snackB:    stand([LEGS, LEGS, LEGS], EYES_C, null, ARM_SNACK),

  /* thinking */
  thinkA:    A(stand([LEGS, LEGS, LEGS]), 2, NOTE),
  thinkB:    A(stand([LEGS, LEGS, LEGS], EYES_C), 1, NOTE),

  /* headphones: a band above the head, a cup beside each eye, never on the head */
  deskA:     A(S(...BODY8(EYES_CUP), DESK, DESK_LEG), 2, BAND),
  deskB:     A(S(...BODY8(EYES_CUPC, null, ARMS_R), DESK, DESK_LEG), 2, BAND),
  grooveA:   A(A(stand([LEGS, LEGS, LEGS_FR], EYES_CUP), 2, BAND), 1, NOTE),
  grooveB:   A(A(stand([LEGS, LEGS, LEGS_BK], EYES_CUPC), 2, BAND), 1, NOTE2),

  /* carrying: the box rides above him */
  carryA:    A(A(stand([LEGS, LEGS, LEGS], EYES_T, BROW_T, ARMS_OUT), 1, BOX_TOP), 2, BOX_MID),
  carryB:    A(A(stand([LEGS, LEGS, LEGS_FR], EYES_T, BROW_T, ARMS_OUT), 1, BOX_TOP), 2, BOX_MID)
};

/* ---------- the animation library ---------- */

const DEFAULT_ANIMATIONS = {
  idle:  { name: "idle",  builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0,0,0],
           frames: [F.idle,F.idle,F.idle,F.idle,F.blink,F.idle] },
  walk:  { name: "walk",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.idle,F.stepB,F.idle] },
  run:   { name: "run",   builtin: true, fps: 14, loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.stepC,F.stepB,F.stepC] },
  jump:  { name: "jump",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.crouch,F.tall,F.tall,F.crouch] },
  sleep: { name: "sleep", builtin: true, fps: 1.5,loop: true,  bob: [0,0,0],
           frames: [F.sleepA,F.sleepB,F.sleepC] },
  wave:  { name: "wave",  builtin: true, fps: 6,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.waveA,F.waveB,F.waveA] },
  work:  { name: "work",  builtin: true, fps: 7,  loop: true,  bob: [0,0,0,0],
           frames: [F.reachR,F.idle,F.reachR,F.idle] },
  dance: { name: "dance", builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.reachR,F.stepB,F.reachL] },
  think: { name: "think", builtin: true, fps: 2,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.thinkA,F.thinkB,F.thinkA] },
  held:  { name: "held",  builtin: true, fps: 5,  loop: true,  bob: [0,0],
           frames: [F.dangleA,F.dangleB] },
  fall:  { name: "fall",  builtin: true, fps: 6,  loop: true,  bob: [0,0],
           frames: [F.splay,F.splay] },
  land:  { name: "land",  builtin: true, fps: 10, loop: false, bob: [0,0,0],
           frames: [F.tucked,F.crouch,F.idle] },
  kick:  { name: "kick",  builtin: true, fps: 10, loop: false, bob: [0,0,0,0],
           frames: [F.stepB,F.kickA,F.kickB,F.idle] },
  flip:  { name: "hop",   builtin: true, fps: 11, loop: false, bob: [0,-3,-5,-2,0],
           frames: [F.crouch,F.tucked,F.tall,F.crouch,F.idle] },
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
           frames: [F.pageA,F.pageA,F.pageB] },
  stretch:{ name: "stretching", builtin: true, fps: 2.5, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.armsOut,F.armsOut,F.idle] },
  cheer: { name: "celebrating", builtin: true, fps: 9, loop: true, bob: [0,0,0,0],
           frames: [F.cheerA,F.cheerB,F.cheerA,F.cheerB] },
  peek:  { name: "looking round",builtin: true, fps: 1.6, loop: true, bob: [0,0,0,0],
           frames: [F.lookL,F.idle,F.lookR,F.idle] },
  carry: { name: "carrying",    builtin: true, fps: 6, loop: true, bob: [0,0,0,0],
           frames: [F.carryA,F.carryB,F.carryA,F.carryB] },
  snack: { name: "snacking",    builtin: true, fps: 3, loop: true, bob: [0,0,0,0],
           frames: [F.snackA,F.snackB,F.snackA,F.idle] },
  groove:{ name: "grooving",    builtin: true, fps: 7, loop: true, bob: [0,0,0,0],
           frames: [F.grooveA,F.grooveB,F.grooveA,F.grooveB] },
  nap:   { name: "dozing",      builtin: true, fps: 1.2, loop: true, bob: [0,0],
           frames: [F.napA,F.napB] },
  happy: { name: "pleased",     builtin: true, fps: 2, loop: true, bob: [0,0,0,0],
           frames: [F.pleased,F.pleased,F.idle,F.pleased] }
};

/* Animations he may pick on his own when he has nothing better to do. */
const DEFAULT_ROTATION = ["wave", "dance", "work", "think", "jump", "desk", "chill", "read", "stretch", "groove", "sit", "happy", "peek"];

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

const SPRITE_VERSION = 3;

const DEFAULT_STATE = {
  version: SPRITE_VERSION,
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
