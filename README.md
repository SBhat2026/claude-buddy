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
eye colour; size (2×–8×); opacity; shadow; always-on-top.

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

**Window titles** need macOS Accessibility, and the Awareness tab has the button that
asks for it. They are worth the permission — an app name cannot tell a repository
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

### The whole screen, not just the bottom of it

He walks the floor, and when he reaches the side of the screen he often keeps going:
up the wall, across the ceiling upside down, down the far side. He lets go now and
then and falls, which is the same fall as being dropped.

He is drawn rotated about the point his feet touch, so a quarter turn puts him on a
wall rather than sliding him along one, and which way he faces flips with the turn —
on the left wall "forward" is a different screen direction than on the right.

**Your windows are ledges.** With Accessibility granted he is told where the
frontmost window is, and its top edge becomes something he can jump onto and walk
along. Move the window and he rides it; move it out from under him and he falls.
Turn it off in Behaviour and he ignores your windows entirely.

### Things he gets up to

- **A goal.** He puts one up himself — posts, then the crossbar, then the net —
  then takes shots at it. Kicks aim at the goal when there is one, and he keeps
  count.
- **A drone.** He launches it, stands there working the controls, and it flies a
  lazy circuit above him before coming back down.
- **His own pet.** A smaller one of him on a leash, which follows him about at a
  polite distance and stops when he stops. The leash is drawn between them.

Each has a switch in Behaviour, and each can be asked for by name in the talk line
or from the menu bar.

### He asks for things

Now and then he asks for something — *"could i have a skateboard?"* — and it lands
in the studio under **He has been asking for**, with a **Make it** button that opens
the editor with that name already filled in.

The point is that what he asks for is always something the editor that ships with
him can produce. And he can tell when you have: the moment a new animation appears
in his list he stops what he is doing, plays it, throws hearts, and thanks you by
name — *"you made it! a skateboard!"* — then keeps it in his rotation like any other.
He never asks for more than three things at once.

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
