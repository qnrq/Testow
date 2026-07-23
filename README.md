# Cyberpunk Loading Screen — Zero Dependencies

This build depends on **nothing external at all**: no React, no Tailwind, no
Framer Motion, no three.js, no CDN, no `npm install`, no build step. Every
line is plain HTML/CSS/JavaScript plus the browser's native WebGL API.

## What's inside

```
index.html          ← open this directly in a browser, that's it
css/styles.css       ← all styling + animations (plain CSS, no framework)
js/app.js            ← all logic: UI, a hand-written GLB parser, and a
                        hand-written WebGL renderer (no three.js)
js/model-data.js     ← your earth_globe_sci-fi_look.glb, pre-encoded as
                        base64 and loaded as a classic <script> tag
assets/logo.webp     ← your logo
```

## Run it

Just double-click `index.html`. No server required — every asset is either
inlined (`js/model-data.js`) or loaded with a plain `<img>`/`<link>`/
`<script src>` tag, none of which need `fetch()`, so it works fine straight
from the filesystem (`file://`) with no network access whatsoever.

## How the "no libraries" constraint was met

- **UI / animation**: plain CSS keyframes + transitions for the scanlines,
  noise grain, glitch title, glowing progress bar, and the Arabic message
  cross-fade. No Framer Motion.
- **3D rendering**: a small hand-written WebGL renderer (`initScene` /
  `render` in `app.js`) — raw `gl.*` calls, hand-written GLSL shaders, a
  hand-rolled mat4/lookAt/perspective math module. No three.js.
- **3D model loading**: a from-scratch binary glTF (`.glb`) parser
  (`parseGLB`, `readAccessor`, `buildBaseWorldMatrices` in `app.js`) that
  reads the file's JSON + binary chunks directly per the glTF 2.0 spec. No
  `GLTFLoader`.
- **Textures**: decoded with the browser's native `createImageBitmap()` —
  no image-loading library needed.

## Customizing

Everything tunable lives in the `CONFIG` object at the top of `js/app.js`:
duration, colors, fonts, title/subtitle, telemetry lines, the rotating
Arabic messages, and the 3D scene's rotation/float/camera settings. Colors
are also pushed onto CSS custom properties (`--primary-neon`, etc.) at
startup, so a single edit to `CONFIG.colors` restyles both the UI and the
3D lighting.

To swap in a different `.glb`:
1. Base64-encode it: `base64 -w0 your-model.glb > b64.txt` (macOS: drop `-w0`).
2. Replace the string inside `js/model-data.js` with that output, keeping the
   `const CPLS_MODEL_B64 = "...";` wrapper.

## Known limitations (trade-offs of avoiding three.js)

This renderer intentionally covers a practical subset of glTF 2.0, enough
for a decorative background model like this one, but not the full spec:

- Base color + emissive textures are supported; normal maps and
  metallic-roughness textures are read from the file but not sampled (the
  model still shades correctly, just without micro bump detail).
- No skinning/skeletal animation, no morph targets, no glTF `animations`
  playback (the model is shown in its default/bind pose).
- No HDR bloom post-processing — the neon glow comes from emissive color +
  a fresnel rim-light term plus CSS `drop-shadow` glow on the HUD, which is
  much cheaper than a real bloom pass and needs no extra library.
- If parsing or WebGL initialization fails for any reason (e.g. a browser
  with WebGL disabled), the screen automatically falls back to a pure-CSS
  animated ring/orb so the loading screen still looks intentional and never
  shows a blank hole.

If you outgrow these limits later, the natural next step is dropping in the
real three.js/GLTFLoader (they're MIT-licensed npm packages, still 100%
local once installed) — this vanilla version exists for when you specifically
want zero runtime dependencies.
