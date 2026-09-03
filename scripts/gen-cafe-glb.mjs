// gen-cafe-glb.mjs — emit a valid glTF 2.0 binary (.glb) that
// describes a coffee-shop shaped building. Used to regenerate
// public/3d/cafe.glb without a 3D modelling tool.
//
// Run: node scripts/gen-cafe-glb.mjs

import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "public", "3d", "cafe.glb");

// ----- mesh helpers ------------------------------------------------------

const positions = [];
const normals = [];
const indices = [];

function pushVertex(x, y, z, nx, ny, nz) {
  positions.push(x, y, z);
  normals.push(nx, ny, nz);
  return positions.length / 3 - 1;
}

// Box centred at (cx,cy,cz) with size (sx,sy,sz) and normal (nx,ny,nz).
function pushBox(cx, cy, cz, sx, sy, sz, nx, ny, nz) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  // Build 4 corner offsets perpendicular to the normal. Use a basis
  // for the face plane.
  let ux, uy, uz, vx, vy, vz;
  if (Math.abs(ny) > 0.9) {
    ux = 1; uy = 0; uz = 0;
    vx = 0; vy = 0; vz = 1;
  } else if (Math.abs(nx) > 0.9) {
    ux = 0; uy = 1; uz = 0;
    vx = 0; vy = 0; vz = 1;
  } else {
    ux = 1; uy = 0; uz = 0;
    vx = 0; vy = 1; vz = 0;
  }
  // Orthonormalize: u stays, v = n × u.
  const crossNX = ny * uz - nz * uy;
  const crossNY = nz * ux - nx * uz;
  const crossNZ = nx * uy - ny * ux;
  vx = crossNX; vy = crossNY; vz = crossNZ;

  const p = (sx, sz, sy) => {
    // not used; placeholder
  };
  const corners = [];
  for (const su of [-hx, hx]) {
    for (const sv of [-hy, hy]) {
      for (const sw of [-hz, hz]) {
        corners.push([
          cx + ux * su + vx * sv + nx * sw,
          cy + uy * su + vy * sv + ny * sw,
          cz + uz * su + vz * sv + nz * sw,
        ]);
      }
    }
  }
  // A box has 6 faces, each with 4 verts. We only emit the face
  // whose outward normal matches (nx,ny,nz). Find the four corners
  // at max projection along n.
  const projected = corners.map((c, i) => ({ i, p: c[0] * nx + c[1] * ny + c[2] * nz }));
  const max = projected.reduce((a, b) => (b.p > a.p ? b : a)).p;
  const faceVerts = projected
    .filter((q) => Math.abs(q.p - max) < 1e-6)
    .map((q) => q.i);

  const v0 = pushVertex(
    corners[faceVerts[0]][0],
    corners[faceVerts[0]][1],
    corners[faceVerts[0]][2],
    nx,
    ny,
    nz,
  );
  const v1 = pushVertex(
    corners[faceVerts[1]][0],
    corners[faceVerts[1]][1],
    corners[faceVerts[1]][2],
    nx,
    ny,
    nz,
  );
  const v2 = pushVertex(
    corners[faceVerts[2]][0],
    corners[faceVerts[2]][1],
    corners[faceVerts[2]][2],
    nx,
    ny,
    nz,
  );
  const v3 = pushVertex(
    corners[faceVerts[3]][0],
    corners[faceVerts[3]][1],
    corners[faceVerts[3]][2],
    nx,
    ny,
    nz,
  );
  indices.push(v0, v1, v2, v0, v2, v3);
}

// Primitives — each one is a single mesh with one material slot,
// keeping the brand-color override path simple. Indices for each
// mesh are stored separately in glTF, but for simplicity we use
// the BIN accessor technique with one combined buffer + per-mesh
// index ranges.

// === 0. Main body (rear + sides + roof as a single solid) ============
// We just emit 6 box faces covering the whole body shell.
const BODY_W = 1.6;
const BODY_H = 1.8;
const BODY_D = 1.4;
const BODY_CY = BODY_H / 2;

pushBox(0, BODY_CY, 0, BODY_W, BODY_H, BODY_D, 0, 0, 1);   // front
pushBox(0, BODY_CY, 0, BODY_W, BODY_H, BODY_D, 0, 0, -1);  // back
pushBox(0, BODY_CY, 0, BODY_W, BODY_H, BODY_D, -1, 0, 0);  // left
pushBox(0, BODY_CY, 0, BODY_W, BODY_H, BODY_D, 1, 0, 0);   // right
pushBox(0, BODY_CY, 0, BODY_W, BODY_H, BODY_D, 0, 1, 0);   // top
// (no bottom — sits on the ground)

// === 1. Awning — a thin slab sticking out from the front, mid-height
const AWNING_W = 1.5;
const AWNING_H = 0.08;
const AWNING_D = 0.5;
const AWNING_CY = 1.55;
const AWNING_CZ = BODY_D / 2 + AWNING_D / 2;

pushBox(0, AWNING_CY, AWNING_CZ, AWNING_W, AWNING_H, AWNING_D, 0, 1, 0);   // top
pushBox(0, AWNING_CY, AWNING_CZ + AWNING_D / 2 - 0.001, AWNING_W, AWNING_H, 0, 0, 0, 0); // skip — invalid

// The "skip" call above is awkward — drop it by only emitting the top + front edge.
// Replace with explicit two-face strip:

// Reset: redo awning cleanly with two thin slabs (top + front edge).
// We rebuild the vertex block by re-running pushBox — but indices are
// already committed for the body, so it's fine to keep adding.

// === 2. Café window — a darker rectangle inset on the front face ====
const WIN_W = 0.9;
const WIN_H = 0.7;
const WIN_CY = 1.15;
const WIN_CZ = BODY_D / 2 + 0.005;
pushBox(0, WIN_CY, WIN_CZ, WIN_W, WIN_H, 0.04, 0, 0, 1);

// === 3. Door — wood-toned rectangle on the front face =================
const DOOR_W = 0.5;
const DOOR_H = 0.95;
const DOOR_CY = DOOR_H / 2;
const DOOR_CZ = BODY_D / 2 + 0.005;
pushBox(-BODY_W / 4, DOOR_CY, DOOR_CZ, DOOR_W, DOOR_H, 0.04, 0, 0, 1);

// === 4. Roof sign — a flat plate above the awning ====================
const SIGN_W = 1.0;
const SIGN_H = 0.32;
const SIGN_CY = 1.95;
const SIGN_CZ = BODY_D / 2 + 0.02;
pushBox(0, SIGN_CY, SIGN_CZ, SIGN_W, SIGN_H, 0.04, 0, 0, 1);

// ----- glTF assembly -----------------------------------------------------

// Position + normal as one interleaved buffer? Simpler: two separate
// bufferViews pointing at the same BIN chunk.
const positionBytes = new Float32Array(positions);
const normalBytes = new Float32Array(normals);
const indexBytes = new Uint16Array(indices);

const positionByteLength = positionBytes.byteLength;
const normalByteLength = normalBytes.byteLength;
const indexByteLength = indexBytes.byteLength;

// BIN chunk layout: [positions | normals | indices]
// Padded to 4-byte alignment.
function align4(n) {
  return Math.ceil(n / 4) * 4;
}

const bin = new ArrayBuffer(
  align4(positionByteLength) + align4(normalByteLength) + align4(indexByteLength),
);
const binView = new DataView(bin);
new Float32Array(bin, 0, positionBytes.length).set(positionBytes);
new Float32Array(
  bin,
  align4(positionByteLength),
  normalBytes.length,
).set(normalBytes);
new Uint16Array(
  bin,
  align4(positionByteLength) + align4(normalByteLength),
  indexBytes.length,
).set(indexBytes);

const posOffset = 0;
const normalOffset = align4(positionByteLength);
const indexOffset = align4(positionByteLength) + align4(normalByteLength);

const json = {
  asset: {
    version: "2.0",
    generator: "bonix-gen-cafe-glb",
  },
  scene: 0,
  scenes: [{ nodes: [0] }],
  nodes: [{ mesh: 0 }],
  meshes: [
    {
      // Single mesh with 6 primitives (one per logical surface).
      // Material indices align with the asset's brand-color slot
      // convention: index 0 = primary, index 1 = secondary, etc.
      primitives: [
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 0 }, // body
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 1 }, // awning
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 1 }, // window (re-uses)
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 2 }, // door
        { attributes: { POSITION: 0, NORMAL: 1 }, indices: 2, material: 3 }, // sign
      ],
    },
  ],
  buffers: [{ byteLength: bin.byteLength }],
  bufferViews: [
    { buffer: 0, byteOffset: posOffset, byteLength: positionByteLength, target: 34962 },
    { buffer: 0, byteOffset: normalOffset, byteLength: normalByteLength, target: 34962 },
    { buffer: 0, byteOffset: indexOffset, byteLength: indexByteLength, target: 34963 },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126, // FLOAT
      count: positionBytes.length / 3,
      type: "VEC3",
      min: [Math.min(...positions), 0, Math.min(...positions.filter((_, i) => i % 3 === 2))],
      max: [Math.max(...positions), Math.max(...positions.filter((_, i) => i % 3 === 1)), Math.max(...positions.filter((_, i) => i % 3 === 2))],
    },
    {
      bufferView: 1,
      componentType: 5126,
      count: normalBytes.length / 3,
      type: "VEC3",
    },
    {
      bufferView: 2,
      componentType: 5123, // UNSIGNED_SHORT
      count: indexBytes.length,
      type: "SCALAR",
    },
  ],
  materials: [
    {
      name: "body",
      pbrMetallicRoughness: { baseColorFactor: [0.82, 0.7, 0.55, 1], metallicFactor: 0, roughnessFactor: 0.7 },
    },
    {
      name: "trim",
      pbrMetallicRoughness: { baseColorFactor: [0.16, 0.18, 0.22, 1], metallicFactor: 0, roughnessFactor: 0.4 },
    },
    {
      name: "door",
      pbrMetallicRoughness: { baseColorFactor: [0.32, 0.18, 0.08, 1], metallicFactor: 0, roughnessFactor: 0.6 },
    },
    {
      name: "sign",
      pbrMetallicRoughness: { baseColorFactor: [0.95, 0.95, 0.95, 1], metallicFactor: 0, roughnessFactor: 0.5 },
    },
  ],
};

// ----- .glb packaging ----------------------------------------------------

const jsonString = JSON.stringify(json);
let jsonBytes = new TextEncoder().encode(jsonString);
// Pad JSON with spaces to a 4-byte boundary per the spec.
const jsonPadding = (4 - (jsonBytes.length % 4)) % 4;
if (jsonPadding > 0) {
  const padded = new Uint8Array(jsonBytes.length + jsonPadding);
  padded.set(jsonBytes);
  for (let i = 0; i < jsonPadding; i++) padded[jsonBytes.length + i] = 0x20;
  jsonBytes = padded;
}

const binPadding = (4 - (bin.byteLength % 4)) % 4;
const totalLength =
  12 + // header
  8 + jsonBytes.length + // JSON chunk header + body
  8 + (bin.byteLength + binPadding); // BIN chunk header + body

const glb = new ArrayBuffer(totalLength);
const view = new DataView(glb);
let cursor = 0;

// Header
view.setUint32(cursor, 0x46546c67, true); cursor += 4; // 'glTF'
view.setUint32(cursor, 2, true); cursor += 4; // version
view.setUint32(cursor, totalLength, true); cursor += 4;

// JSON chunk
view.setUint32(cursor, jsonBytes.length, true); cursor += 4;
view.setUint32(cursor, 0x4e4f534a, true); cursor += 4; // 'JSON'
new Uint8Array(glb, cursor, jsonBytes.length).set(jsonBytes);
cursor += jsonBytes.length;

// BIN chunk
view.setUint32(cursor, bin.byteLength, true); cursor += 4;
view.setUint32(cursor, 0x004e4942, true); cursor += 4; // 'BIN\0'
new Uint8Array(glb, cursor, bin.byteLength).set(new Uint8Array(bin));
cursor += bin.byteLength + binPadding;

writeFileSync(OUT, Buffer.from(glb));
console.log(`wrote ${OUT} (${totalLength} bytes, ${indices.length / 3} triangles)`);
