# Claude Buddy

A small pixel figure that lives on your desktop. He walks the whole screen on four
skinny legs — the floor, up the sides, upside down across the top, and along the top
edge of whatever window you are actually working in — wanders off on his own, takes a football out and knocks
it about, waves, dances, works at a tiny laptop, naps when you ignore him, and can be
picked up and dropped. **Buddy Studio** is the app that comes with him: a
gallery of his animations, a pixel editor for drawing new ones, and the dials for
how he looks and behaves.

Native macOS app, no Electron, no dependencies — ~1 MB. The shell is 300 lines of
Swift; everything he does is HTML and JavaScript inside it.

## Install

Double-click **ClaudeBuddy.app**. He drops onto your screen and a small figure
appears in the menu bar.

To keep him around: drag the app into `/Applications`, then add it in
System Settings → General → Login Items.

## Living with him

| | |
| --- | --- |
| **Click him** | he hops, and sometimes says something |
| **Drag him** | pick him up anywhere on screen and drop him — he falls, bounces and lands |
| **Double-click him** | opens Buddy Studio |
| **Right-click him** | also opens the Studio |
| **Click him** | he says "hmm?" and a line opens — type one thing, Enter, and he answers and gets back to what he was doing |
| **Double-click him** | backflip |
| **Click him while he is playing** | he boots the ball |
| **Menu bar icon** | Come Here · Do Something · Play Ball · Backflip · Sleep · Recentre · Next Display · Hide |

Clicks only reach him when the pointer is actually over his sprite. Everywhere else
in his window, clicks pass straight through to whatever is underneath, so he never
gets in the way of what you are doing. He also uses a non-activating panel, so
poking him does not pull focus out of the app you were typing in.

## Buddy Studio

Open it from the menu bar icon, or by double-clicking him.

**Animations** — every animation as a live looping card. Play one on the desktop,
edit it, copy it, or tick *in his rotation* to add it to the pool he picks from when
he decides to do something. The ones marked `core` (idle, walk, run, sleep, held,
fall, land) are the ones the engine drives itself; they can be edited but not removed.

**Editor** — a 16×16 grid, one frame at a time.

- Paint with the palette swatches: transparent, body, shade, highlight, eyes, white.
  The colours are roles, not fixed values, so recolouring him recolours everything
  you have drawn.
- Tools: pencil, fill, pick. Hold **shift** while painting to erase.
- Per frame: clear, flip, nudge in any direction, copy the previous frame, onion skin.
- The number under each frame nudges him up or down that many pixels for that frame.
  That is what makes a walk bounce rather than glide.
- The darker line across the grid at row 14 is the ground. Draw his feet on it.
- **Save** writes over the animation you loaded (a built-in gets an *edited* badge and
  a Revert button); **Save as new** files it as your own.

**Look** — body colour, with shade and highlight following it unless you pin them;
eye colour; size (2×–8× in tenths, 3.6× by default); opacity; shadow; always-on-top.
Fractional sizes tile cleanly because cell *edges* are rounded to whole pixels
rather than cell widths, so nothing seams or overlaps.

**Behaviour** — energy (how often he decides to do something), walk and run speed,
gravity, how close to the screen edge he will go, whether he follows the cursor,
whether he reacts to clicks, whether he plays with the ball, whether he uses props,
whether he winds down at night, how long before he naps, and the list of things he
says. Your best run of keepie-uppies is kept here.

**Awareness** — what he does about what you are doing, in two layers.

The first needs no model at all and is on by default: a table of *reactions*, each a
pattern matched against the frontmost app and its window title. Editor or terminal →
he gets out his laptop and works. Spotify → he dances. A browser → he reads over your
shoulder. Slack → he waves. Steam → he takes the ball out. Nothing at all for a while
→ he naps. He switches the moment you switch, and more than half of what he chooses
to do on his own is drawn from whatever you are doing. The table is editable, first
match wins, and the pattern is a regular expression.

The second layer is the words. Pair him with a small local model (Ollama) and he is
handed a one-line situation — *"they just switched to Safari, the window is called
'MAT 203 lecture 4'; it is 11:40 pm"* — and answers with a few words and one of his
animations.

What he is given is deliberately thin: **the name of the frontmost app, how long you
have been away from the keyboard, and the time**. Never window contents, never
keystrokes, never a screenshot — the app asks for no permissions at all. The request
is made by the native side to `localhost`, so nothing leaves the machine, and the
system prompt is a text box you can rewrite to change who he is.

A big model is a waste here. `ollama pull gemma3:1b` (~800 MB) is the default and
answers in a second or two; the model picker sorts by size and skips embedding
models, which cannot chat.

The reply shape is not left to the model's goodwill: Ollama is given a JSON Schema
and constrains decoding to it, so `do` can only ever be an animation he actually
has. Asked politely instead, a 1B model returns the placeholder text from the prompt
about a third of the time.

**Accessibility** is what window titles and the shelves both need, and the Awareness
tab has the button that asks for it. One caveat worth knowing: the permission is
remembered against the exact binary, so **rebuilding the app means granting it
again** — remove the old entry in System Settings → Privacy & Security →
Accessibility and re-add the new one. They are worth the permission — an app name cannot tell a repository
from a video — but they also carry document names, subject lines and the tab you are
on, so the switch is separate and can be turned off on its own. He never sees window
contents, keystrokes, or a picture of the screen; the app asks for nothing else.

**Export / Import** writes the whole lot — including your animations — to a JSON file
you can keep or move to another machine.

## Where things live

```
~/Library/Application Support/ClaudeBuddy/state.json    everything you customise
```

Delete that file to put him back to factory settings (or use *Reset everything* in
the Studio footer).

## The character

Drawn from the onboarding block — a body wider than it is tall, two square eyes set
wide in the upper half, an arm nub out each side at mid height, and four legs in two
pairs with a gap between them — with a little of the walking sprite's character in
the eyes, which are the only part of his face that ever moves.

```
.###########.
.###########.
..#.#####.#..     eyes, set wide
.###########.
.###########.
#############     the arm nubs, one each side
#############
.###########.
..#.#...#.#..     four legs, two pairs
```

That body is copied into every frame and **never changes** — not squashed, not
stretched, not leaned, not tipped over. Three things move, and only these three:

| | |
| --- | --- |
| **the eyes** | open, shut, wide, pleased, or looking to one side |
| **the legs** | the three rows beneath the body |
| **the arms** | the nubs at the sides, and cells beyond them |

All thirty-six animations are combinations of those. A step shortens one pair of
legs by a row — never by half, which is what made him look like he was squatting as
he walked — and because every standing frame carries exactly three rows of leg, the
head lands on the same row in all of them and cannot bob or compress.

**`tools/check.js` enforces that there is one model, and the build runs it.** Any row
wide enough to be part of his body must *be* his body — same left and right edge,
every time — and every frame must contain the canonical body row, must have eyes, and
must not move his head within an animation that is not folding his legs.

It has caught real things: three poses were rendering him eyeless, because the row a
raised arm lives on is the row his eyes are on. And the menu-bar icon used to be a
second animal entirely — hand-drawn in Swift with a narrower head and three legs
where he has four — so the project shipped two creatures, one of them sitting in the
menu bar all day. That image is now generated from the sprite itself at build time
(`Resources/menubar.png`, a template image: body opaque, eyes as holes, so it reads
on a light menu bar and a dark one), and there is no longer anywhere for a second
model to hide.

He is 47×40 pixels at the default size.

## Building it yourself

Needs the Xcode command line tools and node (only to draw the icon).

```bash
./build.sh
```

Produces `build/ClaudeBuddy.app` and `build/ClaudeBuddy.zip`.

```
Sources/main.swift     the native shell: panel, window, menu bar, IPC, persistence
Resources/common.js    sprite data, the animation library, palette, drawing
Resources/pet.html     the buddy himself — physics, behaviour, the window follows him
Resources/studio.html  the studio app
tools/make-icon.js     renders the sprite into the app icon, no dependencies
```

### How he moves

His window is 320×260 and mostly empty; the web page inside it decides where he
should be and tells the native side to move the window there, 60 times a second.
So the sprite is always drawn at the same place inside the window, and the *window*
is what walks. That is why he can be dragged, thrown, and bounced without any of the
usual desktop-pet trickery, and why hit testing is just "is the pointer over the
sprite".

### He jumps onto the things you are using

Not the walls — the interface. With Accessibility granted, the frontmost window's
accessibility tree is read every few seconds and the wide, shallow things in it are
treated as shelves: **the search field, the toolbar, the tab strip, a row of buttons,
and the top edge of the window itself.**

He hops up onto one, walks its length, hops to another, and steps off when he is
bored. A browser toolbar is eight hundred pixels above the floor he lives on, which
no sensible little hop could ever reach — so he does not do sensible little hops. He
crouches first and then launches, which is also the difference between reading as a
jump and reading as a glitch. What he lands on he sometimes has an opinion about — *"so many tabs"* on a
tab strip, *"anything good?"* on a search field.

Because they are real elements and not a picture of them, they behave like the real
thing: scroll the toolbar away, close the window, or switch app, and the shelf under
him stops existing — so he falls, which is the same fall as being dropped. Move the
window and he rides it.

The tree walk is bounded (depth six, four hundred nodes, twenty-four shelves, once
every four seconds, off the main thread) because a browser has thousands of elements
and none of the rest are worth enumerating to find the search bar.

Turn it off in Behaviour and he only ever uses the floor.

### His day

Left to dice rolls he does the same six things forever and most of the library never
appears. So the day is divided into phases, each with its own pool of things worth
doing at that hour:

| | | |
| --- | --- | --- |
| 00:30–06:00 | the small hours | asleep, unless you are up — then he creeps about |
| 06:00–07:30 | waking up | stretching, yawning, a wave |
| 07:30–09:00 | **breakfast** | he cooks, eats, has something to drink |
| 09:00–12:00 | the morning | at the desk, working, thinking, reading, grooving |
| 12:00–13:30 | **lunch** | the same meal, then sitting about |
| 13:30–17:30 | the afternoon | work, carrying, peeking, waiting, football, the goal, the drone |
| 17:30–19:30 | **dinner** | the meal again, and he walks his pet after |
| 19:30–22:30 | the evening | chilling with his own small one, dancing, laughing, reading |
| 22:30–00:30 | winding down | yawning, sitting, dozing, creeping about |

A meal is a routine, not a pose: he cooks in the chef's hat, then snacks, then has a
drink, then looks pleased with himself — once each per day, remembered across
restarts so a relaunch does not mean second lunch.

**Energy.** Running, jumping and football tire him; sitting, reading and sleeping
give it back. The rates are calibrated against a day rather than a minute — about
five minutes of solid running, or a quarter of an hour of football, takes him from
full to worn out, while walking about is nearly free. Below a fifth of the bar he
stops whatever he is doing and lies down: a doze on the spot in the afternoon, the
bed if it is late. That is what "a significant amount of activity" means here —
not a step count, but actually being tired.

The **His day** tab shows the schedule, which phase he is in, what he is doing and
how much energy he has left, and has the switch that turns the whole thing off.

Everything else still overrides it: what you are doing on screen, being picked up,
being spoken to, and being clicked all come first.

### Things he gets up to

- **A goal.** He puts one up himself — posts, then the crossbar, then the net —
  then takes shots at it. Kicks aim at the goal when there is one, and he keeps
  count.
- **A drone.** He launches it, stands there working the controls, and it flies a
  lazy circuit above him before coming back down.
- **His own pet.** A smaller one of him on a leash, which follows him about at a
  polite distance and stops when he stops. The leash is drawn between them.
- **A bed.** When he gets tired he does not switch off where he stands: he takes a
  bed out, unrolls it, and lies down on it with his legs tucked under him. Wake him
  and he packs it away.
- **Goals are a daily tally.** Yesterday's are yesterday's; the count starts again
  each day.
- **Cooking, laughing, yawning, pointing, shrugging, applauding, creeping and
  waiting.** Eight more poses in the rotation, built the same way as the rest.
- **Checking in.** Every so often — forty-five minutes by default, adjustable — he
  asks how it is going. With a model he asks about whatever you are actually in;
  without one he asks anyway.

Each has a switch in Behaviour, and each can be asked for by name in the talk line
or from the menu bar.

### Talking to him

Clicking him opens a one-line prompt under his chin. One question, one answer: the
line closes on Enter and he goes back to what he was doing rather than standing
there with a cursor blinking at you. Click him again to say something else.

Plain instructions never reach a model at all — *dance*, *play ball*, *come here*, *sleep*, *bigger*, *slower*,
*quiet*, *flip* and a dozen more are matched directly, so he is useful before any
model is set up and instantly when one is. Anything else is passed to the local model
along with what he can see, and he answers in the bubble.

Typing needs keyboard focus, and taking it quietly would be rude: focus is taken only
while the line is open and handed straight back to whatever you were in when you
press Esc or he times out.

### Props

The mug, the laptop, the dust puff and the heart are 8x8 grids in `PROPS` with their
own palette — they are objects in the world, so they do not recolour when he does.

The ball is the exception and is drawn round rather than square. A football rendered
as eight fat pixels reads as a dice, and at the size a real one would be beside him —
about the length of one of his legs — there are not enough pixels left to say
"football" at all. So it is a real circle: a dark centre patch, three patches in the
red, blue and green of the 2026 tournament ball, and a rim as heavy as his own
outline so it belongs to the same drawing. Three big colour wedges were tried first
and read as a beach ball.

Its physics are real too: gravity, bounce, rolling friction, rotation from the
distance rolled, and a tether that keeps it inside his window, which is why he can
dribble it without it ending up somewhere he cannot reach.

### Adding an animation in code

Animations are plain data — 16 rows of 16 characters per frame:

```js
myWave: { name: "wave", fps: 6, loop: true, bob: [0,-1,0,-1], frames: [ [...] ] }
```

`.` transparent · `1` body · `2` shade · `3` highlight · `0` eyes · `w` white.
Anything you draw in the Studio is stored in exactly this shape, so an animation
made in the editor and one written by hand are the same thing.
