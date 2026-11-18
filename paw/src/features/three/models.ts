import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import type { ClosetItemKind } from '../../data/mock';
import { colors } from '../../theme/tokens';

/**
 * Modelos 3D do PAW, montados com formas simples (estilo "low-poly fofo").
 * Sem texturas: só cores sólidas, o que funciona igual no Android, iOS e web.
 * Convenção: o Bento olha para +X; a cena gira o grupo em Y.
 */

const mat = (color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0, ...opts });

function mesh(geo: THREE.BufferGeometry, material: THREE.Material, pos: [number, number, number], scale?: [number, number, number]) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(...pos);
  if (scale) m.scale.set(...scale);
  return m;
}

/** Coleira PAW One: alça de tecido, módulo com LED, fivela e furos. */
export function buildCollar(radius = 1, width = 0.34): THREE.Group {
  const g = new THREE.Group();
  const strap = mat(colors.collarStrap, { roughness: 0.95, side: THREE.DoubleSide });
  const thickness = radius * 0.06;

  // Alça: dois cilindros abertos (faces externa e interna) + anéis nas bordas.
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, width, 96, 1, true), strap));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(radius - thickness, radius - thickness, width, 96, 1, true), strap));
  for (const y of [width / 2, -width / 2]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(radius - thickness, radius, 96), strap);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  }

  // Módulo inteligente na frente (+X).
  const device = new THREE.Mesh(
    new RoundedBoxGeometry(radius * 0.32, width * 1.25, radius * 0.6, 4, radius * 0.08),
    mat(colors.collarDevice, { roughness: 0.45 }),
  );
  device.position.set(radius + radius * 0.12, -width * 0.05, 0);
  g.add(device);
  const led = mesh(
    new THREE.SphereGeometry(radius * 0.035, 16, 16),
    new THREE.MeshStandardMaterial({ color: colors.accent, emissive: colors.accent, emissiveIntensity: 1.2 }),
    [radius + radius * 0.285, width * 0.18, 0],
  );
  g.add(led);

  // Fivela metálica atrás (-X) e furos.
  const metal = mat(colors.metal, { metalness: 0.85, roughness: 0.3 });
  const buckle = new THREE.Mesh(new THREE.TorusGeometry(width * 0.42, radius * 0.025, 12, 32), metal);
  buckle.position.set(-radius - thickness, 0, 0);
  buckle.rotation.y = Math.PI / 2;
  buckle.scale.set(1, 1.25, 1);
  g.add(buckle);
  const holeMat = mat(colors.metal, { metalness: 0.8, roughness: 0.35 });
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * 0.62 + i * 0.16;
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.028, radius * 0.028, thickness * 1.6, 12), holeMat);
    hole.position.set(Math.cos(a) * radius, 0, Math.sin(a) * radius);
    hole.rotation.z = Math.PI / 2;
    hole.rotation.y = -a;
    g.add(hole);
  }
  return g;
}

/** Roupinhas do closet, ajustadas ao corpo do Bento. */
function buildOutfit(kind: ClosetItemKind): THREE.Group {
  const g = new THREE.Group();
  if (kind === 'bandana') {
    // Triângulo de tecido pendurado na frente do peito, logo abaixo da coleira.
    const cloth = mat(colors.sunYellow, { side: THREE.DoubleSide, roughness: 0.85 });
    const shape = new THREE.Shape();
    shape.moveTo(-0.36, 0);
    shape.lineTo(0.36, 0);
    shape.lineTo(0, -0.46);
    shape.closePath();
    const tri = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2 }), cloth);
    tri.rotation.y = Math.PI / 2; // de frente para +X
    tri.rotation.x = -0.18; // acompanha a curva do peito
    tri.position.set(1.06, 1.24, 0);
    g.add(tri);
    // Bolinhas brancas da estampa.
    const dot = mat(colors.surface);
    for (const [y, z] of [[1.14, 0.12], [1.14, -0.12], [1.02, 0]] as const) {
      g.add(mesh(new THREE.SphereGeometry(0.032, 10, 8), dot, [1.1, y, z], [0.4, 1, 1]));
    }
    // Nó atrás do pescoço.
    g.add(mesh(new THREE.SphereGeometry(0.09, 14, 10), cloth, [0.55, 1.5, 0]));
    return g;
  }
  const color = kind === 'moletom' ? colors.sageGreen : colors.terracotta;
  const shade = kind === 'moletom' ? colors.sageDark : colors.terracottaDark;
  const cloth = mat(color, { roughness: kind === 'capa' ? 0.35 : 0.9 });
  // Tronco: cápsula um pouco maior que o corpo, cobrindo do peito à cintura.
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.6, 0.62, 8, 24), cloth);
  torso.rotation.z = Math.PI / 2;
  torso.position.set(0.18, 0.95, 0);
  g.add(torso);
  // Capuz caído nas costas do pescoço.
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(shade, { side: THREE.DoubleSide }));
  hood.position.set(0.45, 1.42, 0);
  hood.rotation.z = 0.9;
  g.add(hood);
  // Cordões do moletom / botões da capa.
  const detail = mat(colors.surface);
  for (const z of [-0.12, 0.12]) {
    g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.28, 8), detail, [1.02, 0.98, z]));
  }
  return g;
}

/** Bento: golden estilizado. Com `outfit`, veste a roupa; sempre usa a coleira. */
export function buildDog(outfit?: ClosetItemKind): THREE.Group {
  const g = new THREE.Group();
  const fur = mat(colors.fur);
  const furLight = mat(colors.furLight);
  const furShade = mat(colors.furShade);
  const dark = mat(colors.nose, { roughness: 0.3 });

  // Corpo e peito.
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 0.85, 8, 24), fur);
  body.rotation.z = Math.PI / 2;
  body.position.set(0, 0.95, 0);
  g.add(body);
  g.add(mesh(new THREE.SphereGeometry(0.48, 24, 16), furLight, [0.62, 0.92, 0], [0.8, 1, 0.95]));

  // Pernas e patas.
  for (const [x, z] of [[0.55, 0.3], [0.55, -0.3], [-0.55, 0.3], [-0.55, -0.3]] as const) {
    g.add(mesh(new THREE.CapsuleGeometry(0.15, 0.42, 6, 12), fur, [x, 0.42, z]));
    g.add(mesh(new THREE.SphereGeometry(0.17, 16, 12), furLight, [x + 0.05, 0.12, z], [1.25, 0.7, 1]));
  }

  // Rabo: tubo curvo para cima.
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.95, 1.05, 0),
    new THREE.Vector3(-1.3, 1.3, 0),
    new THREE.Vector3(-1.42, 1.72, 0),
    new THREE.Vector3(-1.32, 2.0, 0),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 24, 0.11, 10), furShade));

  // Cabeça.
  const head = new THREE.Group();
  head.position.set(1.0, 1.72, 0);
  head.add(mesh(new THREE.SphereGeometry(0.5, 32, 24), fur, [0, 0, 0], [1, 0.95, 0.95]));
  head.add(mesh(new THREE.SphereGeometry(0.3, 24, 16), furLight, [0.4, -0.16, 0], [1.15, 0.8, 0.95])); // focinho
  head.add(mesh(new THREE.SphereGeometry(0.1, 16, 12), dark, [0.73, -0.06, 0], [0.8, 0.75, 1.05])); // nariz
  const tongue = mesh(new THREE.SphereGeometry(0.09, 16, 12), mat(colors.tongue), [0.58, -0.36, 0], [1, 0.45, 0.9]);
  head.add(tongue);
  for (const z of [0.21, -0.21]) {
    head.add(mesh(new THREE.SphereGeometry(0.075, 16, 12), dark, [0.36, 0.13, z])); // olhos
    head.add(mesh(new THREE.SphereGeometry(0.022, 8, 8), mat(colors.surface), [0.42, 0.16, z * 1.08]));
    const ear = mesh(new THREE.SphereGeometry(0.26, 20, 14), furShade, [-0.04, -0.1, z * 2.15], [0.55, 1.15, 0.32]);
    ear.rotation.x = z > 0 ? 0.35 : -0.35;
    head.add(ear);
  }
  g.add(head);

  if (outfit) g.add(buildOutfit(outfit));

  // Coleira no pescoço (inclinada acompanhando o pescoço).
  const collar = buildCollar(0.4, 0.13);
  collar.position.set(0.82, 1.3, 0);
  collar.rotation.z = -0.55;
  g.add(collar);

  return g;
}

/** Sombra suave no chão (disco translúcido). */
export function buildGroundShadow(radius: number): THREE.Mesh {
  const m = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    new THREE.MeshBasicMaterial({ color: colors.shadow3d, transparent: true, opacity: 0.12, depthWrite: false }),
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.005;
  return m;
}
