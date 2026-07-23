/**
 * ============================================================================
 *  Cyberpunk Loading Screen — app.js
 * ----------------------------------------------------------------------------
 *  ZERO external libraries and ZERO imported 3D model files. No three.js, no
 *  React, no Tailwind, no Framer Motion, no CDN, no .glb to go stale or look
 *  distorted. The globe, its "continents" grid texture, the cloud layer and
 *  the starfield are all generated procedurally at load time with:
 *    - plain DOM/CSS for the UI (progress bar, ticker, glow/glitch effects)
 *    - the browser's native WebGL API (raw gl.* calls, hand-written shaders)
 *    - the browser's native Canvas2D API to paint the globe's textures
 *
 *  Everything customizable lives in CONFIG below.
 * ==========================================================================*/

'use strict';

/* ============================================================================
 * 1. CONFIG — the single place to customize this component.
 * ==========================================================================*/
const CONFIG = {
  durationMs: 7000,
  telemetryStepMs: 1100,
  messageIntervalMs: 3600,

  title: 'MEDIA VAULT',
  subtitle: 'SECURE ARCHIVE // NEURAL LINK',

  colors: {
    bgBase: '#05070a',
    bgVignette: '#000000',
    primaryNeon: '#28f6ff',
    secondaryGlow: '#ff2bd6',
    tertiaryAccent: '#ffb020',
    textPrimary: '#eafdff',
    textDim: '#6f95a3',
    hudBorder: 'rgba(40, 246, 255, 0.35)',
    barTrack: 'rgba(255, 255, 255, 0.06)',
  },

  telemetrySteps: [
    'SYSTEM INITIALIZING...',
    'ESTABLISHING SECURE UPLINK...',
    'DECRYPTING MEDIA INDEX...',
    'HYDRATING MEDIA BUFFER...',
    'CALIBRATING RENDER NODES...',
    'SYNCHRONIZING ARCHIVE SHARDS...',
    'FINALIZING NEURAL HANDSHAKE...',
  ],

  messages: [
    'اللهم صلِّ وسلم على سيدنا محمد وآل محمد',
    'لا تنسَ الدعاء لإخوتنا المستضعفين في فلسطين والسودان',
    'اللهم أنصر المستضعفين من الإيغور وكافة المظلومين في الأرض',
    'رحم الله شهداء العراق الأبرار من الحشد الشعبي والقوات الأمنية والمدنيين',
    'السلام على الحسين وعلى علي بن الحسين وعلى أولاد الحسين وعلى أصحاب الحسين.. اذكروا عطش الحسين',
    'دعوة من القلب لأهلنا الصابرين في غزة والخرطوم وكل بقاع الأمة',
  ],

  scene: {
    globeRadius: 1.55,
    autoRotateSpeed: 0.14,
    cloudRotateSpeed: 0.05,
    floatAmplitude: 0.16,
    floatSpeed: 0.6,
    cameraZ: 4.2,
    emissiveBoost: 1.15,
    textureSeed: 1337,
    starCount: 2200,
    starFieldRadius: 34,
  },

  onComplete: null,
};

/* ============================================================================
 * 2. Tiny mat4/vec3 math (hand-written, column-major, WebGL convention).
 * ==========================================================================*/
const Mat4 = {
  identity() {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  },
  multiply(a, b) {
    const out = new Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += a[k * 4 + j] * b[i * 4 + k];
        out[i * 4 + j] = sum;
      }
    }
    return out;
  },
  translate(x, y, z) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  },
  rotateY(rad) {
    const c = Math.cos(rad), s = Math.sin(rad);
    return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  },
  perspective(fovyRad, aspect, near, far) {
    const f = 1 / Math.tan(fovyRad / 2);
    const nf = 1 / (near - far);
    return [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, 2 * far * near * nf, 0,
    ];
  },
  lookAt(eye, target, up) {
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    const norm = (v) => {
      const l = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / l, v[1] / l, v[2] / l];
    };
    const cross = (a, b) => [
      a[1] * b[2] - a[2] * b[1],
      a[2] * b[0] - a[0] * b[2],
      a[0] * b[1] - a[1] * b[0],
    ];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const zAxis = norm(sub(eye, target));
    const xAxis = norm(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);
    return [
      xAxis[0], yAxis[0], zAxis[0], 0,
      xAxis[1], yAxis[1], zAxis[1], 0,
      xAxis[2], yAxis[2], zAxis[2], 0,
      -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
    ];
  },
};

/** Deterministic PRNG so the procedural globe looks the same (tested-good)
 *  every load — no seams, no random ugliness. */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================================================
 * 3. Procedural sphere geometry (a clean, perfectly round UV sphere — no
 *    imported mesh, so there is no chance of a distorted/broken model).
 * ==========================================================================*/
function generateSphereGeometry(radius, latBands, lonBands) {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  for (let lat = 0; lat <= latBands; lat++) {
    const theta = (lat * Math.PI) / latBands;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    for (let lon = 0; lon <= lonBands; lon++) {
      const phi = (lon * 2 * Math.PI) / lonBands;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      normals.push(x, y, z);
      positions.push(radius * x, radius * y, radius * z);
      uvs.push(1 - lon / lonBands, lat / latBands);
    }
  }

  for (let lat = 0; lat < latBands; lat++) {
    for (let lon = 0; lon < lonBands; lon++) {
      const first = lat * (lonBands + 1) + lon;
      const second = first + lonBands + 1;
      indices.push(first, second, first + 1);
      indices.push(second, second + 1, first + 1);
    }
  }

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

/* ============================================================================
 * 4. Procedural textures for the globe — painted with Canvas2D.
 *    Equirectangular (2:1) so they map cleanly onto the UV sphere above.
 * ==========================================================================*/
function paintContinentMask(ctx, W, H, rand) {
  ctx.fillStyle = '#ffffff';
  const numContinents = 7 + Math.floor(rand() * 3);
  for (let c = 0; c < numContinents; c++) {
    let x = rand() * W;
    let y = H * 0.15 + rand() * H * 0.7;
    const blobs = 26 + Math.floor(rand() * 30);
    for (let b = 0; b < blobs; b++) {
      const r = 10 + rand() * 26;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (x - r < 0) {
        ctx.beginPath();
        ctx.arc(x + W, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (x + r > W) {
        ctx.beginPath();
        ctx.arc(x - W, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      x += (rand() - 0.5) * 34;
      y += (rand() - 0.5) * 22;
      y = Math.max(H * 0.08, Math.min(H * 0.92, y));
    }
  }
}

function drawGrid(ctx, W, H, strokeStyle, shadowColor, shadowBlur) {
  ctx.save();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1;
  ctx.shadowColor = shadowColor;
  ctx.shadowBlur = shadowBlur;
  for (let lon = 0; lon <= W; lon += W / 24) {
    ctx.beginPath();
    ctx.moveTo(lon, 0);
    ctx.lineTo(lon, H);
    ctx.stroke();
  }
  for (let lat = 0; lat <= H; lat += H / 12) {
    ctx.beginPath();
    ctx.moveTo(0, lat);
    ctx.lineTo(W, lat);
    ctx.stroke();
  }
  ctx.restore();
}

function generateGlobeTextures(seed) {
  const W = 1024, H = 512;
  const rand = mulberry32(seed);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = W; maskCanvas.height = H;
  const mctx = maskCanvas.getContext('2d');
  paintContinentMask(mctx, W, H, rand);
  const maskData = mctx.getImageData(0, 0, W, H).data;

  const landCanvas = document.createElement('canvas');
  landCanvas.width = W; landCanvas.height = H;
  const lctx = landCanvas.getContext('2d');
  const landGrad = lctx.createLinearGradient(0, 0, 0, H);
  landGrad.addColorStop(0, '#0d2b33');
  landGrad.addColorStop(0.5, '#123842');
  landGrad.addColorStop(1, '#0d2b33');
  lctx.fillStyle = landGrad;
  lctx.fillRect(0, 0, W, H);
  lctx.globalCompositeOperation = 'destination-in';
  lctx.drawImage(maskCanvas, 0, 0);

  const baseCanvas = document.createElement('canvas');
  baseCanvas.width = W; baseCanvas.height = H;
  const bctx = baseCanvas.getContext('2d');
  const oceanGrad = bctx.createLinearGradient(0, 0, 0, H);
  oceanGrad.addColorStop(0, '#020a10');
  oceanGrad.addColorStop(0.5, '#04141c');
  oceanGrad.addColorStop(1, '#020a10');
  bctx.fillStyle = oceanGrad;
  bctx.fillRect(0, 0, W, H);
  bctx.drawImage(landCanvas, 0, 0);
  bctx.save();
  bctx.globalAlpha = 0.25;
  bctx.globalCompositeOperation = 'lighten';
  bctx.drawImage(landCanvas, 0, 0);
  bctx.restore();
  drawGrid(bctx, W, H, 'rgba(40,246,255,0.28)', 'rgba(40,246,255,0.5)', 2);

  const emissiveCanvas = document.createElement('canvas');
  emissiveCanvas.width = W; emissiveCanvas.height = H;
  const ectx = emissiveCanvas.getContext('2d');
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, W, H);
  drawGrid(ectx, W, H, 'rgba(40,246,255,0.85)', '#28f6ff', 4);

  const numLights = 260;
  let placed = 0, attempts = 0;
  while (placed < numLights && attempts < numLights * 25) {
    attempts++;
    const px = Math.floor(rand() * W);
    const py = Math.floor(rand() * H);
    const idx = (py * W + px) * 4;
    if (maskData[idx + 3] > 120) {
      const cyan = rand() < 0.72;
      const rgb = cyan ? '40,246,255' : '255,43,214';
      const r = 0.6 + rand() * 1.2;
      ectx.beginPath();
      ectx.fillStyle = `rgba(${rgb},${0.85 + rand() * 0.15})`;
      ectx.shadowColor = `rgba(${rgb},1)`;
      ectx.shadowBlur = 3;
      ectx.arc(px, py, r, 0, Math.PI * 2);
      ectx.fill();
      placed++;
    }
  }

  return { baseCanvas, emissiveCanvas };
}

function generateCloudTexture(seed) {
  const W = 1024, H = 512;
  const rand = mulberry32(seed);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(230,250,255,1)';

  const clusters = 11;
  for (let c = 0; c < clusters; c++) {
    let x = rand() * W;
    let y = H * 0.12 + rand() * H * 0.76;
    const blobs = 18 + Math.floor(rand() * 20);
    for (let b = 0; b < blobs; b++) {
      const r = 14 + rand() * 30;
      ctx.save();
      ctx.globalAlpha = 0.05 + rand() * 0.11;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (x - r < 0) {
        ctx.beginPath();
        ctx.arc(x + W, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (x + r > W) {
        ctx.beginPath();
        ctx.arc(x - W, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      x += (rand() - 0.5) * 40;
      y += (rand() - 0.5) * 20;
    }
  }
  return canvas;
}

function createTextureFromCanvas(gl, canvas) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

/* ============================================================================
 * 5. Starfield generation — points scattered uniformly on a large sphere.
 * ==========================================================================*/
function generateStarField(count, radius, rand) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const u = rand();
    const v = rand();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = radius * (0.55 + rand() * 0.45);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    sizes[i] = 1 + rand() * 2.4;
    phases[i] = rand() * Math.PI * 2;
  }
  return { positions, sizes, phases };
}

/* ============================================================================
 * 6. Shaders.
 * ==========================================================================*/
const GLOBE_VS = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aUv;

  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform vec3 uCameraPos;

  varying vec3 vNormalW;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPos = worldPos.xyz;
    vNormalW = mat3(uModel) * aNormal;
    vUv = aUv;
    vViewDir = uCameraPos - worldPos.xyz;
    gl_Position = uProjection * uView * worldPos;
  }
`;

const GLOBE_FS = `
  precision mediump float;

  varying vec3 vNormalW;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  uniform sampler2D uBaseColorTex;
  uniform vec4 uBaseColorFactor;
  uniform sampler2D uEmissiveTex;
  uniform bool uHasEmissiveTex;
  uniform float uEmissiveStrength;

  uniform vec3 uLight1Pos; uniform vec3 uLight1Color;
  uniform vec3 uLight2Pos; uniform vec3 uLight2Color;
  uniform vec3 uAmbient;

  void main() {
    vec3 N = normalize(vNormalW);
    vec4 base = uBaseColorFactor * texture2D(uBaseColorTex, vUv);

    vec3 emissive = vec3(0.0);
    if (uHasEmissiveTex) emissive = texture2D(uEmissiveTex, vUv).rgb * uEmissiveStrength;

    vec3 L1 = normalize(uLight1Pos - vWorldPos);
    vec3 L2 = normalize(uLight2Pos - vWorldPos);
    float d1 = max(dot(N, L1), 0.0);
    float d2 = max(dot(N, L2), 0.0);

    vec3 V = normalize(vViewDir);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    vec3 rim = fresnel * (uLight1Color + uLight2Color) * 0.5;

    vec3 lit = uAmbient * base.rgb + d1 * uLight1Color * base.rgb + d2 * uLight2Color * base.rgb;
    gl_FragColor = vec4(lit + emissive + rim, base.a);
  }
`;

const ATMOSPHERE_VS = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    vWorldPos = worldPos.xyz;
    vNormalW = mat3(uModel) * aNormal;
    gl_Position = uProjection * uView * worldPos;
  }
`;

const ATMOSPHERE_FS = `
  precision mediump float;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  uniform vec3 uCameraPos;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(uCameraPos - vWorldPos);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 3.0);
    vec3 color = mix(uColorA, uColorB, fres);
    gl_FragColor = vec4(color, fres * 0.85);
  }
`;

const STAR_VS = `
  attribute vec3 aPosition;
  attribute float aSize;
  attribute float aPhase;
  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform float uTime;
  varying float vTwinkle;
  void main() {
    vec4 worldPos = uModel * vec4(aPosition, 1.0);
    gl_Position = uProjection * uView * worldPos;
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.6 + aPhase);
    gl_PointSize = aSize * vTwinkle;
  }
`;

const STAR_FS = `
  precision mediump float;
  varying float vTwinkle;
  uniform vec3 uStarColor;
  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float dist = length(d);
    float alpha = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(uStarColor, alpha * vTwinkle);
  }
`;

function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compile error: ' + info);
  }
  return shader;
}

function createProgram(gl, vsSrc, fsSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
  }
  return program;
}

function getUniforms(gl, program, names) {
  const out = {};
  names.forEach((n) => { out[n] = gl.getUniformLocation(program, n); });
  return out;
}

function makeMeshBuffers(gl, geom) {
  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);

  const normBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
  gl.bufferData(gl.ARRAY_BUFFER, geom.normals, gl.STATIC_DRAW);

  let uvBuf = null;
  if (geom.uvs) {
    uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.uvs, gl.STATIC_DRAW);
  }

  const idxBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geom.indices, gl.STATIC_DRAW);

  return { posBuf, normBuf, uvBuf, idxBuf, count: geom.indices.length };
}

/* ============================================================================
 * 7. Scene bootstrap: build GPU resources for the globe/clouds/atmosphere/
 *    stars, then return a render(t, animRoot, camera) function.
 * ==========================================================================*/
function initProceduralScene(canvas, sceneConfig) {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) throw new Error('WebGL is not available in this browser');

  const rand = mulberry32(sceneConfig.textureSeed);
  const R = sceneConfig.globeRadius;

  const globeGeom = generateSphereGeometry(R, 48, 96);
  const cloudGeom = generateSphereGeometry(R * 1.02, 40, 80);
  const atmoGeom = generateSphereGeometry(R * 1.09, 32, 64);

  const globeBuf = makeMeshBuffers(gl, globeGeom);
  const cloudBuf = makeMeshBuffers(gl, cloudGeom);
  const atmoBuf = makeMeshBuffers(gl, atmoGeom);

  const { baseCanvas, emissiveCanvas } = generateGlobeTextures(sceneConfig.textureSeed);
  const cloudCanvas = generateCloudTexture(sceneConfig.textureSeed + 777);
  const baseTex = createTextureFromCanvas(gl, baseCanvas);
  const emissiveTex = createTextureFromCanvas(gl, emissiveCanvas);
  const cloudTex = createTextureFromCanvas(gl, cloudCanvas);

  const stars = generateStarField(sceneConfig.starCount, sceneConfig.starFieldRadius, rand);
  const starPosBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuf);
  gl.bufferData(gl.ARRAY_BUFFER, stars.positions, gl.STATIC_DRAW);
  const starSizeBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starSizeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, stars.sizes, gl.STATIC_DRAW);
  const starPhaseBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, starPhaseBuf);
  gl.bufferData(gl.ARRAY_BUFFER, stars.phases, gl.STATIC_DRAW);

  const globeProgram = createProgram(gl, GLOBE_VS, GLOBE_FS);
  const globeAttribs = {
    aPosition: gl.getAttribLocation(globeProgram, 'aPosition'),
    aNormal: gl.getAttribLocation(globeProgram, 'aNormal'),
    aUv: gl.getAttribLocation(globeProgram, 'aUv'),
  };
  const globeUniforms = getUniforms(gl, globeProgram, [
    'uModel', 'uView', 'uProjection', 'uCameraPos', 'uBaseColorTex', 'uBaseColorFactor',
    'uEmissiveTex', 'uHasEmissiveTex', 'uEmissiveStrength',
    'uLight1Pos', 'uLight1Color', 'uLight2Pos', 'uLight2Color', 'uAmbient',
  ]);

  const atmoProgram = createProgram(gl, ATMOSPHERE_VS, ATMOSPHERE_FS);
  const atmoAttribs = {
    aPosition: gl.getAttribLocation(atmoProgram, 'aPosition'),
    aNormal: gl.getAttribLocation(atmoProgram, 'aNormal'),
  };
  const atmoUniforms = getUniforms(gl, atmoProgram, [
    'uModel', 'uView', 'uProjection', 'uCameraPos', 'uColorA', 'uColorB',
  ]);

  const starProgram = createProgram(gl, STAR_VS, STAR_FS);
  const starAttribs = {
    aPosition: gl.getAttribLocation(starProgram, 'aPosition'),
    aSize: gl.getAttribLocation(starProgram, 'aSize'),
    aPhase: gl.getAttribLocation(starProgram, 'aPhase'),
  };
  const starUniforms = getUniforms(gl, starProgram, [
    'uModel', 'uView', 'uProjection', 'uTime', 'uStarColor',
  ]);

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);

  const colors = sceneConfig.colorsRGB;

  function render(t, animRoot, camera) {
    const aspect = canvas.width / canvas.height;
    const projection = Mat4.perspective((45 * Math.PI) / 180, aspect, 0.1, 100);
    const view = Mat4.lookAt(camera.eye, [0, 0, 0], [0, 1, 0]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ---- Stars ----------------------------------------------------------
    gl.useProgram(starProgram);
    const starRoot = Mat4.rotateY(t * 0.01);
    gl.uniformMatrix4fv(starUniforms.uModel, false, starRoot);
    gl.uniformMatrix4fv(starUniforms.uView, false, view);
    gl.uniformMatrix4fv(starUniforms.uProjection, false, projection);
    gl.uniform1f(starUniforms.uTime, t);
    gl.uniform3fv(starUniforms.uStarColor, [0.85, 0.95, 1.0]);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);

    gl.bindBuffer(gl.ARRAY_BUFFER, starPosBuf);
    gl.enableVertexAttribArray(starAttribs.aPosition);
    gl.vertexAttribPointer(starAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, starSizeBuf);
    gl.enableVertexAttribArray(starAttribs.aSize);
    gl.vertexAttribPointer(starAttribs.aSize, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, starPhaseBuf);
    gl.enableVertexAttribArray(starAttribs.aPhase);
    gl.vertexAttribPointer(starAttribs.aPhase, 1, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.POINTS, 0, sceneConfig.starCount);

    gl.disableVertexAttribArray(starAttribs.aSize);
    gl.disableVertexAttribArray(starAttribs.aPhase);

    // ---- Globe (opaque) ---------------------------------------------------
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.useProgram(globeProgram);
    gl.uniformMatrix4fv(globeUniforms.uProjection, false, projection);
    gl.uniformMatrix4fv(globeUniforms.uView, false, view);
    gl.uniformMatrix4fv(globeUniforms.uModel, false, animRoot);
    gl.uniform3fv(globeUniforms.uCameraPos, camera.eye);
    gl.uniform3fv(globeUniforms.uAmbient, [0.14, 0.17, 0.2]);
    gl.uniform3fv(globeUniforms.uLight1Pos, [3 + Math.sin(t * 0.4) * 0.6, 2, 3]);
    gl.uniform3fv(globeUniforms.uLight1Color, colors.primary);
    gl.uniform3fv(globeUniforms.uLight2Pos, [-3, -1.5 + Math.cos(t * 0.3) * 0.6, -2]);
    gl.uniform3fv(globeUniforms.uLight2Color, colors.secondary);
    gl.uniform4fv(globeUniforms.uBaseColorFactor, [1, 1, 1, 1]);
    gl.uniform1f(globeUniforms.uEmissiveStrength, sceneConfig.emissiveBoost);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, baseTex);
    gl.uniform1i(globeUniforms.uBaseColorTex, 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, emissiveTex);
    gl.uniform1i(globeUniforms.uEmissiveTex, 1);
    gl.uniform1i(globeUniforms.uHasEmissiveTex, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, globeBuf.posBuf);
    gl.enableVertexAttribArray(globeAttribs.aPosition);
    gl.vertexAttribPointer(globeAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, globeBuf.normBuf);
    gl.enableVertexAttribArray(globeAttribs.aNormal);
    gl.vertexAttribPointer(globeAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, globeBuf.uvBuf);
    gl.enableVertexAttribArray(globeAttribs.aUv);
    gl.vertexAttribPointer(globeAttribs.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, globeBuf.idxBuf);
    gl.drawElements(gl.TRIANGLES, globeBuf.count, gl.UNSIGNED_SHORT, 0);

    // ---- Atmosphere rim glow ------------------------------------------------
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.depthMask(false);
    gl.useProgram(atmoProgram);
    gl.uniformMatrix4fv(atmoUniforms.uProjection, false, projection);
    gl.uniformMatrix4fv(atmoUniforms.uView, false, view);
    gl.uniformMatrix4fv(atmoUniforms.uModel, false, animRoot);
    gl.uniform3fv(atmoUniforms.uCameraPos, camera.eye);
    gl.uniform3fv(atmoUniforms.uColorA, colors.secondary);
    gl.uniform3fv(atmoUniforms.uColorB, colors.primary);

    gl.bindBuffer(gl.ARRAY_BUFFER, atmoBuf.posBuf);
    gl.enableVertexAttribArray(atmoAttribs.aPosition);
    gl.vertexAttribPointer(atmoAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, atmoBuf.normBuf);
    gl.enableVertexAttribArray(atmoAttribs.aNormal);
    gl.vertexAttribPointer(atmoAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, atmoBuf.idxBuf);
    gl.drawElements(gl.TRIANGLES, atmoBuf.count, gl.UNSIGNED_SHORT, 0);

    // ---- Clouds (alpha blend, drawn last) ------------------------------------
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.useProgram(globeProgram);
    const cloudModel = Mat4.multiply(animRoot, Mat4.rotateY(t * sceneConfig.cloudRotateSpeed));
    gl.uniformMatrix4fv(globeUniforms.uModel, false, cloudModel);
    gl.uniform4fv(globeUniforms.uBaseColorFactor, [1, 1, 1, 0.5]);
    gl.uniform1i(globeUniforms.uHasEmissiveTex, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, cloudTex);
    gl.uniform1i(globeUniforms.uBaseColorTex, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuf.posBuf);
    gl.enableVertexAttribArray(globeAttribs.aPosition);
    gl.vertexAttribPointer(globeAttribs.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuf.normBuf);
    gl.enableVertexAttribArray(globeAttribs.aNormal);
    gl.vertexAttribPointer(globeAttribs.aNormal, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cloudBuf.uvBuf);
    gl.enableVertexAttribArray(globeAttribs.aUv);
    gl.vertexAttribPointer(globeAttribs.aUv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cloudBuf.idxBuf);
    gl.drawElements(gl.TRIANGLES, cloudBuf.count, gl.UNSIGNED_SHORT, 0);

    gl.depthMask(true);
    gl.disable(gl.BLEND);
  }

  return { render };
}

function hexToRgbArray(hex) {
  const m = hex.replace('#', '');
  const bigint = parseInt(m, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

/* ============================================================================
 * 8. UI wiring: progress bar, telemetry, message ticker, resize, boot.
 * ==========================================================================*/
function applyThemeCSSVars(colors) {
  const root = document.documentElement;
  root.style.setProperty('--bg-base', colors.bgBase);
  root.style.setProperty('--bg-vignette', colors.bgVignette);
  root.style.setProperty('--primary-neon', colors.primaryNeon);
  root.style.setProperty('--secondary-glow', colors.secondaryGlow);
  root.style.setProperty('--tertiary-accent', colors.tertiaryAccent);
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-dim', colors.textDim);
  root.style.setProperty('--hud-border', colors.hudBorder);
  root.style.setProperty('--bar-track', colors.barTrack);
}

function buildSegments(track, count) {
  const frag = document.createDocumentFragment();
  const segments = [];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'cpls-segment';
    frag.appendChild(el);
    segments.push(el);
  }
  track.appendChild(frag);
  return segments;
}

function shuffle(arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function setupMessageTicker(el, messages, intervalMs) {
  if (!messages.length) return;
  const order = shuffle(messages);
  let index = 0;

  function show(i) {
    el.classList.remove('visible');
    window.setTimeout(() => {
      el.textContent = order[i];
      void el.offsetWidth;
      el.classList.add('visible');
    }, 250);
  }

  show(index);
  if (order.length > 1) {
    window.setInterval(() => {
      index = (index + 1) % order.length;
      show(index);
    }, intervalMs);
  }
}

function setupProgress(cfg) {
  const track = document.getElementById('cpls-bar-track');
  const segments = buildSegments(track, 40);
  const percentEl = document.getElementById('cpls-percent-value');
  const telemetryEl = document.getElementById('cpls-telemetry-text');
  const elapsedEl = document.getElementById('cpls-elapsed');
  const bufferEl = document.getElementById('cpls-buffer-stat');
  const nodesEl = document.getElementById('cpls-nodes-stat');

  let telemetryIdx = 0;
  telemetryEl.textContent = cfg.telemetrySteps[0];
  window.setInterval(() => {
    telemetryIdx = (telemetryIdx + 1) % cfg.telemetrySteps.length;
    telemetryEl.textContent = telemetryEl.textContent === 'ARCHIVE READY.'
      ? telemetryEl.textContent
      : cfg.telemetrySteps[telemetryIdx];
  }, cfg.telemetryStepMs);

  const start = performance.now();
  let lastFilled = -1;

  function tick(now) {
    const elapsed = now - start;
    const pct = Math.min(100, (elapsed / cfg.durationMs) * 100);

    const filled = Math.round((pct / 100) * segments.length);
    if (filled !== lastFilled) {
      for (let i = 0; i < segments.length; i++) {
        segments[i].classList.toggle('filled', i < filled);
      }
      lastFilled = filled;
    }

    percentEl.textContent = Math.floor(pct);
    elapsedEl.textContent = 'T+' + (elapsed / 1000).toFixed(1) + 's';
    bufferEl.textContent = 'BUFFER: ' + Math.floor(pct) + '%';
    nodesEl.textContent = 'NODES: ' + (3 + Math.floor(pct / 25)) + '/7 ONLINE';

    if (pct < 100) {
      requestAnimationFrame(tick);
    } else {
      telemetryEl.textContent = 'ARCHIVE READY.';
      if (typeof cfg.onComplete === 'function') cfg.onComplete();
    }
  }
  requestAnimationFrame(tick);
}

function boot() {
  applyThemeCSSVars(CONFIG.colors);

  document.getElementById('cpls-title').textContent = CONFIG.title;
  document.getElementById('cpls-title').setAttribute('data-text', CONFIG.title);
  document.getElementById('cpls-subtitle').textContent = CONFIG.subtitle;

  const logo = document.getElementById('cpls-logo');
  logo.addEventListener('error', () => { logo.style.display = 'none'; });

  setupMessageTicker(document.getElementById('cpls-message'), CONFIG.messages, CONFIG.messageIntervalMs);
  setupProgress(CONFIG);

  const canvas = document.getElementById('cpls-canvas');
  const fallback = document.getElementById('cpls-fallback-orb');

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.floor(canvas.clientHeight * dpr));
  }

  try {
    const sceneConfig = Object.assign({}, CONFIG.scene, {
      colorsRGB: {
        primary: hexToRgbArray(CONFIG.colors.primaryNeon),
        secondary: hexToRgbArray(CONFIG.colors.secondaryGlow),
      },
    });

    resizeCanvas();
    const scene = initProceduralScene(canvas, sceneConfig);

    window.addEventListener('resize', resizeCanvas);
    if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(canvas);

    const clockStart = performance.now();
    function frame(now) {
      const t = (now - clockStart) / 1000;
      const animRoot = Mat4.multiply(
        Mat4.translate(0, Math.sin(t * CONFIG.scene.floatSpeed) * CONFIG.scene.floatAmplitude, 0),
        Mat4.rotateY(t * CONFIG.scene.autoRotateSpeed)
      );
      const eye = [0, 0, CONFIG.scene.cameraZ];
      scene.render(t, animRoot, { eye });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  } catch (err) {
    console.warn('[CyberpunkLoadingScreen] 3D layer disabled, using CSS fallback:', err);
    canvas.style.display = 'none';
    fallback.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', boot);
