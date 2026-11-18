// "Assa" a textura de cor nos vértices (COLOR_0) e remove a textura.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import sharp from 'sharp';
const [, , input, texPath, output] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const { data, info } = await sharp(texPath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const px = (x, y, c) => data[(Math.min(H - 1, Math.max(0, y)) * W + Math.min(W - 1, Math.max(0, x))) * 3 + c];
const toLinear = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const dog = doc.getRoot().listNodes().find((n) => n.getName() === 'dog');
const prim = dog.getMesh().listPrimitives()[0];
const uv = prim.getAttribute('TEXCOORD_0').getArray();
const n = uv.length / 2;
const col = new Float32Array(n * 3);
for (let i = 0; i < n; i++) {
  // UV com repetição (o atlas usa wrap) → pixel, média 3x3 para suavizar
  let u = uv[i * 2] % 1, v = uv[i * 2 + 1] % 1; if (u < 0) u += 1; if (v < 0) v += 1;
  const x = Math.floor(u * W), y = Math.floor(v * H);
  for (let c = 0; c < 3; c++) {
    let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += px(x + dx, y + dy, c);
    col[i * 3 + c] = toLinear(s / 9);
  }
}
prim.setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(col).setBuffer(doc.getRoot().listBuffers()[0]));
prim.setAttribute('TEXCOORD_0', null);
await io.write(output, doc);
console.log('vertices colored:', n);
