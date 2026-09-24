/* Claude Buddy — shared sprite data, rendering and state. Used by pet.html and studio.html. */

/* ---------- pixel vocabulary ----------
   '.' transparent   '1' body   '2' shade   '3' light   '0' dark (eyes)   'w' white
   'c' coffee        's' screen 'y' flame   'r' ribbon
   Every frame is 16 rows of 16 characters.                                        */

/* ---------- the character ----------
   Drawn from the onboarding block — a body wider than it is tall, two square eyes
   set wide in the upper half, an arm nub out each side at mid height, and four legs
   in two pairs with a gap between them.

       .###########.
       .###########.
       ..#.#####.#..     eyes, set wide
       .###########.
       .###########.
       #############     the arm nubs, one each side
       #############
       .###########.
       ..#.#...#.#..     four legs, two pairs

   The body is copied into every frame and never changes. Three things move — the
   eyes, the legs and the arms — and nothing else.

   Legs and arms are described as LIMBS rather than drawn as rows, because rows let
   a leg exist on the bottom row with nothing above it, which renders as a pixel
   floating under him. A limb here is a column and a length, so it is always joined
   to the body by construction, and a step shortens a leg instead of deleting it. */

/* Paint spans into a 16-wide row: R(["1", 3, 13]) fills columns 3 to 13. */
function R(...spans) {
  const row = new Array(16).fill(".");
  for (const [ch, from, to] of spans) {
    for (let x = Math.max(0, from); x <= Math.min(to, 15); x++) row[x] = ch;
  }
  return row.join("");
}
function paint(row, ...spans) {
  const out = [...row];
  for (const [ch, from, to] of spans) {
    for (let x = Math.max(0, from); x <= Math.min(to, 15); x++) out[x] = ch;
  }
  return out.join("");
}

const BLANK = R();

/* ── the body, and where things attach to it ── */
const BODY_L = 3, BODY_R = 13;          /* his own width                     */
const ARM_L = 2, ARM_R = 14;            /* the nubs stick out one either side */
const EYE_L = 5, EYE_R = 11;
const HEAD  = R(["1", BODY_L, BODY_R]);
const NUBS  = R(["1", ARM_L, ARM_R]);

/* ── eyes ── */
const eyesRow = (ch, spread) => R(["1", BODY_L, BODY_R],
  [ch, EYE_L - spread, EYE_L + spread], [ch, EYE_R - spread, EYE_R + spread]);
const eyesAt = (dx, ch) => R(["1", BODY_L, BODY_R],
  [ch || "0", EYE_L + dx, EYE_L + dx], [ch || "0", EYE_R + dx, EYE_R + dx]);

const EYES    = eyesAt(0);                       /* open                      */
const EYES_C  = eyesRow("2", 1);                 /* shut: a line either side  */
const EYES_LK = eyesAt(-1);                      /* looking left              */
const EYES_RK = eyesAt(1);                       /* looking right             */
const EYES_TALL = eyesAt(0);                     /* with the same below it    */
const CARET   = R(["1", BODY_L, BODY_R], ["0", EYE_L - 1, EYE_L - 1], ["0", EYE_L + 1, EYE_L + 1],
                                        ["0", EYE_R - 1, EYE_R - 1], ["0", EYE_R + 1, EYE_R + 1]);
const SMILE   = R(["1", BODY_L, BODY_R], ["0", 6, 6], ["0", 10, 10], ["0", 7, 9]);  /* a happy mouth */
const CUPS    = (row) => paint(row, ["0", ARM_L, ARM_L], ["0", ARM_R, ARM_R]);

/* ── limbs ──
   A limb is a column, a length and an optional foot that reaches sideways at the
   bottom. Rows are generated downward from the body, so every cell of a limb has
   the cell above it filled and nothing can come loose. */
function limb(x, len, foot) { return { x: x, len: len, foot: foot || 0 }; }

function legRows(limbs, depth) {
  const rows = [];
  for (let r = 0; r < depth; r++) {
    const spans = [];
    for (const l of limbs) {
      if (l.len <= r) continue;
      const last = r === l.len - 1;
      const from = Math.min(l.x, last && l.foot ? l.x + l.foot : l.x);
      const to = Math.max(l.x, last && l.foot ? l.x + l.foot : l.x);
      spans.push(["1", from, to]);
    }
    rows.push(R(...spans));
  }
  return rows;
}

/* Standing legs: two pairs, a gap between them. */
const STAND_X = [4, 6, 10, 12];
const WIDE_X  = [3, 6, 10, 13];
const TIGHT_X = [5, 7, 9, 11];
const legs      = (len) => STAND_X.map(x => limb(x, len == null ? 3 : len));
const legsWide  = (len) => WIDE_X.map(x => limb(x, len == null ? 3 : len));
const legsTight = (len) => TIGHT_X.map(x => limb(x, len == null ? 2 : len));
/* a step lifts one pair — it shortens, it never disappears */
const stepFront = () => [limb(4, 2), limb(6, 2), limb(10, 3), limb(12, 3)];
const stepBack  = () => [limb(4, 3), limb(6, 3), limb(10, 2), limb(12, 2)];
const stepWideA = () => [limb(3, 3), limb(6, 3), limb(10, 2), limb(13, 2)];
const stepWideB = () => [limb(3, 2), limb(6, 2), limb(10, 3), limb(13, 3)];
/* a kick: the front foot swings out, still joined to the leg above it */
const kickOut   = (reach) => [limb(4, 3), limb(6, 3), limb(10, 3), limb(12, 3, reach)];
/* sitting: the legs fold to one row and the feet come forward */
const seated    = () => [limb(4, 1, 1), limb(6, 1), limb(10, 1), limb(12, 1, 2)];
const tapping   = () => [limb(4, 3), limb(6, 3), limb(10, 3), limb(12, 2)];

/* ── arms ──
   The nub row is the shoulder. An arm reaching goes further along that row; an arm
   raised is a column climbing from the shoulder, so the hand is never adrift. */
/* His shoulders are 13 wide and stay 13 wide. An arm reaches further out or comes
   back to rest; it never retracts into him, because a body that changes width
   between frames reads as two different creatures — which is exactly what
   "arms: in" was doing to him every time he applauded. */
function armsRow(left, right) {
  return R(["1", left === "out" ? ARM_L - 1 : ARM_L,
            right === "out" ? ARM_R + 1 : ARM_R]);
}
function raiseRows(height, sides) {
  /* returns [rowsAboveShoulder] top-down, each a single cell per raised side */
  const out = [];
  for (let i = height; i >= 1; i--) {
    const spans = [];
    if (sides.indexOf("L") >= 0) spans.push(["1", ARM_L, ARM_L]);
    if (sides.indexOf("R") >= 0) spans.push(["1", ARM_R, ARM_R]);
    out.push(R(...spans));
  }
  return out;
}

/* ── the pose builder ──
   Every frame is: whatever is above him, then his eight body rows, then his legs.
   Raised arms are painted onto the body rows they pass, so they stay joined. */
function pose(opts) {
  const o = opts || {};
  const eyes = o.eyes || EYES;
  const brow = o.brow || HEAD;
  const arms = armsRow(o.left || "nub", o.right || "nub");
  let body = [HEAD, HEAD, eyes, brow, HEAD, arms, arms, HEAD];

  /* an arm raised above the shoulder climbs through the body rows beside it */
  const raise = o.raise || 0;
  if (raise > 0) {
    const sides = o.raiseSides || "R";
    /* The arm climbs FROM the shoulder, which stays where it is. */
    for (let i = 1; i <= Math.min(raise, 5); i++) {
      const row = 5 - i;                     /* 5 is the first nub row        */
      if (row < 0) break;
      const spans = [];
      if (sides.indexOf("L") >= 0) spans.push(["1", ARM_L, ARM_L]);
      if (sides.indexOf("R") >= 0) spans.push(["1", ARM_R, ARM_R]);
      body[row] = paint(body[row], ...spans);
    }
  }
  if (o.cups) body[2] = CUPS(body[2]);
  if (o.hold) body[5] = paint(body[5], ...o.hold);       /* in the hand          */
  if (o.holdUp) body[4] = paint(body[4], ...o.holdUp);   /* …and its top half    */

  const legRowsOut = legRows(o.legs || legs(), o.depth == null ? (o.legs ? Math.max(...o.legs.map(l => l.len)) : 3) : o.depth);
  const rows = body.concat(legRowsOut);

  /* bottom-aligned on the floor */
  const frame = new Array(16).fill(BLANK);
  const first = 14 - rows.length;
  for (let i = 0; i < rows.length; i++) frame[first + i] = rows[i];

  /* things above him: given top-down, sitting directly on his head */
  const above = o.above || [];
  for (let i = 0; i < above.length; i++) {
    const row = first - above.length + i;
    if (row >= 0) frame[row] = above[i];
  }
  /* Anything floating free — a Z, a musical note — is clamped to the rows above
     him. Written straight in, a note at row 3 landed on the top of his head and
     rubbed it out, which is a thing that shipped. */
  const ceiling = first - (above.length ? above.length : 0) - 1;
  for (const [row, content] of (o.float || [])) {
    const y = Math.min(row, ceiling);
    if (y >= 0) frame[y] = content;
  }
  return frame;
}

/* ── things he wears or carries, always clear of the body ── */
const HEADPHONES = [R(["0", 6, 10])];                       /* band over the crown */
const PARTY_HAT  = [R(["w", 8, 8]), R(["r", 7, 9]), R(["r", 6, 10])];
const CHEF_HAT   = [R(["w", 5, 11]), R(["w", 4, 12]), R(["0", 4, 12])];
const BOX        = [R(["0", 4, 12]), R(["0", 4, 4], ["3", 5, 11], ["0", 12, 12])];
const DESK_TOP   = R(["0", 0, 15]);
const DESK_FEET  = R(["2", 2, 3], ["2", 12, 13]);
/* a screen standing on the desk beside him, clear of his body */
const SCREEN_A   = R(["0", 14, 15]);
const SCREEN_B   = R(["0", 14, 14], ["s", 15, 15]);
const Z_HI       = R(["0", 14, 14]);
const Z_LO       = R(["0", 15, 15]);
const NOTE       = R(["3", 14, 14]);
const NOTE2      = R(["3", 1, 1]);
const MUG        = [["1", ARM_R, ARM_R], ["w", 15, 15]];
const MUG_TOP    = [["c", 15, 15]];
const PAGE       = [["1", ARM_R, ARM_R], ["w", 15, 15]];
const PAGE_TOP   = [["w", 15, 15]];
const PAGE2      = [["1", ARM_R, ARM_R], ["0", 15, 15]];
const PAGE2_TOP  = [["w", 15, 15]];
const SNACK      = [["1", ARM_R, ARM_R], ["3", 15, 15]];

const F = {
  idle:     pose({}),
  blink:    pose({ eyes: EYES_C }),
  pleased:  pose({ eyes: EYES, brow: CARET }),
  smiling:  pose({ eyes: EYES, brow: SMILE }),
  tall:     pose({ eyes: EYES_TALL, brow: EYES_TALL }),
  lookL:    pose({ eyes: EYES_LK }),
  lookR:    pose({ eyes: EYES_RK }),
  shut:     pose({ eyes: EYES_C }),

  /* walking */
  stepA:    pose({ legs: stepFront() }),
  stepB:    pose({ legs: stepBack() }),
  stepC:    pose({ legs: stepWideA() }),
  stepD:    pose({ legs: stepWideB() }),
  splay:    pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: legsWide() }),
  dangleA:  pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: [limb(3,3),limb(6,2),limb(10,3),limb(13,2)] }),
  dangleB:  pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: [limb(3,2),limb(6,3),limb(10,2),limb(13,3)] }),
  kickA:    pose({ legs: kickOut(1) }),
  kickB:    pose({ legs: kickOut(3) }),

  /* crouching, sitting, sleeping — the legs fold and nothing else changes */
  crouch:   pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: legs(2) }),
  tucked:   pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: legsTight(1) }),
  stretched:pose({ eyes: EYES_TALL, brow: EYES_TALL, legs: legs(4) }),
  sitA:     pose({ legs: seated() }),
  sitB:     pose({ eyes: EYES_C, legs: seated() }),
  sleepA:   pose({ eyes: EYES_C, legs: legsTight(1) }),
  sleepB:   pose({ eyes: EYES_C, legs: legsTight(1), float: [[4, Z_HI]] }),
  sleepC:   pose({ eyes: EYES_C, legs: legsTight(1), float: [[3, Z_LO]] }),
  napA:     pose({ eyes: EYES_C, legs: seated(), float: [[4, Z_HI]] }),
  napB:     pose({ eyes: EYES_C, legs: seated(), float: [[3, Z_LO]] }),

  /* arms */
  waveA:    pose({ raise: 1 }),
  waveB:    pose({ raise: 3 }),
  reachR:   pose({ right: "out" }),
  reachL:   pose({ left: "out" }),
  armsOut:  pose({ eyes: EYES_C, left: "out", right: "out" }),
  cheerA:   pose({ raise: 3, raiseSides: "LR" }),
  cheerB:   pose({ raise: 2, raiseSides: "LR", legs: legsTight(3) }),
  sip:      pose({ eyes: EYES_C, hold: MUG, holdUp: MUG_TOP }),
  pageA:    pose({ eyes: EYES_C, hold: PAGE, holdUp: PAGE_TOP }),
  pageB:    pose({ eyes: EYES_C, hold: PAGE2, holdUp: PAGE2_TOP }),
  snackA:   pose({ hold: SNACK }),
  snackB:   pose({ eyes: EYES_C, hold: SNACK }),

  /* thinking */
  thinkA:   pose({ float: [[3, NOTE]] }),
  thinkB:   pose({ eyes: EYES_C, float: [[2, NOTE]] }),

  /* at the desk: headphones on, arms in at the keyboard, a screen beside him */
  deskA:    pose({ cups: true, left: "in", right: "in", above: HEADPHONES,
                   legs: [], depth: 0, float: [] }),
  deskB:    pose({ cups: true, eyes: EYES_C, left: "in", right: "in", above: HEADPHONES,
                   legs: [], depth: 0 }),

  /* music */
  grooveA:  pose({ cups: true, above: HEADPHONES, legs: stepFront(), float: [[2, NOTE]] }),
  grooveB:  pose({ cups: true, eyes: EYES_C, above: HEADPHONES, legs: stepBack(), float: [[2, NOTE2]] }),

  /* the rest */
  chefA:    pose({ above: CHEF_HAT }),
  chefB:    pose({ above: CHEF_HAT, right: "out" }),
  laughA:   pose({ brow: SMILE, left: "out", right: "out" }),
  laughB:   pose({ brow: SMILE, left: "out", right: "out", legs: legsTight(3) }),
  yawnA:    pose({ eyes: EYES_C, left: "out", right: "out" }),
  yawnB:    pose({ eyes: EYES_C, raise: 3, raiseSides: "LR" }),
  pointA:   pose({ eyes: EYES_RK, right: "out" }),
  pointB:   pose({ eyes: EYES_RK, right: "out", legs: stepBack() }),
  shrugA:   pose({ eyes: EYES_TALL, brow: EYES_TALL, left: "out", right: "out" }),
  shrugB:   pose({ eyes: EYES_TALL, brow: EYES_TALL, left: "in", right: "in" }),
  clapA:    pose({ brow: CARET, left: "out", right: "out" }),
  clapB:    pose({ brow: CARET, left: "in", right: "in" }),
  tipA:     pose({ eyes: EYES_LK, legs: [limb(5,2),limb(7,1),limb(9,2),limb(11,1)] }),
  tipB:     pose({ eyes: EYES_RK, legs: [limb(5,1),limb(7,2),limb(9,1),limb(11,2)] }),
  tapA:     pose({ eyes: EYES_C, legs: tapping() }),
  tapB:     pose({ eyes: EYES_C }),
  carryA:   pose({ eyes: EYES_TALL, brow: EYES_TALL, left: "out", right: "out", above: BOX }),
  carryB:   pose({ eyes: EYES_TALL, brow: EYES_TALL, left: "out", right: "out", above: BOX,
                   legs: stepFront() }),

  /* ── the birthday ── */
  partyA:   pose({ brow: SMILE, above: PARTY_HAT }),
  partyB:   pose({ brow: SMILE, above: PARTY_HAT, raise: 2, raiseSides: "LR" }),
  partyC:   pose({ brow: SMILE, above: PARTY_HAT, raise: 3, raiseSides: "LR", legs: legsTight(3) }),
  cakeA:    pose({ brow: SMILE, above: PARTY_HAT, left: "out", right: "out" }),
  cakeB:    pose({ eyes: EYES_C, brow: SMILE, above: PARTY_HAT, left: "out", right: "out" }),
  blowA:    pose({ eyes: EYES_C, brow: SMILE, above: PARTY_HAT, left: "out", right: "out" }),
  popA:     pose({ eyes: EYES_TALL, brow: EYES_TALL, above: PARTY_HAT, legs: legsTight(1) }),
  popB:     pose({ brow: SMILE, above: PARTY_HAT, raise: 3, raiseSides: "LR", legs: legsTight(3) }),
  popC:     pose({ brow: SMILE, above: PARTY_HAT, raise: 3, raiseSides: "LR" })
};

/* the desk needs its surface under him, which is not a leg */
/* The desk: a surface under him, and a screen standing on it beside him — the
   computer he is supposed to be working at. */
function atDesk(frame) {
  const f = frame.slice();
  f[12] = DESK_TOP;
  f[13] = DESK_FEET;
  /* A screen standing on the desk in FRONT of him — he is behind it, which is
     what sitting at a computer looks like. */
  f[9]  = paint(f[9],  ["0", 9, 13]);
  f[10] = paint(f[10], ["0", 9, 9], ["s", 10, 12], ["0", 13, 13]);
  f[11] = paint(f[11], ["0", 9, 13]);
  return f;
}
F.deskA = atDesk(F.deskA);
F.deskB = atDesk(F.deskB);
void SCREEN_A; void SCREEN_B; void NUBS; void raiseRows;

/* ---------- the animation library ---------- */

const DEFAULT_ANIMATIONS = {
  idle:  { name: "idle",  builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0,0,0],
           frames: [F.idle,F.idle,F.idle,F.idle,F.blink,F.idle] },
  walk:  { name: "walk",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.stepA,F.idle,F.stepB,F.idle] },
  run:   { name: "run",   builtin: true, fps: 14, loop: true,  bob: [0,0,0,0],
           frames: [F.stepC,F.stepA,F.stepD,F.stepB] },
  jump:  { name: "jump",  builtin: true, fps: 8,  loop: true,  bob: [0,0,0,0],
           frames: [F.crouch,F.stretched,F.stretched,F.crouch] },
  sleep: { name: "sleep", builtin: true, fps: 1.5,loop: true,  bob: [0,0,0],
           frames: [F.sleepA,F.sleepB,F.sleepC] },
  wave:  { name: "wave",  builtin: true, fps: 6,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.waveA,F.waveB,F.waveA] },
  work:  { name: "at the computer", builtin: true, fps: 5, loop: true, bob: [0,0,0,0],
           frames: [F.deskA,F.deskB,F.deskA,F.deskB] },
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
           frames: [F.crouch,F.tucked,F.stretched,F.crouch,F.idle] },
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
  cheer: { name: "celebrating", builtin: true, fps: 9, loop: true, bob: [0,-2,0,-2],
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
           frames: [F.pleased,F.smiling,F.idle,F.smiling] },
  chef:  { name: "cooking",     builtin: true, fps: 4, loop: true, bob: [0,0,0,0],
           frames: [F.chefA,F.chefB,F.chefA,F.chefB] },
  laugh: { name: "laughing",    builtin: true, fps: 7, loop: true, bob: [0,-1,0,-1],
           frames: [F.laughA,F.laughB,F.laughA,F.laughB] },
  yawn:  { name: "yawning",     builtin: true, fps: 1.6, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.yawnA,F.yawnB,F.yawnA] },
  point: { name: "pointing",    builtin: true, fps: 3, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.pointA,F.pointB,F.pointA] },
  shrug: { name: "shrugging",   builtin: true, fps: 1.6, loop: true, bob: [0,0,0,0],
           frames: [F.idle,F.shrugA,F.shrugB,F.shrugA] },
  clap:  { name: "applauding",  builtin: true, fps: 9, loop: true, bob: [0,0,0,0],
           frames: [F.clapA,F.clapB,F.clapA,F.clapB] },
  tiptoe:{ name: "creeping",    builtin: true, fps: 5, loop: true, bob: [0,0,0,0],
           frames: [F.tipA,F.tipB,F.tipA,F.tipB] },
  tap:   { name: "waiting",     builtin: true, fps: 4, loop: true, bob: [0,0,0,0],
           frames: [F.tapA,F.tapB,F.tapA,F.tapB] },

  /* ── only on a birthday ── */
  party: { name: "partying",    builtin: true, fps: 6, loop: true, bob: [0,-1,-2,-1],
           birthday: true, frames: [F.partyA,F.partyB,F.partyC,F.partyB] },
  cake:  { name: "holding the cake", builtin: true, fps: 2, loop: true, bob: [0,0,0,0],
           birthday: true, frames: [F.cakeA,F.cakeA,F.cakeB,F.cakeA] },
  blow:  { name: "blowing out the candles", builtin: true, fps: 3, loop: true, bob: [0,0,0,0],
           birthday: true, frames: [F.cakeA,F.blowA,F.blowA,F.cakeA] },
  present:{ name: "out of the present", builtin: true, fps: 2.5, loop: false, bob: [0,0,0,0,0,0],
           birthday: true, frames: [F.popA,F.popA,F.popB,F.popC,F.popB,F.popC] }
};

/* Animations he may pick on his own when he has nothing better to do. */
const DEFAULT_ROTATION = ["wave", "dance", "work", "think", "jump", "desk", "chill", "read", "stretch",
                          "groove", "sit", "happy", "peek", "laugh", "yawn", "shrug", "tap", "chef", "point"];

/* Actions the engine needs and must never lose. */
const REQUIRED = ["idle", "walk", "run", "sleep", "held", "fall", "land"];

/* ---------- who this one belongs to ----------
   The only thing that differs between a copy made as a gift and the plain one. */

const PERSON = {
  name: "",                                  /* whose buddy this is, if anyone */
  hello: ["hello", "hey", "hi", "there you are"],
  phrases: null,                             /* null = the general ones        */
  checkIns: null                             /* null = the general ones        */
};

/* "how's it going?" becomes "how ya doing, Eleanor?" when this copy has an owner. */
function addressed(line) {
  const who = PERSON.name;
  if (!who) return line;
  return line.replace(/\?$/, ", " + who.toLowerCase() + "?");
}

/* ---------- birthdays ---------- */

function birthdayToday(birthdays, when) {
  const d = when || new Date();
  const key = String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  return (birthdays || []).find(b => b && b.date === key) || null;
}

function daysUntil(dateKey, when) {
  const d = when || new Date();
  const [m, day] = String(dateKey || "").split("-").map(Number);
  if (!m || !day) return null;
  let next = new Date(d.getFullYear(), m - 1, day);
  if (next < new Date(d.getFullYear(), d.getMonth(), d.getDate())) next = new Date(d.getFullYear() + 1, m - 1, day);
  return Math.round((next - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 86400000);
}

/* What he does on someone's birthday, instead of the usual pool for the hour. */
const BIRTHDAY_POOL = { party: 4, cake: 3, blow: 2, clap: 2, cheer: 2, laugh: 2, happy: 2, dance: 2, present: 1 };

/* ---------- his day ----------
   Left to dice rolls he does the same six things forever and the rest of the
   library never appears. So the day is divided into phases, each with its own pool
   of things worth doing at that hour — and a check at build time fails if any
   animation has nowhere in the day it could be chosen.

   The hours are a guess at an ordinary one, and every one of them is adjustable in
   the Studio. Meals are the fixed points: he cooks, eats, and has something to
   drink, once each per day.                                                      */

const DAY_PHASES = [
  { key: "night",     from: 0.5,  to: 6,    title: "the small hours",
    sleeps: true, pool: { tiptoe: 3, peek: 1 } },

  { key: "waking",    from: 6,    to: 7.5,  title: "waking up",
    pool: { stretch: 4, yawn: 4, idle: 2, wave: 2, tiptoe: 1 } },

  { key: "breakfast", from: 7.5,  to: 9,    title: "breakfast",
    meal: true, pool: { drink: 3, snack: 2, happy: 2, groove: 1 } },

  { key: "morning",   from: 9,    to: 12,   title: "the morning",
    pool: { desk: 5, work: 4, think: 3, read: 2, groove: 2, drink: 2, point: 1, wave: 1 } },

  { key: "lunch",     from: 12,   to: 13.5, title: "lunch",
    meal: true, pool: { sit: 3, snack: 2, laugh: 2, chill: 2, ball: 1 } },

  { key: "afternoon", from: 13.5, to: 17.5, title: "the afternoon",
    pool: { work: 4, desk: 3, read: 2, carry: 2, peek: 2, tap: 2, ball: 2,
            goal: 1, drone: 1, point: 1, clap: 1, shrug: 1 } },

  { key: "dinner",    from: 17.5, to: 19.5, title: "dinner",
    meal: true, pool: { snack: 2, drink: 2, happy: 2, dog: 2 } },

  { key: "evening",   from: 19.5, to: 22.5, title: "the evening",
    pool: { chill: 4, dance: 3, groove: 3, laugh: 3, read: 2, sit: 2, dog: 2,
            cheer: 1, happy: 1, ball: 1 } },

  { key: "winddown",  from: 22.5, to: 24.5, title: "winding down",
    pool: { yawn: 4, sit: 3, stretch: 2, nap: 2, tiptoe: 2, read: 2, shrug: 1 } }
];

/* The steps of a meal, in order. He cooks first — the hat is in the frames. */
const MEAL_ROUTINE = [
  { anim: "chef",  seconds: 14, say: "right, what's for that then" },
  { anim: "snack", seconds: 9 },
  { anim: "drink", seconds: 9 },
  { anim: "happy", seconds: 4, say: "that'll do" }
];

/* Animations the engine plays itself, with the reason — this list is what the
   coverage check accepts as "used" for anything not in a phase pool. */
const ENGINE_ANIMATIONS = {
  idle:  "standing about",
  walk:  "going somewhere",
  run:   "going somewhere faster",
  jump:  "the crouch before he leaps at a toolbar",
  fall:  "in the air",
  land:  "arriving",
  held:  "picked up",
  kick:  "the ball",
  flip:  "double-clicked",
  sleep: "asleep where he stands, when the bed is switched off",
  abed:  "asleep in the bed",
  nap:   "worn out, or dozing in the afternoon",
  wave:  "you came back to the keyboard",
  cheer: "a goal, or a new animation you drew",
  clap:  "a goal",
  happy: "thanked",
  shrug: "asked something he has no answer for",
  peek:  "you switched to an app he has not seen",
  point: "he got onto something and wants you to see",
  think: "asked a question he is waiting on the model for",
  tap:   "waiting for you to come back",
  sit:   "resting",
  chill: "sitting with his own small one",
  desk:  "you are in an editor",
  work:  "you are in an editor",
  drink: "a break",
  stretch: "after a long sit",
  read:  "you are reading something",
  dance: "you are playing music",
  groove: "you are playing music",
  snack: "part of a meal",
  chef:  "the start of a meal",
  carry: "tidying up",
  yawn:  "late",
  laugh: "something amused him",
  tiptoe: "creeping about while you are away"
};

/* Which phase an hour falls in. Phases that run past midnight wrap. */
function phaseAt(hour) {
  for (const p of DAY_PHASES) {
    if (p.to > 24 ? (hour >= p.from || hour < p.to - 24) : (hour >= p.from && hour < p.to)) return p;
  }
  return DAY_PHASES[0];
}

/* A weighted pick from a phase's pool, skipping anything switched off. */
function pickFromPool(pool, allowed) {
  const entries = Object.entries(pool || {}).filter(([k]) => !allowed || allowed(k));
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  if (!total) return null;
  let r = Math.random() * total;
  for (const [k, w] of entries) { r -= w; if (r <= 0) return k; }
  return entries[entries.length - 1][0];
}

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
  /* a cake, with a candle he can blow out */
  /* Outlined, because white icing on a white wallpaper is an invisible cake. */
  cake: { size: 8, frames: [
    ["...y....", "...k....", ".mmmmmm.", "kmmmmmmk", "kcccccck", "kkkkkkkk"],
    ["...y....", "...k....", ".mmmmmm.", "kmmmmmmk", "kcccccck", "kkkkkkkk"],
    ["........", "...k....", ".mmmmmm.", "kmmmmmmk", "kcccccck", "kkkkkkkk"]
  ]},
  /* the present he comes out of: lid on, lid off */
  present: { size: 10, frames: [
    ["....kk....", "..kkkkkk..", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr"],
    ["..k....k..", "..........", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr"],
    ["..........", "..........", "..........", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr", "rrrrkkrrrr"]
  ]},
  /* the paper hat he wears all day on a birthday, whatever else he is doing */
  hat: { size: 5, frames: [ ["..w..", "..r..", ".rrr.", "rrrrr"] ] },
  balloon: { size: 6, frames: [
    ["..rr..", ".rrrr.", ".rrrr.", "..rr..", "...k..", "..k...", "...k..", "......"],
    ["..rr..", ".rrrr.", ".rrrr.", "..rr..", "..k...", "...k..", "..k...", "......"]
  ]},
  confetti: { size: 8, frames: [
    ["..r...g.", ".y...r..", "....y...", "..g.....", "........", "........", "........", "........"],
    [".g..y...", "...r....", ".y....g.", "....r...", "........", "........", "........", "........"]
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
  return {
    "1": c.body, "2": c.shade, "3": c.light, "0": c.dark, "w": c.white,
    /* things he holds, which are not made of him: coffee, a lit screen, a candle
       flame, a ribbon. Without these the cells render as nothing at all, which is
       how his coffee was invisible for a fortnight. */
    "c": "#5a3a24", "s": "#9ed4cb", "y": "#e8c15a", "r": "#d0574c"
  };
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

const SPRITE_VERSION = 4;

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
    followClock: true,     /* cooks at mealtimes, works mornings, sleeps at night  */
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
  stats: { bestKeepies: 0, goals: 0, goalsDate: "", gifts: 0, happiness: 0.5, meals: {} },

  /* Whose birthdays he knows. MM-DD, because the year is nobody's business. */
  birthdays: [],
  rotation: DEFAULT_ROTATION.slice(),
  animations: {}          /* overrides of built-ins + custom animations    */
};

function mergeState(saved) {
  const s = JSON.parse(JSON.stringify(DEFAULT_STATE));
  if (!saved || typeof saved !== "object") return s;
  if (typeof saved.name === "string" && saved.name.trim()) s.name = saved.name.slice(0, 24);
  Object.assign(s.look, saved.look || {});
  /* The character's dimensions changed, so a size chosen for the old shape no
     longer means what it meant. Reset it once, and only once. */
  if (saved.version !== SPRITE_VERSION) s.look.scale = DEFAULT_STATE.look.scale;
  s.look.colors = Object.assign({}, DEFAULT_COLORS, (saved.look && saved.look.colors) || {});
  Object.assign(s.behavior, saved.behavior || {});
  if (Array.isArray(saved.behavior && saved.behavior.phrases)) s.behavior.phrases = saved.behavior.phrases.slice(0, 40);
  if (Array.isArray(saved.rotation)) {
    /* Their ticks are kept; new animations that shipped since are added rather than
       sitting in the gallery where he will never choose them. */
    s.rotation = saved.version === SPRITE_VERSION
      ? saved.rotation.slice()
      : Array.from(new Set(saved.rotation.concat(DEFAULT_ROTATION)));
  }
  if (Array.isArray(saved.reactions)) s.reactions = saved.reactions.slice(0, 40);
  if (Array.isArray(saved.birthdays)) s.birthdays = saved.birthdays.slice(0, 40);
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
    FOOT_ROW, SPRITE_VERSION, PROPS, PROP_PALETTE, drawProp, topRowOf,
    DAY_PHASES, MEAL_ROUTINE, ENGINE_ANIMATIONS, phaseAt, pickFromPool,
    PERSON, BIRTHDAY_POOL, birthdayToday, daysUntil, addressed, drawBall, BALL_COLORS, normalizeAnim, normalizeFrame, blankFrame, drawFrame, drawShadow, drawStanding,
    paletteFor, resolveColors, mergeState, animationsOf, mix, hexToRgb, rgbToHex
  };
}
