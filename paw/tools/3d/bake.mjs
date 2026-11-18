import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';

const [, , input, output] = process.argv;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(input);
const root = doc.getRoot();
const buffer = root.listBuffers()[0];
const dogNode = root.listNodes().find((n) => n.getMesh());
dogNode.setName('dog');
const parent = root.listNodes().find((n) => n.listChildren().includes(dogNode));
const S = dogNode.getScale()[0];
const T = dogNode.getTranslation();
const prim = dogNode.getMesh().listPrimitives()[0];
const posA = prim.getAttribute('POSITION').getArray();
const nrmA = prim.getAttribute('NORMAL').getArray();
const idx = prim.getIndices().getArray();
const nv = posA.length / 3;

// Vértices duplicados nas costuras de UV (atlas com muitas ilhas) viram um só:
// o tecido é montado sobre esta malha "soldada" para não abrir frestas.
const canon = new Int32Array(nv);
{
  const key = new Map(); const q = 1 / (S * 2000); // ~0,5 mm
  for (let i = 0; i < nv; i++) {
    const k = `${Math.round(posA[i*3]*S*2000)},${Math.round(posA[i*3+1]*S*2000)},${Math.round(posA[i*3+2]*S*2000)}`;
    if (!key.has(k)) key.set(k, i); canon[i] = key.get(k);
  }
  console.log('unique positions', key.size, 'of', nv);
}

// Coordenadas do "mundo" (metros do modelo) para testar regiões.
const W = new Float32Array(posA.length);
for (let i = 0; i < nv; i++) for (let k = 0; k < 3; k++) W[i * 3 + k] = posA[i * 3 + k] * S + T[k];

// Eixo do tronco (cachorro sentado): da garupa à base do pescoço.
const rear = [0, -0.55, -0.6], neck = [0, 0.36, 0.28];
const ax = [0, neck[1] - rear[1], neck[2] - rear[2]];
const L = Math.hypot(...ax); ax[1] /= L; ax[2] /= L;
// Plano do pescoço: quase horizontal, descendo um pouco para a frente.
const nN = [0, 0.97, 0.24];
const neckS = (i) => (W[i * 3 + 1] - neck[1]) * nN[1] + (W[i * 3 + 2] - neck[2]) * nN[2]; // 0 = linha do pescoço, positivo = acima
const along = (i) => (W[i * 3 + 1] - neck[1]) * ax[1] + (W[i * 3 + 2] - neck[2]) * ax[2]; // 0 = pescoço, negativo = para trás

/**
 * Gera uma peça como "casca" do corpo. `dist(i)` é a distância (m) até a borda
 * da peça: positiva dentro. Perto da borda o tecido afunda suavemente na pele,
 * então a barra visível é a linha onde tecido e pelo se cruzam (sem serrilhado).
 */
/** Direção para fora a partir de uma linha (eixo do tronco ou do pescoço). Não depende das normais do modelo. */
const radialFrom = (a, b) => {
  const ab = [b[0]-a[0], b[1]-a[1], b[2]-a[2]]; const L2 = ab[0]**2 + ab[1]**2 + ab[2]**2;
  return (v) => {
    const p = [W[v*3], W[v*3+1], W[v*3+2]];
    const t = ((p[0]-a[0])*ab[0] + (p[1]-a[1])*ab[1] + (p[2]-a[2])*ab[2]) / L2;
    const q = [a[0]+ab[0]*t, a[1]+ab[1]*t, a[2]+ab[2]*t];
    const r = [p[0]-q[0], p[1]-q[1], p[2]-q[2]]; const l = Math.hypot(...r) || 1;
    return [r[0]/l, r[1]/l, r[2]/l];
  };
};
const TORSO_DIR = radialFrom([0, -0.62, -0.42], [0, 0.4, 0.3]);
const NECK_DIR = radialFrom([0, 0.2, 0.3], [0, 0.75, 0.62]);

function shell(name, dist, thickness, color, { roughness = 0.9, metalness = 0, smooth = 8, extra = () => 0, dir = TORSO_DIR } = {}) {
  const FADE = 0.03, MARGIN = 0.035;
  const d = new Float32Array(nv);
  const keep = new Uint8Array(nv);
  for (let i = 0; i < nv; i++) { d[i] = dist(i, W[i * 3], W[i * 3 + 1], W[i * 3 + 2]); keep[i] = d[i] > -MARGIN ? 1 : 0; }
  const remap = new Int32Array(nv).fill(-1);
  const verts = [], I = [];
  const add = (v) => { if (remap[v] < 0) { remap[v] = verts.length; verts.push(v); } return remap[v]; };
  for (let t = 0; t < idx.length; t += 3) {
    const [a, b, c] = [canon[idx[t]], canon[idx[t + 1]], canon[idx[t + 2]]];
    if (a === b || b === c || a === c) continue;
    if (keep[a] && keep[b] && keep[c]) I.push(add(a), add(b), add(c));
  }
  const n = verts.length;
  // Deslocamento ao longo da normal (em metros), com transição suave na borda.
  const P = new Float32Array(n * 3), N = new Float32Array(n * 3); const D3 = [];
  for (let k = 0; k < n; k++) {
    const v = verts[k];
    const tt = Math.min(1, Math.max(0, (d[v] + 0.012) / FADE));
    const sm = tt * tt * (3 - 2 * tt);
    const off = (thickness + extra(v)) * sm - 0.006 * (1 - sm);
    const dv = dir(v); D3.push(dv);
    for (let c = 0; c < 3; c++) { P[k * 3 + c] = posA[v * 3 + c] + (dv[c] * off) / S; N[k * 3 + c] = dv[c]; }
  }
  // Suavização de Taubin (alisa sem encolher) para o tecido não copiar cada músculo.
  const nbr = Array.from({ length: n }, () => new Set());
  for (let t = 0; t < I.length; t += 3) { const [a, b, c] = [I[t], I[t + 1], I[t + 2]]; nbr[a].add(b).add(c); nbr[b].add(a).add(c); nbr[c].add(a).add(b); }
  const step = (f) => {
    const Q = P.slice();
    for (let k = 0; k < n; k++) {
      const m = nbr[k].size; if (!m) continue;
      let x = 0, y = 0, z = 0; for (const j of nbr[k]) { x += P[j * 3]; y += P[j * 3 + 1]; z += P[j * 3 + 2]; }
      Q[k * 3] += f * (x / m - P[k * 3]); Q[k * 3 + 1] += f * (y / m - P[k * 3 + 1]); Q[k * 3 + 2] += f * (z / m - P[k * 3 + 2]);
    }
    P.set(Q);
  };
  for (let it = 0; it < smooth; it++) { step(0.5); step(-0.53); }
  // Nunca deixa o tecido mais perto da pele do que 60% da espessura (o pelo não atravessa).
  for (let k = 0; k < n; k++) {
    const v = verts[k];
    const tt = Math.min(1, Math.max(0, (d[v] + 0.012) / FADE)); const sm = tt * tt * (3 - 2 * tt);
    const minOff = ((thickness + extra(v)) * 0.6 * sm - 0.006 * (1 - sm)) / S;
    const dx = P[k*3]-posA[v*3], dy = P[k*3+1]-posA[v*3+1], dz = P[k*3+2]-posA[v*3+2];
    const dv = D3[k];
    const along = dx * dv[0] + dy * dv[1] + dz * dv[2];
    if (along < minOff) { const push = minOff - along; P[k*3] += dv[0]*push; P[k*3+1] += dv[1]*push; P[k*3+2] += dv[2]*push; }
  }
  // Normais recalculadas a partir da casca suavizada.
  N.fill(0);
  for (let t = 0; t < I.length; t += 3) {
    const [a, b, c] = [I[t], I[t + 1], I[t + 2]];
    const ux = P[b*3]-P[a*3], uy = P[b*3+1]-P[a*3+1], uz = P[b*3+2]-P[a*3+2];
    const vx = P[c*3]-P[a*3], vy = P[c*3+1]-P[a*3+1], vz = P[c*3+2]-P[a*3+2];
    const nx = uy*vz-uz*vy, ny = uz*vx-ux*vz, nz = ux*vy-uy*vx;
    for (const q of [a, b, c]) { N[q*3] += nx; N[q*3+1] += ny; N[q*3+2] += nz; }
  }
  for (let k = 0; k < n; k++) { const l = Math.hypot(N[k*3], N[k*3+1], N[k*3+2]) || 1; N[k*3] /= l; N[k*3+1] /= l; N[k*3+2] /= l; }

  const mat = doc.createMaterial(name).setBaseColorFactor([...hex(color), 1]).setRoughnessFactor(roughness).setMetallicFactor(metalness).setDoubleSided(true);
  const p = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(P).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(N).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(I)).setBuffer(buffer))
    .setMaterial(mat);
  const node = doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(p)).setScale(dogNode.getScale()).setTranslation(T);
  parent.addChild(node);
  console.log(name, 'tris', I.length / 3);
  return node;
}
const hex = (h) => [1, 3, 5].map((i) => srgbToLinear(parseInt(h.slice(i, i + 2), 16) / 255));
const srgbToLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

// Distâncias com sinal (m): positivo = dentro da peça.
const torso = (back) => (i, x, y, z) => Math.min(
  -neckS(i),                       // abaixo da linha do pescoço
  along(i) + back,                 // antes do corte das costas
  y + 0.6,                         // acima da parte de baixo do corpo
  z > 0.12 ? y + 0.36 : 1,         // mangas curtas nas patas da frente
);
const band = (lo, hi) => (i) => { const s = neckS(i); return Math.min(s - lo, hi - s); };
const hoodExtra = (amt) => (v) => amt * Math.max(0, -NECK_DIR(v)[2]); // mais volume nas costas do pescoço

shell('outfit_moletom', torso(0.62), 0.024, '#9BAF92', { smooth: 10 });
shell('outfit_moletom_hood', band(-0.07, 0.05), 0.04, '#7F9879', { extra: hoodExtra(0.05), smooth: 6, dir: NECK_DIR });
shell('outfit_capa', torso(0.85), 0.032, '#C87550', { roughness: 0.35, smooth: 6 });
shell('outfit_capa_hood', band(-0.07, 0.06), 0.05, '#A95C41', { roughness: 0.35, extra: hoodExtra(0.06), smooth: 6, dir: NECK_DIR });
// Bandana: triângulo no peito (vista de frente) + faixa no pescoço.
const TOP = 0.3, TIP = -0.06, HALF = 0.24;
shell('outfit_bandana', (i, x, y, z) => {
  if (z < 0.25) return band(-0.05, -0.012)(i);
  const edgeL = (HALF * (y - TIP) / (TOP - TIP)) - Math.abs(x); // lados do triângulo
  const tri = Math.min(edgeL * 0.8, y - TIP, -neckS(i) - 0.012);
  return Math.max(tri, band(-0.05, -0.012)(i));
}, 0.018, '#CFC86D', { smooth: 3 });
// Coleira PAW One: faixa estreita no pescoço.
shell('collar', band(-0.008, 0.032), 0.016, '#3E5B47', { roughness: 0.6, smooth: 2, dir: NECK_DIR });

// Módulo da coleira na frente do pescoço: ponto mais à frente da faixa.
let best = -1, bz = -1e9;
for (let i = 0; i < nv; i++) { const s = neckS(i); if (s >= -0.005 && s <= 0.03 && W[i * 3 + 2] > bz && Math.abs(W[i * 3]) < 0.05) { bz = W[i * 3 + 2]; best = i; } }
console.log('collar front', W[best * 3].toFixed(3), W[best * 3 + 1].toFixed(3), W[best * 3 + 2].toFixed(3));
const extras = doc.createNode('collar_device_anchor').setTranslation([W[best * 3], W[best * 3 + 1], W[best * 3 + 2]]);
parent.addChild(extras);
// Textura separada (o loader do three.js não decodifica imagens embutidas no React Native).
const dogMat = dogNode.getMesh().listPrimitives()[0].getMaterial();
const colorTex = dogMat.getBaseColorTexture();
const fs = await import('node:fs');
fs.writeFileSync(output.replace(/\.glb$/, '_color.jpg'), colorTex.getImage());
dogMat.setBaseColorTexture(null);
colorTex.dispose();
await io.write(output, doc);
