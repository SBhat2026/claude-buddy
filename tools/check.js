/* One model, enforced.
 *
 * Two different creatures once lived in this project: the sprite, and a menu-bar
 * icon someone had drawn by hand with three legs and a narrower head. This is the
 * check that stops that happening again — it fails the build rather than letting a
 * second body shape reach the screen.
 */
const fs = require("fs");
const path = require("path");

const win = {};
new Function("window", fs.readFileSync(path.join(__dirname, "..", "Resources", "common.js"), "utf8"))(win);
const CB = win.CB;
const A = CB.DEFAULT_ANIMATIONS;
const PALETTE = CB.paletteFor(null);

/* Animations that are allowed to change his height, because folding his legs is
   how sitting, sleeping and crouching work. */
/* Animations where his height is allowed to change, because folding his legs —
   or climbing out of a present — is the point of them. */
const FOLDS = ["jump", "land", "flip", "sleep", "abed", "nap", "chill", "sit", "desk", "work", "present"];

const BODY_LEFT = [1, 2, 3];       /* body rows start at 3, arm rows at 2, reaches at 1 */
const BODY_RIGHT = [13, 14, 15];
const CANON_BODY = CB.DEFAULT_ANIMATIONS.idle.frames[0].find(r => /^\.{3}1{11}\.{2}$/.test(r));

let fails = 0;
const fail = (...m) => { console.log("  ✗", ...m); fails++; };

function longestRun(row, ch) {
  let best = 0, run = 0;
  for (const c of row) { run = c === ch ? run + 1 : 0; if (run > best) best = run; }
  return best;
}
function runEdges(row, ch) {
  let best = null, start = -1;
  for (let i = 0; i <= row.length; i++) {
    if (row[i] === ch) { if (start < 0) start = i; }
    else if (start >= 0) { if (!best || i - start > best[1] - best[0] + 1) best = [start, i - 1]; start = -1; }
  }
  return best;
}

console.log("checking the model…");

if (!CANON_BODY) fail("the canonical body row is not in the idle frame — has the model changed?");

for (const [key, anim] of Object.entries(A)) {
  anim.frames.forEach((frame, i) => {
    const where = `${key} frame ${i}`;

    if (frame.length !== 16) fail(where, "is not 16 rows");
    frame.forEach((row, y) => {
      if (typeof row !== "string" || row.length !== 16) return fail(where, "row", y, "is not 16 wide");
      /* the allowed colours are whatever the palette can actually draw — hardcoding
         them here is how 'c' and 's' shipped as invisible cells */
      for (const ch of row) if (ch !== "." && !PALETTE[ch]) fail(where, "row", y, `uses '${ch}', which the palette cannot draw`);

      /* Any row wide enough to be part of his body must be HIS body: same left and
         right edges, every time. This is the rule that keeps one model. */
      if (longestRun(row, "1") >= 8) {
        const [lo, hi] = runEdges(row, "1");
        if (!BODY_LEFT.includes(lo) || !BODY_RIGHT.includes(hi)) {
          fail(where, "row", y, `is a body row at columns ${lo}-${hi}, not the model's ${BODY_LEFT[2]}-${BODY_RIGHT[0]}`);
        }
      }
    });

    /* His shoulders never narrow. An arm may reach further out or lift, but it may
       not retract into him: a body that changes width between frames reads as two
       different creatures, which is what "arms in" did to him. */
    const shoulder = frame.filter(r => /1{13,}/.test(r.replace(/[02]/g, "1")));
    const anyBody = frame.some(r => /1{9,}/.test(r.replace(/[02]/g, "1")));
    if (anyBody && !shoulder.length) fail(where, "has no shoulder row 13 wide — his arms have retracted into him");

    /* He must have a face. A raised arm lives on the eye row, and overwriting it
       has blinded him three times now. */
    const hasEyes = frame.some(r => /1/.test(r) && (r.match(/[02]/g) || []).length >= 2);
    if (!hasEyes) fail(where, "has no eyes");

    /* And the body itself must actually be there. */
    if (!frame.includes(CANON_BODY)) fail(where, "does not contain the canonical body row");
  });

  /* Within one animation the head may not wander, unless folding his legs is the
     point of it. */
  const tops = anim.frames.map(f => f.indexOf(CANON_BODY));
  const spread = Math.max(...tops) - Math.min(...tops);
  if (spread > 0 && !FOLDS.includes(key)) fail(key, `moves his head ${spread} row(s) while animating`);
  if (spread > 3) fail(key, `moves his head ${spread} rows, which is more than folding legs can explain`);
}

/* Every animation must have somewhere in the day it can actually be chosen.
   Drawing one and leaving it in the gallery is the same as not drawing it. */
const inPools = new Set();
for (const phase of CB.DAY_PHASES) for (const k of Object.keys(phase.pool || {})) inPools.add(k);
for (const step of CB.MEAL_ROUTINE) inPools.add(step.anim);
for (const k of Object.keys(CB.BIRTHDAY_POOL)) inPools.add(k);
const byEngine = new Set(Object.keys(CB.ENGINE_ANIMATIONS));
const inReactions = new Set(CB.DEFAULT_STATE.reactions.map(r => r.do));

const homeless = Object.keys(A).filter(k => !inPools.has(k) && !byEngine.has(k) && !inReactions.has(k));
if (homeless.length) fail("never used anywhere in the day:", homeless.join(", "));

/* …and nothing may point at an animation that does not exist. */
const known = new Set(Object.keys(A).concat(["ball", "goal", "drone", "dog"]));
for (const phase of CB.DAY_PHASES) {
  for (const k of Object.keys(phase.pool || {})) if (!known.has(k)) fail(phase.key, "schedules", k, "which is not an animation");
}
for (const k of Object.keys(CB.ENGINE_ANIMATIONS)) if (!A[k]) fail("the engine list names", k, "which is not an animation");

const count = Object.keys(A).length;
if (fails) {
  console.log(`\n${fails} problem(s) across ${count} animations.`);
  process.exit(1);
}
console.log(`  ✓ ${count} animations, one body, every frame with a face, and every one of them used somewhere in the day.`);
