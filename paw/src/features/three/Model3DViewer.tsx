import { GLView, type ExpoWebGLRenderingContext } from 'expo-gl';
import { useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import * as THREE from 'three';
import type { ClosetItemKind } from '../../data/mock';
import { buildCollar, buildDog, buildGroundShadow } from './models';

export type Model3DSubject = { kind: 'dog'; outfit?: ClosetItemKind } | { kind: 'collar' };

type Props = { subject: Model3DSubject; style?: StyleProp<ViewStyle> };

const AUTO_SPEED = 0.006; // rad/frame
const DRAG_SPEED = 0.012; // rad/px
const IDLE_RESUME_MS = 1800;
const MAX_TILT = 0.35;

/**
 * Visualizador 3D com rotação 360°: arraste na horizontal para girar,
 * na vertical para inclinar. Gira sozinho quando ninguém está tocando.
 */
export function Model3DViewer({ subject, style }: Props) {
  const spin = useRef({ yaw: -0.6, tilt: 0, dragging: false, lastTouch: 0, lastDx: 0, lastDy: 0 });
  const frame = useRef<number | null>(null);
  const subjectKey = subject.kind === 'dog' ? `dog:${subject.outfit ?? ''}` : 'collar';

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        const s = spin.current;
        s.dragging = true;
        s.lastDx = 0;
        s.lastDy = 0;
      },
      onPanResponderMove: (_e, g) => {
        const s = spin.current;
        s.yaw += (g.dx - s.lastDx) * DRAG_SPEED;
        s.tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, s.tilt + (g.dy - s.lastDy) * DRAG_SPEED * 0.5));
        s.lastDx = g.dx;
        s.lastDy = g.dy;
      },
      onPanResponderRelease: () => {
        spin.current.dragging = false;
        spin.current.lastTouch = Date.now();
      },
      onPanResponderTerminate: () => {
        spin.current.dragging = false;
        spin.current.lastTouch = Date.now();
      },
    }),
  ).current;

  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const onContextCreate = (gl: ExpoWebGLRenderingContext) => {
    // Um novo contexto (ex.: troca de roupa) substitui o loop anterior.
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;

    // No Android/iOS não existe <canvas>: entregamos um objeto mínimo ao three.js.
    const glAny = gl as unknown as WebGL2RenderingContext & { canvas?: HTMLCanvasElement };
    const canvas =
      glAny.canvas && typeof glAny.canvas.addEventListener === 'function'
        ? glAny.canvas
        : ({
            width,
            height,
            style: {},
            clientWidth: width,
            clientHeight: height,
            addEventListener: () => {},
            removeEventListener: () => {},
            getContext: () => gl,
          } as unknown as HTMLCanvasElement);

    const renderer = new THREE.WebGLRenderer({ canvas, context: glAny, antialias: true, alpha: true });
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd8cfe8, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xe6e1f2, 0.9);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    const camera = new THREE.PerspectiveCamera(32, width / height, 0.1, 100);
    const pivot = new THREE.Group();
    scene.add(pivot);

    if (subject.kind === 'dog') {
      const dog = buildDog(subject.outfit);
      dog.position.x = -0.18; // centraliza o corpo no eixo de rotação
      pivot.add(dog);
      scene.add(buildGroundShadow(1.5));
    } else {
      const collar = buildCollar(1, 0.34);
      collar.rotation.x = 0.35;
      collar.position.y = 0.75;
      pivot.add(collar);
      scene.add(buildGroundShadow(1.25));
    }

    // Enquadra o modelo inteiro em qualquer proporção de tela: a distância da
    // câmera vem da esfera que envolve o modelo e do menor ângulo de visão.
    const sphere = new THREE.Box3().setFromObject(pivot).getBoundingSphere(new THREE.Sphere());
    // A esfera gira junto com o modelo: usamos o raio no plano XZ (pior caso da rotação).
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = (sphere.radius * 0.9) / Math.sin(Math.min(vFov, hFov) / 2);
    const elev = 0.28; // câmera levemente acima
    camera.position.set(0, sphere.center.y + Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(0, sphere.center.y, 0);

    const render = () => {
      const s = spin.current;
      if (!s.dragging && Date.now() - s.lastTouch > IDLE_RESUME_MS) {
        s.yaw += AUTO_SPEED;
        s.tilt *= 0.96; // volta suavemente ao nível
      }
      pivot.rotation.y = s.yaw;
      pivot.rotation.x = s.tilt;
      renderer.render(scene, camera);
      gl.endFrameEXP();
      frame.current = requestAnimationFrame(render);
    };
    render();
  };

  return (
    <View style={[styles.wrap, style]} {...pan.panHandlers} accessibilityLabel="3D model, drag to rotate" accessibilityRole="image">
      <GLView key={subjectKey} style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
