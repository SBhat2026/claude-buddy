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

/* Animations that are allowed to change his height, because folding his legs is
   how sitting, sleeping and crouching work. */
const FOLDS = ["jump", "land", "flip", "sleep", "abed", "nap", "chill", "sit", "desk"];

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
      if (/[^.0123wcs]/.test(row)) fail(where, "row", y, "uses an unknown colour:", row);

      /* Any row wide enough to be part of his body must be HIS body: same left and
         right edges, every time. This is the rule that keeps one model. */
      if (longestRun(row, "1") >= 8) {
        const [lo, hi] = runEdges(row, "1");
        if (!BODY_LEFT.includes(lo) || !BODY_RIGHT.includes(hi)) {
          fail(where, "row", y, `is a body row at columns ${lo}-${hi}, not the model's ${BODY_LEFT[2]}-${BODY_RIGHT[0]}`);
        }
      }
    });

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

const count = Object.keys(A).length;
if (fails) {
  console.log(`\n${fails} problem(s) across ${count} animations.`);
  process.exit(1);
}
console.log(`  ✓ ${count} animations, one body, every frame with a face.`);
