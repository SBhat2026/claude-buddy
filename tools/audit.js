/* Pixel-level audit of every frame: what is drawn where, and whether it hangs together. */
const fs = require("fs"), path = require("path");
const win = {};
new Function("window", fs.readFileSync(path.join(__dirname, "..", "Resources", "common.js"), "utf8"))(win);
const CB = win.CB, A = CB.DEFAULT_ANIMATIONS;
const PAL = CB.paletteFor(null);

let issues = [];
const note = (a, i, m) => issues.push(`${a}:${i}  ${m}`);

for (const [key, anim] of Object.entries(A)) {
  anim.frames.forEach((frame, i) => {
    const at = (y, x) => ((frame[y] || "")[x] || ".");
    const filled = (y, x) => at(y, x) !== ".";

    /* 1. every colour used must exist in the palette, or it renders as nothing */
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const c = at(y, x);
      if (c !== "." && !PAL[c]) note(key, i, `colour '${c}' at ${y},${x} is not in the palette — invisible`);
    }

    /* 2 & 3. everything drawn must hang together: flood out from his body and see
          what is left over. A Z or a musical note above his head is allowed to be
          on its own; nothing else is. */
    const body = [];
    for (let y = 0; y < 16; y++) if (/1{9,}/.test(frame[y].replace(/[02]/g, "1"))) body.push(y);
    const top = body.length ? body[0] : 16;
    if (!body.length) note(key, i, "no body rows");

    const seen = new Set();
    const stack = [];
    for (const y of body) for (let x = 0; x < 16; x++) if (filled(y, x)) { stack.push([y, x]); seen.add(y + "," + x); }
    while (stack.length) {
      const [y, x] = stack.pop();
      for (const [dy, dx] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const ny = y + dy, nx = x + dx, k = ny + "," + nx;
        if (ny < 0 || ny > 15 || nx < 0 || nx > 15 || seen.has(k) || !filled(ny, nx)) continue;
        seen.add(k); stack.push([ny, nx]);
      }
    }
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (!filled(y, x) || seen.has(y + "," + x)) continue;
      const floater = y < top && (at(y, x) === "0" || at(y, x) === "3");
      if (!floater) note(key, i, `'${at(y, x)}' at ${y},${x} is not joined to him`);
    }

    /* 4. he must have a face */
    const bottom = body.length ? body[body.length - 1] : 15;
    const eyeRows = [];
    for (let y = top; y <= bottom; y++) {
      const dark = [...frame[y]].map((c, x) => [x, c]).filter(([, c]) => c === "0" || c === "2");
      if (dark.length) eyeRows.push([y, dark.map(([x]) => x)]);
    }
    if (!eyeRows.length) note(key, i, "no eyes");
  });
}

if (!issues.length) { console.log("clean: nothing adrift, nothing invisible, every leg attached"); process.exit(0); }
console.log(issues.length + " problem(s):\n");
issues.slice(0, 40).forEach(l => console.log("  " + l));
if (issues.length > 40) console.log("  …and " + (issues.length - 40) + " more");
process.exit(1);
