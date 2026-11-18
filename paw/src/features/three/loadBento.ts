import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';
import { Platform } from 'react-native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { ClosetItemKind } from '../../data/mock';
import { colors } from '../../theme/tokens';

/**
 * Bento em 3D a partir do modelo real (Patient Pup Dog, otimizado):
 * - assets/models/bento3d.glb: cachorro + roupas moldadas no corpo + coleira
 * - assets/models/bento3d_color.jpg: textura do pelo (separada porque o
 *   GLTFLoader não decodifica imagens embutidas no React Native)
 * Nós no .glb: dog, outfit_moletom(_hood), outfit_capa(_hood), outfit_bandana,
 * collar, collar_device_anchor.
 */
const GLB = require('../../../assets/models/bento3d.glb');
const COLOR = require('../../../assets/models/bento3d_color.jpg');

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

async function readBytes(asset: Asset): Promise<ArrayBuffer> {
  if (Platform.OS === 'web') return (await fetch(asset.uri)).arrayBuffer();
  await asset.downloadAsync();
  return new File(asset.localUri ?? asset.uri).arrayBuffer();
}

async function loadColorTexture(): Promise<THREE.Texture> {
  const asset = Asset.fromModule(COLOR);
  if (Platform.OS === 'web') {
    const tex = await new THREE.TextureLoader().loadAsync(asset.uri);
    tex.flipY = false; // convenção de UV do glTF
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  await asset.downloadAsync();
  // No expo-gl, texImage2D/texSubImage2D aceitam { localUri } como pixels:
  // marcamos como "DataTexture" para o three.js repassar o objeto direto.
  const tex = new THREE.Texture();
  (tex as unknown as { isDataTexture: boolean }).isDataTexture = true;
  tex.image = { data: { localUri: asset.localUri }, width: asset.width ?? 1024, height: asset.height ?? 1024 };
  tex.flipY = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

let cache: Promise<THREE.Group> | null = null;

/** Carrega (uma vez) o modelo do Bento com textura e o módulo da coleira. */
function loadBase(): Promise<THREE.Group> {
  if (!cache) {
    cache = (async () => {
      const [bytes, colorTex] = await Promise.all([readBytes(Asset.fromModule(GLB)), loadColorTexture()]);
      const gltf = await new GLTFLoader().parseAsync(bytes, '');
      const scene = gltf.scene;

      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && o.name === 'dog') {
          const m = mesh.material as THREE.MeshStandardMaterial;
          m.map = colorTex;
          m.needsUpdate = true;
        }
      });

      // Módulo inteligente da PAW One na frente do pescoço.
      const anchor = scene.getObjectByName('collar_device_anchor');
      if (anchor) {
        const device = new THREE.Mesh(
          new THREE.BoxGeometry(0.11, 0.07, 0.04),
          new THREE.MeshStandardMaterial({ color: colors.collarDevice, roughness: 0.45 }),
        );
        device.position.set(0, -0.005, 0.03);
        device.rotation.x = 0.25;
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.009, 12, 12),
          new THREE.MeshStandardMaterial({ color: colors.accent, emissive: colors.accent, emissiveIntensity: 1.2 }),
        );
        led.position.set(0.03, 0.015, 0.022);
        device.add(led);
        anchor.add(device);
      }

      // Centraliza no eixo de rotação, com as patas no chão (y = 0).
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      scene.position.set(-center.x, -box.min.y, -center.z);
      const wrapper = new THREE.Group();
      wrapper.add(scene);
      return wrapper;
    })();
    cache.catch(() => {
      cache = null; // permite tentar de novo
    });
  }
  return cache;
}

/** Bento real vestindo a roupa escolhida (ou só a coleira). */
export async function loadBento(outfit?: ClosetItemKind): Promise<THREE.Group> {
  const base = await loadBase();
  base.traverse((o) => {
    if (o.name.startsWith('outfit_')) o.visible = Boolean(outfit) && o.name.startsWith(`outfit_${outfit}`);
  });
  return base;
}
