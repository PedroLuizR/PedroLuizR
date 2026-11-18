import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ClosetItemKind } from '../../data/mock';
import { colors } from '../../theme/tokens';

/**
 * Modelos 3D reais do PAW (pipeline em tools/3d):
 * - bento3d.glb: Bento (Patient Pup Dog otimizado) com a cor do pelo nos
 *   vértices, roupas moldadas no corpo e a faixa da coleira. Sem texturas:
 *   nada depende de upload de imagem (que deixava o Bento preto no Android).
 * - collar3d.glb: coleira rastreadora (tecido bordô, fivela, argola e o
 *   rastreador com emblema), também sem texturas.
 */
const BENTO_GLB = require('../../../assets/models/bento3d.glb');
const COLLAR_GLB = require('../../../assets/models/collar3d.glb');

// Hermes antigo não tem TextDecoder (usado pelo GLTFLoader para ler o JSON do .glb).
if (typeof globalThis.TextDecoder === 'undefined') {
  class Utf8Decoder {
    decode(input?: ArrayBuffer | ArrayBufferView): string {
      if (!input) return '';
      const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
      let out = '';
      for (let i = 0; i < bytes.length; ) {
        const b = bytes[i++];
        if (b < 0x80) out += String.fromCharCode(b);
        else if (b < 0xe0) out += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
        else if (b < 0xf0) out += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
        else {
          const cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
          out += String.fromCodePoint(cp);
        }
      }
      return out;
    }
  }
  (globalThis as unknown as { TextDecoder: unknown }).TextDecoder = Utf8Decoder;
}

async function readBytes(module: number): Promise<ArrayBuffer> {
  const asset = Asset.fromModule(module);
  if (Platform.OS === 'web') return (await fetch(asset.uri)).arrayBuffer();
  await asset.downloadAsync();
  return new File(asset.localUri ?? asset.uri).arrayBuffer();
}

const glbCache = new Map<number, Promise<THREE.Group>>();

/** Lê e interpreta um .glb (uma vez por arquivo). */
function loadGlb(module: number): Promise<THREE.Group> {
  let p = glbCache.get(module);
  if (!p) {
    p = readBytes(module)
      .then((bytes) => new GLTFLoader().parseAsync(bytes, ''))
      .then((gltf) => gltf.scene);
    p.catch(() => glbCache.delete(module)); // permite tentar de novo
    glbCache.set(module, p);
  }
  return p;
}

/** Centraliza no eixo de rotação, com a base no chão (y = 0). */
function grounded(obj: THREE.Object3D): THREE.Group {
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  obj.position.set(obj.position.x - center.x, obj.position.y - box.min.y, obj.position.z - center.z);
  const wrapper = new THREE.Group();
  wrapper.add(obj);
  return wrapper;
}

/** Coleira rastreadora sozinha (tela Collar). */
export async function loadCollar(): Promise<THREE.Group> {
  const scene = (await loadGlb(COLLAR_GLB)).clone(true);
  const tilt = new THREE.Group();
  tilt.add(scene);
  tilt.rotation.x = 0.35; // mostra o rastreador e o interior da coleira
  tilt.scale.setScalar(14); // unidades reais (m) → mesma escala visual dos outros modelos
  return grounded(tilt);
}

/** Rastreador (com emblema e LED) recortado do modelo da coleira. */
async function loadTracker(): Promise<THREE.Object3D | null> {
  const collar = await loadGlb(COLLAR_GLB);
  const tracker = collar.getObjectByName('Rastreador');
  if (!tracker) return null;
  const t = tracker.clone(true);
  t.position.set(0, 0, 0); // o anchor do pescoço define a posição
  return t;
}

let bentoBase: Promise<THREE.Group> | null = null;

function loadBentoBase(): Promise<THREE.Group> {
  if (!bentoBase) {
    bentoBase = (async () => {
      const [scene, tracker] = await Promise.all([loadGlb(BENTO_GLB), loadTracker().catch(() => null)]);

      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (o.name === 'dog') {
          // Cor do pelo vem dos vértices (COLOR_0).
          const m = mesh.material as THREE.MeshStandardMaterial;
          m.vertexColors = true;
          m.map = null;
          m.color.set(0xffffff);
          m.needsUpdate = true;
        }
        if (o.name === 'collar') {
          // A faixa do pescoço usa o tecido bordô da coleira rastreadora.
          (mesh.material as THREE.MeshStandardMaterial).color.set(colors.collarWine);
        }
      });

      // Rastreador da coleira na frente do pescoço.
      const anchor = scene.getObjectByName('collar_device_anchor');
      if (anchor && tracker) {
        tracker.scale.setScalar(3.6);
        tracker.position.set(0, -0.015, 0.03);
        anchor.add(tracker);
      }
      return grounded(scene);
    })();
    bentoBase.catch(() => {
      bentoBase = null;
    });
  }
  return bentoBase;
}

/** Bento real vestindo a roupa escolhida (ou só a coleira). */
export async function loadBento(outfit?: ClosetItemKind): Promise<THREE.Group> {
  // Cópia leve (compartilha malhas e materiais): pode estar em mais de uma cena.
  const bento = (await loadBentoBase()).clone(true);
  bento.traverse((o) => {
    if (o.name.startsWith('outfit_')) o.visible = Boolean(outfit) && o.name.startsWith(`outfit_${outfit}`);
  });
  return bento;
}
