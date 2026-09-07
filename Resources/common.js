/* Claude Buddy — shared sprite data, rendering and state. Used by pet.html and studio.html. */

/* ---------- pixel vocabulary ----------
   '.' transparent   '1' body   '2' shade   '3' light   '0' dark (eyes)   'w' white
   Every frame is 16 rows of 16 characters.                                        */

const BLANK = "................";
const BODY  = "....11111111....";
const HIPS  = "...1111111111...";
const EYES  = "....11011011....";
const EYESC = "....11211211....";
const EYESW = "....10011001....";
const ARMS  = "..111111111111..";
const LEGS  = "...1.1....1.1...";
const LEG_A = "...1.1..........";
const LEG_B = "..........1.1...";
const BODY_L = "...11111111.....";
const EYES_L = "...11011011.....";
const ARMS_L = ".111111111111...";
const LEGS_L = "..1.1....1.1....";
const BODY_R = ".....11111111...";
const EYES_R = ".....11011011...";
const ARMS_R = "...111111111111.";
const LEGS_R = "....1.1....1.1..";
const ARM_UP1 = "....11111111.11.";
const ARM_UP2 = "....11111111..11";
const REACH   = "....1111111111..";
const REACH2  = "....11111111.1..";

const F = {
  idle:   [BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  breathe:[BLANK,BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,ARMS,ARMS,BODY,HIPS,LEGS,LEGS,BLANK,BLANK],
  blink:  [BLANK,BLANK,BLANK,BODY,BODY,EYESC,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  stepA:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEG_A,BLANK,BLANK],
  stepB:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEG_B,BLANK,BLANK],
  crouch: [BLANK,BLANK,BLANK,BLANK,BODY,BODY,EYESW,BODY,ARMS,ARMS,BODY,HIPS,LEGS,LEGS,BLANK,BLANK],
  stretch:[BLANK,BLANK,BODY,BODY,EYESW,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,LEGS,BLANK,BLANK],
  sleepA: [BLANK,BLANK,BLANK,BLANK,BLANK,BODY,BODY,EYESC,ARMS,ARMS,HIPS,LEGS,LEGS,BLANK,BLANK,BLANK],
  sleepB: [BLANK,BLANK,BLANK,"..............0.",BLANK,BODY,BODY,EYESC,ARMS,ARMS,HIPS,LEGS,LEGS,BLANK,BLANK,BLANK],
  sleepC: [BLANK,BLANK,".............0..",BLANK,BLANK,BODY,BODY,EYESC,ARMS,ARMS,HIPS,LEGS,LEGS,BLANK,BLANK,BLANK],
  wave1:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,ARM_UP1,ARM_UP1,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  wave2:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,ARM_UP2,ARM_UP1,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  work1:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,REACH,LEGS,LEGS,LEGS,BLANK,BLANK],
  work2:  [BLANK,BLANK,BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,REACH2,LEGS,LEGS,LEGS,BLANK,BLANK],
  danceL: [BLANK,BLANK,BLANK,BODY_L,BODY_L,EYES_L,BODY_L,BODY_L,ARMS_L,ARMS_L,BODY_L,LEGS_L,LEGS_L,LEGS_L,BLANK,BLANK],
  danceR: [BLANK,BLANK,BLANK,BODY_R,BODY_R,EYES_R,BODY_R,BODY_R,ARMS_R,ARMS_R,BODY_R,LEGS_R,LEGS_R,LEGS_R,BLANK,BLANK],
  heldA:  [BLANK,BLANK,BODY,BODY,EYESW,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEG_A,BLANK,BLANK,BLANK],
  heldB:  [BLANK,BLANK,BODY,BODY,EYESW,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEG_B,BLANK,BLANK,BLANK],
  fall:   [BLANK,BLANK,BLANK,BODY,BODY,EYESW,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,BLANK,BLANK,BLANK],
  think1: [BLANK,".........0......",BLANK,BODY,BODY,EYES,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  think2: [BLANK,"........000.....",BLANK,BODY,BODY,EYESC,BODY,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK],
  squash: [BLANK,BLANK,BLANK,BLANK,BLANK,BLANK,BODY,BODY,EYESW,ARMS,ARMS,ARMS,LEGS,LEGS,BLANK,BLANK],
  windup: [BLANK,BLANK,BLANK,BODY_L,BODY_L,EYES_L,BODY_L,BODY_L,ARMS_L,ARMS_L,BODY_L,LEGS_L,LEGS_L,LEGS_L,BLANK,BLANK],
  strike: [BLANK,BLANK,BLANK,BODY_R,BODY_R,EYES_R,BODY_R,BODY_R,ARMS_R,ARMS_R,HIPS,
           "....1.1....1.1..", "....1.1.....1.1.", "....1.1......1.1",BLANK,BLANK],
  upside: [BLANK,BLANK,LEGS,LEGS,LEGS,BODY,ARMS,ARMS,BODY,BODY,EYESW,BODY,BODY,BLANK,BLANK,BLANK],
  tuck:   [BLANK,BLANK,BLANK,BLANK,BODY,BODY,EYESW,BODY,ARMS,ARMS,HIPS,LEG_A,BLANK,BLANK,BLANK,BLANK],
  sip:    [BLANK,BLANK,BLANK,BODY,BODY,EYESC,ARM_UP1,BODY,ARMS,ARMS,HIPS,LEGS,LEGS,LEGS,BLANK,BLANK]
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
           frames: [F.crouch,F.stretch,F.stretch,F.crouch] },
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
  held:  { name: "held",  builtin: true, fps: 5,  loop: true,  bob: [0,-1,0,-1],
           frames: [F.heldA,F.heldB] },
  fall:  { name: "fall",  builtin: true, fps: 6,  loop: true,  bob: [0,0],
           frames: [F.fall,F.fall] },
  land:  { name: "land",  builtin: true, fps: 10, loop: false, bob: [0,0,0],
           frames: [F.squash,F.crouch,F.idle] },
  kick:  { name: "kick",  builtin: true, fps: 10, loop: false, bob: [0,-1,0,0],
           frames: [F.windup,F.strike,F.strike,F.idle] },
  flip:  { name: "flip",  builtin: true, fps: 11, loop: false, bob: [0,-4,-7,-3,0],
           frames: [F.crouch,F.tuck,F.upside,F.tuck,F.land ? F.crouch : F.crouch] },
  drink: { name: "drink", builtin: true, fps: 3,  loop: true,  bob: [0,0,0,0],
           frames: [F.idle,F.sip,F.sip,F.idle] }
};

/* Animations the buddy may pick on his own when he has nothing better to do. */
const DEFAULT_ROTATION = ["wave","dance","work","think","jump"];

/* Actions the engine needs and must never lose. */
const REQUIRED = ["idle","walk","run","sleep","held","fall","land"];

/* ---------- props ----------
   Small 8x8 things he can take out and use. Their own palette: they are objects in
   the world, not part of him, so they do not recolour when he does.               */

const PROP_PALETTE = {
  w: "#fbfaf6", k: "#2b1a14", m: "#e7e1d3", c: "#5a3a24",
  s: "#9ed4cb", r: "#d0574c", d: "#c9c2b4", y: "#e8c15a", g: "#6fae6a"
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
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (!ch || ch === ".") continue;
      const col = PROP_PALETTE[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x0 + x * s), Math.round(y0 + y * s), s, s);
    }
  }
  ctx.restore();
}


/* ---------- things he would like ----------
   He asks for one of these now and then. The point is not the list — it is that
   what he asks for is answerable in the editor that ships with him, so "can I have
   a skateboard" is a thing you can actually go and make, and he can tell when you
   have. */

const WISH_POOL = [
  { text: "a skateboard", kind: "animation" },
  { text: "a tiny hat", kind: "animation" },
  { text: "an umbrella", kind: "animation" },
  { text: "a fishing rod", kind: "animation" },
  { text: "a guitar", kind: "animation" },
  { text: "a plant to water", kind: "animation" },
  { text: "a paintbrush", kind: "animation" },
  { text: "a swimming animation", kind: "animation" },
  { text: "somewhere to sit down", kind: "animation" },
  { text: "a sleeping bag", kind: "animation" },
  { text: "a second ball in another colour", kind: "prop" },
  { text: "a cartwheel", kind: "animation" }
];

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
  for (let y = 0; y < GRID; y++) {
    const row = frame[y] || "";
    for (let x = 0; x < GRID; x++) {
      const ch = row[x];
      if (!ch || ch === ".") continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(Math.round(x0 + x * scale), Math.round(y0 + y * scale), scale, scale);
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
  look: { scale: 4, colors: Object.assign({}, DEFAULT_COLORS), shadow: true, opacity: 1 },
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
    climbEdges: true,      /* up the sides of the screen and across the top  */
    useWindows: true,      /* stands on the top edge of your frontmost window */
    buildGoal: true,       /* puts up a goal and takes shots at it           */
    flyDrone: true,
    walkPet: true,         /* takes his own small pet out                    */
    proposeIdeas: true     /* asks for things for you to make                */
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
  stats: { bestKeepies: 0, goals: 0, gifts: 0, happiness: 0.5 },
  wishes: [],
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
  if (Array.isArray(saved.wishes)) s.wishes = saved.wishes.slice(0, 30);
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
    FOOT_ROW, PROPS, PROP_PALETTE, WISH_POOL, drawProp, drawBall, BALL_COLORS, normalizeAnim, normalizeFrame, blankFrame, drawFrame, drawShadow, drawStanding,
    paletteFor, resolveColors, mergeState, animationsOf, mix, hexToRgb, rgbToHex
  };
}
