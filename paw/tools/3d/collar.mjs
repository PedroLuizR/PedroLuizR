// Coleira: troca texturas pela cor média (sem upload de imagem no app) e reporta o rastreador.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, weld } from '@gltf-transform/functions';
import sharp from 'sharp';
const [, , input, output] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
for (const m of root.listMaterials()) {
  const tex = m.getBaseColorTexture();
  if (tex) {
    const { channels } = await sharp(tex.getImage()).stats();
    const f = m.getBaseColorFactor();
    m.setBaseColorFactor([toLinear(channels[0].mean / 255) * f[0], toLinear(channels[1].mean / 255) * f[1], toLinear(channels[2].mean / 255) * f[2], 1]);
    m.setRoughnessFactor(0.85);
  }
  m.setBaseColorTexture(null).setNormalTexture(null).setMetallicRoughnessTexture(null).setEmissiveTexture(null).setOcclusionTexture(null);
  console.log('material', m.getName(), m.getBaseColorFactor().map((v) => v.toFixed(3)).join(','));
}
for (const n of root.listNodes()) {
  const mesh = n.getMesh();
  if (/Cube|Cylinder\.006|Sphere/.test(mesh?.getName() ?? n.getName())) console.log('node', n.getName(), 'mesh', mesh?.getName(), 't', n.getTranslation().map((v) => v.toFixed(4)), 'r', n.getRotation().map((v) => v.toFixed(3)), 'mat', mesh?.listPrimitives()[0].getMaterial()?.getName());
}
await doc.transform(weld(), prune(), dedup());
await io.write(output, doc);
