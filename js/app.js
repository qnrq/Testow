/**
 * ============================================================================
 *  Cyberpunk Loading Screen — app.js
 * ----------------------------------------------------------------------------
 *  ZERO external libraries. No three.js, no React, no Tailwind, no Framer
 *  Motion, no CDN, no build step. Everything here is either:
 *    - plain DOM/CSS (UI, progress bar, message ticker, glow/glitch effects)
 *    - the browser's native WebGL API (raw gl.* calls, hand-written shaders)
 *    - a small hand-written glTF/GLB binary parser (reads the .glb format
 *      directly per the official spec, no GLTFLoader)
 *
 *  The 3D model ships pre-encoded as base64 in js/model-data.js (loaded via
 *  a classic <script> tag, so it works from a plain double-clicked file —
 *  no local server, no fetch(), no CORS issues).
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
    autoRotateSpeed: 0.12, // rad/sec
    floatAmplitude: 0.18,
    floatSpeed: 0.6,
    cameraZ: 4.2,
    targetSize: 2.4, // normalized model size (world units)
    emissiveBoost: 2.2, // manual multiplier standing in for KHR_materials_emissive_strength
  },

  onComplete: null, // optional callback, e.g. () => document.getElementById('cpls-root').remove()
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
  fromTRS(t, r, s) {
    const [x, y, z, w] = r;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    const sx = s[0], sy = s[1], sz = s[2];
    return [
      (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
      (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
      (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
      t[0], t[1], t[2], 1,
    ];
  },
  translate(x, y, z) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  },
  scaleUniform(s) {
    return [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
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
  transformPoint(m, p) {
    const [x, y, z] = p;
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14],
    ];
  },
};

/* ============================================================================
 * 3. Hand-written GLB (binary glTF 2.0) parser.
 *    Spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#glb-file-format
 *    (No network access needed to read this spec here — this is a direct,
 *    from-scratch implementation of the documented binary layout.)
 * ==========================================================================*/
function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function parseGLB(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = dv.getUint32(0, true);
  if (magic !== 0x46546c67) throw new Error('Not a valid GLB file (bad magic)');
  const version = dv.getUint32(4, true);
  const totalLength = dv.getUint32(8, true);

  let offset = 12;
  let json = null;
  let bin = null;

  while (offset < totalLength) {
    const chunkLength = dv.getUint32(offset, true);
    const chunkType = dv.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    if (chunkType === 0x4e4f534a) {
      // 'JSON'
      const jsonBytes = bytes.subarray(chunkStart, chunkStart + chunkLength);
      json = JSON.parse(new TextDecoder('utf-8').decode(jsonBytes));
    } else if (chunkType === 0x004e4942) {
      // 'BIN\0'
      bin = bytes.subarray(chunkStart, chunkStart + chunkLength);
    }
    offset = chunkStart + chunkLength;
  }
  if (!json) throw new Error('GLB file has no JSON chunk');
  return { json, bin, version };
}

const COMPONENT_BYTES = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const TYPE_NUM_COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

function componentGetter(dv, componentType) {
  switch (componentType) {
    case 5120: return (o) => dv.getInt8(o);
    case 5121: return (o) => dv.getUint8(o);
    case 5122: return (o) => dv.getInt16(o, true);
    case 5123: return (o) => dv.getUint16(o, true);
    case 5125: return (o) => dv.getUint32(o, true);
    case 5126: return (o) => dv.getFloat32(o, true);
    default: throw new Error('Unsupported componentType ' + componentType);
  }
}

/** Reads any glTF accessor into a flat Float32Array (attributes) regardless
 *  of interleaving/stride — a small, general-purpose accessor reader. */
function readAccessor(json, bin, accessorIndex) {
  const accessor = json.accessors[accessorIndex];
  const numComponents = TYPE_NUM_COMPONENTS[accessor.type];
  const count = accessor.count;
  const out = new Float32Array(count * numComponents);
  if (accessor.bufferView === undefined) return out; // sparse accessors not supported; returns zeros

  const bufferView = json.bufferViews[accessor.bufferView];
  const componentBytes = COMPONENT_BYTES[accessor.componentType];
  const elementBytes = numComponents * componentBytes;
  const stride = bufferView.byteStride || elementBytes;
  const baseOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);

  const dv = new DataView(bin.buffer, bin.byteOffset + baseOffset, bin.byteLength - baseOffset);
  const get = componentGetter(dv, accessor.componentType);

  for (let i = 0; i < count; i++) {
    const elOffset = i * stride;
    for (let c = 0; c < numComponents; c++) {
      out[i * numComponents + c] = get(elOffset + c * componentBytes);
    }
  }
  return out;
}

function readIndices(json, bin, accessorIndex) {
  const floatVals = readAccessor(json, bin, accessorIndex);
  const out = new Uint32Array(floatVals.length);
  for (let i = 0; i < floatVals.length; i++) out[i] = Math.round(floatVals[i]);
  return out;
}

/** Walks the default scene's node hierarchy, computing each node's world
 *  matrix (no animation/skinning support — first/default pose only). */
function buildBaseWorldMatrices(json) {
  const baseWorld = new Array(json.nodes.length).fill(null);
  function visit(nodeIndex, parentMatrix) {
    const node = json.nodes[nodeIndex];
    let local;
    if (node.matrix) {
      local = node.matrix;
    } else {
      const t = node.translation || [0, 0, 0];
      const r = node.rotation || [0, 0, 0, 1];
      const s = node.scale || [1, 1, 1];
      local = Mat4.fromTRS(t, r, s);
    }
    const world = Mat4.multiply(parentMatrix, local);
    baseWorld[nodeIndex] = world;
    (node.children || []).forEach((ci) => visit(ci, world));
  }
  const sceneDef = json.scenes[json.scene || 0];
  (sceneDef.nodes || []).forEach((rootIdx) => visit(rootIdx, Mat4.identity()));
  return baseWorld;
}

function collectPrimitives(json) {
  const list = [];
  json.nodes.forEach((node, idx) => {
    if (node.mesh !== undefined) {
      const mesh = json.meshes[node.mesh];
      mesh.primitives.forEach((prim) => {
        if (prim.mode !== undefined && prim.mode !== 4) return; // TRIANGLES only
        list.push({ nodeIndex: idx, prim });
      });
    }
  });
  return list;
}

/** Computes a matrix that centers + uniformly scales the whole model to
 *  `targetSize`, using each POSITION accessor's min/max (required by spec)
 *  transformed by that primitive's node world matrix — no full vertex scan
 *  needed. */
function computeNormalizeMatrix(json, baseWorld, primitives, targetSize) {
  let minAll = [Infinity, Infinity, Infinity];
  let maxAll = [-Infinity, -Infinity, -Infinity];

  primitives.forEach(({ nodeIndex, prim }) => {
    const posAccessor = json.accessors[prim.attributes.POSITION];
    if (!posAccessor || !posAccessor.min || !posAccessor.max) return;
    const mn = posAccessor.min, mx = posAccessor.max;
    const world = baseWorld[nodeIndex];
    for (let i = 0; i < 8; i++) {
      const corner = [
        i & 1 ? mx[0] : mn[0],
        i & 2 ? mx[1] : mn[1],
        i & 4 ? mx[2] : mn[2],
      ];
      const p = Mat4.transformPoint(world, corner);
      for (let a = 0; a < 3; a++) {
        if (p[a] < minAll[a]) minAll[a] = p[a];
        if (p[a] > maxAll[a]) maxAll[a] = p[a];
      }
    }
  });

  const center = [
    (minAll[0] + maxAll[0]) / 2,
    (minAll[1] + maxAll[1]) / 2,
    (minAll[2] + maxAll[2]) / 2,
  ];
  const size = [maxAll[0] - minAll[0], maxAll[1] - minAll[1], maxAll[2] - minAll[2]];
  const maxDim = Math.max(size[0], size[1], size[2]) || 1;
  const scale = targetSize / maxDim;

  return Mat4.multiply(Mat4.scaleUniform(scale), Mat4.translate(-center[0], -center[1], -center[2]));
}

/* ============================================================================
 * 4. WebGL: shaders, texture decode (native createImageBitmap — no library),
 *    buffer setup, and the render loop.
 * ==========================================================================*/
const VERTEX_SHADER_SRC = `
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

const FRAGMENT_SHADER_SRC = `
  precision mediump float;

  varying vec3 vNormalW;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vViewDir;

  uniform sampler2D uBaseColorTex;
  uniform bool uHasBaseColorTex;
  uniform vec4 uBaseColorFactor;

  uniform sampler2D uEmissiveTex;
  uniform bool uHasEmissiveTex;
  uniform vec3 uEmissiveFactor;
  uniform float uEmissiveStrength;

  uniform vec3 uLight1Pos; uniform vec3 uLight1Color;
  uniform vec3 uLight2Pos; uniform vec3 uLight2Color;
  uniform vec3 uAmbient;

  void main() {
    vec3 N = normalize(vNormalW);

    vec4 base = uBaseColorFactor;
    if (uHasBaseColorTex) base *= texture2D(uBaseColorTex, vUv);

    vec3 emissive = uEmissiveFactor * uEmissiveStrength;
    if (uHasEmissiveTex) emissive *= texture2D(uEmissiveTex, vUv).rgb;

    vec3 L1 = normalize(uLight1Pos - vWorldPos);
    vec3 L2 = normalize(uLight2Pos - vWorldPos);
    float d1 = max(dot(N, L1), 0.0);
    float d2 = max(dot(N, L2), 0.0);

    vec3 V = normalize(vViewDir);
    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.5);
    vec3 rim = fresnel * (uLight1Color + uLight2Color) * 0.6;

    vec3 lit = uAmbient * base.rgb + d1 * uLight1Color * base.rgb + d2 * uLight2Color * base.rgb;
    vec3 color = lit + emissive + rim;

    gl_FragColor = vec4(color, base.a);
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
    const info = gl.getProgramInfoLog(program);
    throw new Error('Program link error: ' + info);
  }
  return program;
}

async function decodeImageToBitmap(blob) {
  if (window.createImageBitmap) {
    return createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function loadGLTexture(gl, json, bin, textureIndex, cache) {
  if (cache.has(textureIndex)) return cache.get(textureIndex);
  const texDef = json.textures[textureIndex];
  const imgDef = json.images[texDef.source];

  let blob;
  if (imgDef.bufferView !== undefined) {
    const bv = json.bufferViews[imgDef.bufferView];
    const bytes = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    blob = new Blob([bytes], { type: imgDef.mimeType || 'image/png' });
  } else if (imgDef.uri && imgDef.uri.indexOf('data:') === 0) {
    const res = await fetch(imgDef.uri); // data: URIs decode locally, no network call
    blob = await res.blob();
  } else {
    cache.set(textureIndex, null);
    return null; // external file URIs are out of scope for an offline bundle
  }

  const bitmap = await decodeImageToBitmap(blob);
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap);
  const isPOT = (v) => (v & (v - 1)) === 0;
  if (isPOT(bitmap.width) && isPOT(bitmap.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  cache.set(textureIndex, tex);
  return tex;
}

function createPrimitiveBuffers(gl, json, bin, prim) {
  const positions = readAccessor(json, bin, prim.attributes.POSITION);
  const normals = prim.attributes.NORMAL !== undefined ? readAccessor(json, bin, prim.attributes.NORMAL) : null;
  const uvs = prim.attributes.TEXCOORD_0 !== undefined ? readAccessor(json, bin, prim.attributes.TEXCOORD_0) : null;

  let indices = null;
  let useUint16 = false;
  if (prim.indices !== undefined) {
    indices = readIndices(json, bin, prim.indices);
  }

  const posBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  let normBuf = null;
  if (normals) {
    normBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
  }

  let uvBuf = null;
  if (uvs) {
    uvBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
  }

  let idxBuf = null, count;
  if (indices) {
    const canUseUint32 = gl.getExtension('OES_element_index_uint') || gl.constructor.name === 'WebGL2RenderingContext';
    let idxData = indices;
    if (!canUseUint32) {
      const maxIdx = indices.reduce((m, v) => Math.max(m, v), 0);
      if (maxIdx <= 65535) {
        idxData = new Uint16Array(indices);
        useUint16 = true;
      } else {
        console.warn('[CyberpunkLoadingScreen] Primitive skipped: too many vertices for 16-bit indices and no 32-bit index support.');
        return null;
      }
    }
    idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxData, gl.STATIC_DRAW);
    count = indices.length;
  } else {
    count = positions.length / 3;
  }

  return { posBuf, normBuf, uvBuf, idxBuf, count, hasIndices: !!indices, useUint16 };
}

/* ============================================================================
 * 5. Scene bootstrap: parse GLB, build GPU resources, run the render loop.
 * ==========================================================================*/
async function initScene(canvas, base64Model, sceneConfig) {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) throw new Error('WebGL is not available in this browser');

  const bytes = base64ToUint8Array(base64Model);
  const { json, bin } = parseGLB(bytes);
  if (!bin) throw new Error('GLB file has no binary chunk');

  const program = createProgram(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
  const attribs = {
    aPosition: gl.getAttribLocation(program, 'aPosition'),
    aNormal: gl.getAttribLocation(program, 'aNormal'),
    aUv: gl.getAttribLocation(program, 'aUv'),
  };
  const uniforms = {};
  ['uModel', 'uView', 'uProjection', 'uCameraPos', 'uBaseColorTex', 'uHasBaseColorTex',
    'uBaseColorFactor', 'uEmissiveTex', 'uHasEmissiveTex', 'uEmissiveFactor', 'uEmissiveStrength',
    'uLight1Pos', 'uLight1Color', 'uLight2Pos', 'uLight2Color', 'uAmbient'].forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  const baseWorld = buildBaseWorldMatrices(json);
  const primitives = collectPrimitives(json);
  const normalizeMatrix = computeNormalizeMatrix(json, baseWorld, primitives, sceneConfig.targetSize);

  const textureCache = new Map();
  const drawList = [];
  for (const { nodeIndex, prim } of primitives) {
    const buffers = createPrimitiveBuffers(gl, json, bin, prim);
    if (!buffers) continue;

    const material = prim.material !== undefined ? json.materials[prim.material] : {};
    const pbr = material.pbrMetallicRoughness || {};
    const baseColorFactor = pbr.baseColorFactor || [1, 1, 1, 1];
    const emissiveFactor = material.emissiveFactor || [0, 0, 0];
    const alphaMode = material.alphaMode || 'OPAQUE';

    let baseColorTex = null;
    if (pbr.baseColorTexture) {
      baseColorTex = await loadGLTexture(gl, json, bin, pbr.baseColorTexture.index, textureCache);
    }
    let emissiveTex = null;
    if (material.emissiveTexture) {
      emissiveTex = await loadGLTexture(gl, json, bin, material.emissiveTexture.index, textureCache);
    }
    let emissiveStrength = 1;
    if (material.extensions && material.extensions.KHR_materials_emissive_strength) {
      emissiveStrength = material.extensions.KHR_materials_emissive_strength.emissiveStrength || 1;
    }
    // Extension is ignored numerically at full HDR value (no bloom pass here);
    // scale it down to something sane for LDR display, boosted by CONFIG.
    emissiveStrength = Math.min(1.6, Math.log2(1 + emissiveStrength)) * sceneConfig.emissiveBoost * 0.35;

    const combinedBase = Mat4.multiply(normalizeMatrix, baseWorld[nodeIndex]);

    drawList.push({
      buffers,
      combinedBase,
      baseColorFactor,
      baseColorTex,
      emissiveFactor,
      emissiveTex,
      emissiveStrength,
      transparent: alphaMode === 'BLEND',
    });
  }

  drawList.sort((a, b) => (a.transparent === b.transparent ? 0 : a.transparent ? 1 : -1));

  gl.enable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE); // model is authored doubleSided

  const colors = sceneConfig.colorsRGB;

  function render(t, animRoot, camera) {
    const aspect = canvas.width / canvas.height;
    const projection = Mat4.perspective((45 * Math.PI) / 180, aspect, 0.1, 100);
    const view = Mat4.lookAt(camera.eye, [0, 0, 0], [0, 1, 0]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);
    gl.uniformMatrix4fv(uniforms.uProjection, false, projection);
    gl.uniformMatrix4fv(uniforms.uView, false, view);
    gl.uniform3fv(uniforms.uCameraPos, camera.eye);
    gl.uniform3fv(uniforms.uAmbient, [0.16, 0.19, 0.22]);
    gl.uniform3fv(uniforms.uLight1Pos, [3 + Math.sin(t * 0.4) * 0.6, 2, 3]);
    gl.uniform3fv(uniforms.uLight1Color, colors.primary);
    gl.uniform3fv(uniforms.uLight2Pos, [-3, -1.5 + Math.cos(t * 0.3) * 0.6, -2]);
    gl.uniform3fv(uniforms.uLight2Color, colors.secondary);

    let depthMaskOpen = true;
    gl.depthMask(true);
    gl.disable(gl.BLEND);

    for (const item of drawList) {
      if (item.transparent && depthMaskOpen) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        depthMaskOpen = false;
      }

      const model = Mat4.multiply(animRoot, item.combinedBase);
      gl.uniformMatrix4fv(uniforms.uModel, false, model);

      gl.uniform4fv(uniforms.uBaseColorFactor, item.baseColorFactor);
      gl.uniform3fv(uniforms.uEmissiveFactor, item.emissiveFactor);
      gl.uniform1f(uniforms.uEmissiveStrength, item.emissiveStrength);

      if (item.baseColorTex) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, item.baseColorTex);
        gl.uniform1i(uniforms.uBaseColorTex, 0);
        gl.uniform1i(uniforms.uHasBaseColorTex, 1);
      } else {
        gl.uniform1i(uniforms.uHasBaseColorTex, 0);
      }
      if (item.emissiveTex) {
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, item.emissiveTex);
        gl.uniform1i(uniforms.uEmissiveTex, 1);
        gl.uniform1i(uniforms.uHasEmissiveTex, 1);
      } else {
        gl.uniform1i(uniforms.uHasEmissiveTex, 0);
      }

      const b = item.buffers;
      gl.bindBuffer(gl.ARRAY_BUFFER, b.posBuf);
      gl.enableVertexAttribArray(attribs.aPosition);
      gl.vertexAttribPointer(attribs.aPosition, 3, gl.FLOAT, false, 0, 0);

      if (b.normBuf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.normBuf);
        gl.enableVertexAttribArray(attribs.aNormal);
        gl.vertexAttribPointer(attribs.aNormal, 3, gl.FLOAT, false, 0, 0);
      } else {
        gl.disableVertexAttribArray(attribs.aNormal);
        gl.vertexAttrib3f(attribs.aNormal, 0, 0, 1);
      }

      if (b.uvBuf) {
        gl.bindBuffer(gl.ARRAY_BUFFER, b.uvBuf);
        gl.enableVertexAttribArray(attribs.aUv);
        gl.vertexAttribPointer(attribs.aUv, 2, gl.FLOAT, false, 0, 0);
      } else {
        gl.disableVertexAttribArray(attribs.aUv);
        gl.vertexAttrib2f(attribs.aUv, 0, 0);
      }

      if (b.hasIndices) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.idxBuf);
        gl.drawElements(gl.TRIANGLES, b.count, b.useUint16 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT, 0);
      } else {
        gl.drawArrays(gl.TRIANGLES, 0, b.count);
      }
    }
  }

  return { render };
}

function hexToRgbArray(hex) {
  const m = hex.replace('#', '');
  const bigint = parseInt(m, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255];
}

/* ============================================================================
 * 6. UI wiring: progress bar, telemetry, message ticker, resize, boot.
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
      // force reflow so the transition re-triggers
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

async function boot() {
  applyThemeCSSVars(CONFIG.colors);

  document.getElementById('cpls-title').textContent = CONFIG.title;
  document.getElementById('cpls-title').setAttribute('data-text', CONFIG.title);
  document.getElementById('cpls-subtitle').textContent = CONFIG.subtitle;

  const logo = document.getElementById('cpls-logo');
  logo.addEventListener('error', () => {
    logo.style.display = 'none';
  });

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
    if (typeof CPLS_MODEL_B64 === 'undefined') {
      throw new Error('Model data (js/model-data.js) was not loaded.');
    }

    const sceneConfig = Object.assign({}, CONFIG.scene, {
      colorsRGB: {
        primary: hexToRgbArray(CONFIG.colors.primaryNeon),
        secondary: hexToRgbArray(CONFIG.colors.secondaryGlow),
      },
    });

    resizeCanvas();
    const scene = await initScene(canvas, CPLS_MODEL_B64, sceneConfig);

    window.addEventListener('resize', resizeCanvas);
    if (window.ResizeObserver) {
      new ResizeObserver(resizeCanvas).observe(canvas);
    }

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
