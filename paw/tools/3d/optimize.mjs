import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize, weld, simplify, prune, dedup, getBounds } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const [, , input, output, ratioArg] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();
const mat = root.listMaterials()[0];

// Transformação de UV do KHR_texture_transform (igual nas 4 texturas).
const info = mat.getBaseColorTextureInfo();
const tt = info.getExtension('KHR_texture_transform');
const scale = tt ? tt.getScale() : [1, 1];
const offset = tt ? tt.getOffset() : [0, 0];

await doc.transform(dequantize());

// "Assa" a transformação nas UVs e remove a extensão.
for (const mesh of root.listMeshes()) for (const prim of mesh.listPrimitives()) {
  const uv = prim.getAttribute('TEXCOORD_0');
  const a = uv.getArray();
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i += 2) { out[i] = a[i] * scale[0] + offset[0]; out[i + 1] = a[i + 1] * scale[1] + offset[1]; }
  uv.setArray(out).setNormalized(false);
}
for (const ti of [mat.getBaseColorTextureInfo()]) ti?.setExtension('KHR_texture_transform', null);

// Só a cor importa: normal ~lisa, rugosidade uniforme, emissiva preta.
mat.setNormalTexture(null).setMetallicRoughnessTexture(null).setEmissiveTexture(null).setEmissiveFactor([0, 0, 0]);
mat.setMetallicFactor(0).setRoughnessFactor(0.85).setDoubleSided(false);

const before = root.listMeshes()[0].listPrimitives()[0].getIndices().getCount() / 3;
await MeshoptSimplifier.ready;
await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: Number(ratioArg ?? 0.15), error: 0.002 }));
const after = root.listMeshes()[0].listPrimitives()[0].getIndices().getCount() / 3;

const tex = mat.getBaseColorTexture();
tex.setImage(await sharp(tex.getImage()).resize(1024, 1024).jpeg({ quality: 85, mozjpeg: true }).toBuffer()).setMimeType('image/jpeg');

await doc.transform(prune(), dedup());
// Ignora extensões que não usamos mais.
for (const ext of root.listExtensionsUsed()) if (ext.extensionName === 'KHR_texture_transform') ext.dispose();
await io.write(output, doc);
const b = getBounds(root.listScenes()[0]);
console.log(`tris ${before} -> ${after}`, 'bounds', b.min.map(v => v.toFixed(3)), b.max.map(v => v.toFixed(3)));
