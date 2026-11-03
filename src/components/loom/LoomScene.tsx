import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * The Computational Loom — hero brand object.
 *
 * A strip-weaving loom rebuilt as architecture: two stepped monoliths carry a
 * lintel, warp threads run taut to a cloth beam, and the woven cloth is set in
 * narrow strips (chevron / diamond / stair) like West African strip-cloth.
 * At the centre the cloth opens into a diamond window of compute modules: the
 * textile literally becomes hardware. A shuttle completes the next row; light
 * travels up the warp. Everything is on one modular grid (warp pitch 0.098).
 */

const C = { night: "#14123a", v200: "#d9c9fb", v400: "#9a6cf4", v500: "#793bed", v700: "#5a22b8", ink: "#090a0c", gold: "#b8860b" };

const WARP_N = 55;
const PITCH = 0.098;
const X0 = -((WARP_N - 1) / 2) * PITCH;
const AMP = 0.042;
const ROW = 0.066;
const CLOTH_Y0 = 1.5;
const CLOTH_Y1 = 3.9;
const WIN_Y = 2.7;
const WIN_R = 1.05;
const TOP_Y = 5.08;
const BEAM_Y = 1.2;

const col = (hex: string) => new THREE.Color(hex);

/* ---- materials ---- */
const mats = () => ({
  graphite: new THREE.MeshPhysicalMaterial({ color: "#1d1a4a", metalness: 0.55, roughness: 0.42, clearcoat: 0.5, clearcoatRoughness: 0.35 }),
  stone: new THREE.MeshPhysicalMaterial({ color: "#16143a", metalness: 0.25, roughness: 0.62 }),
  anodised: new THREE.MeshPhysicalMaterial({ color: C.v700, metalness: 0.9, roughness: 0.26, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  thread: new THREE.MeshStandardMaterial({ color: "#b7a2f5", emissive: C.v500, emissiveIntensity: 0.3, metalness: 0.3, roughness: 0.36 }),
  cloth: new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.12, sheen: 1, sheenColor: col(C.v400), sheenRoughness: 0.45 }),
  module: new THREE.MeshPhysicalMaterial({ color: "#211d56", metalness: 0.85, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25 }),
  glow: (i: number) => new THREE.MeshStandardMaterial({ color: "#1a1646", emissive: C.v500, emissiveIntensity: i, roughness: 0.4 }),
  gold: new THREE.MeshStandardMaterial({ color: C.gold, emissive: C.gold, emissiveIntensity: 0.9, metalness: 0.8, roughness: 0.3 }),
});

/* ---- strip-cloth motif: which colour sits at warp i on weft row r ---- */
const STRIP = 11;
const PALETTE = [col(C.night), col(C.v500), col(C.v200), col(C.v700), col("#322c86")];
function motif(i: number, r: number): THREE.Color {
  const s = Math.floor(i / STRIP);
  const c = i % STRIP;
  if (c === 0 || c === STRIP - 1) return PALETTE[0]; // seam between strips
  const d = Math.abs(c - 5);
  switch (s % 3) {
    case 0: {
      // chevron
      const v = (d + r) % 6;
      return v < 2 ? PALETTE[1] : v < 4 ? PALETTE[0] : v === 4 ? PALETTE[2] : PALETTE[3];
    }
    case 1: {
      // diamond chain
      const m = d + Math.abs((r % 10) - 5);
      return m <= 1 ? PALETTE[2] : m <= 3 ? PALETTE[1] : m === 4 ? PALETTE[3] : PALETTE[4];
    }
    default: {
      // stair
      const k = (Math.floor(c / 2) + Math.floor(r / 2)) % 5;
      return k === 0 ? PALETTE[2] : k === 1 ? PALETTE[1] : PALETTE[0];
    }
  }
}

function weftSegment(row: number, y: number, xa: number, xb: number): THREE.BufferGeometry | null {
  if (xb - xa < PITCH) return null;
  const pts: THREE.Vector3[] = [];
  const step = PITCH / 4;
  for (let x = xa; x <= xb + 1e-6; x += step) {
    const k = (x - X0) / PITCH;
    pts.push(new THREE.Vector3(x, y, AMP * Math.cos(Math.PI * k + Math.PI * row)));
  }
  const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal");
  const seg = pts.length - 1;
  const radial = 6;
  const geo = new THREE.TubeGeometry(curve, seg, 0.031, radial, false);
  const colors = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i <= seg; i++) {
    const x = curve.getPointAt(i / seg).x;
    const wi = Math.min(WARP_N - 1, Math.max(0, Math.round((x - X0) / PITCH)));
    const c = motif(wi, row);
    for (let j = 0; j <= radial; j++) {
      const o = (i * (radial + 1) + j) * 3;
      colors[o] = c.r;
      colors[o + 1] = c.g;
      colors[o + 2] = c.b;
    }
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geo;
}

function buildCloth(m: ReturnType<typeof mats>) {
  const xa = X0 - PITCH * 0.4;
  const xb = -X0 + PITCH * 0.4;
  const geos: THREE.BufferGeometry[] = [];
  const rows = Math.floor((CLOTH_Y1 - CLOTH_Y0) / ROW);
  for (let r = 0; r < rows; r++) {
    const y = CLOTH_Y0 + r * ROW;
    const w = WIN_R - Math.abs(y - WIN_Y) + 0.04; // diamond window half-width at this height
    const parts = w > 0 ? [[xa, -w], [w, xb]] : [[xa, xb]];
    for (const [a, b] of parts) {
      const g = weftSegment(r, y, a, b);
      if (g) geos.push(g);
    }
  }
  const merged = mergeGeometries(geos, false)!;
  geos.forEach((g) => g.dispose());
  const mesh = new THREE.Mesh(merged, m.cloth);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildWarp(m: ReturnType<typeof mats>) {
  const h = TOP_Y - BEAM_Y - 0.15;
  const geo = new THREE.CylinderGeometry(0.0115, 0.0115, h, 6, 1);
  const mesh = new THREE.InstancedMesh(geo, m.thread, WARP_N);
  const d = new THREE.Object3D();
  for (let i = 0; i < WARP_N; i++) {
    d.position.set(X0 + i * PITCH, BEAM_Y + 0.15 + h / 2, 0);
    d.updateMatrix();
    mesh.setMatrixAt(i, d.matrix);
  }
  mesh.castShadow = true;
  return mesh;
}

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, shadow = true) {
  // every solid is bevelled: the tiny rounded edge is what catches light and reads as machined material
  const r = Math.min(0.035, w * 0.3, h * 0.3, d * 0.3);
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = shadow;
  mesh.receiveShadow = true;
  return mesh;
}

/** Diamond chain inlay: small rotated squares, emissive, on a flat face. */
function diamondChain(count: number, pitch: number, size: number, mat: THREE.Material, goldMat: THREE.Material) {
  const g = new THREE.Group();
  const geo = new THREE.BoxGeometry(size, size, 0.02);
  for (let i = 0; i < count; i++) {
    const mesh = new THREE.Mesh(geo, i === Math.floor(count / 2) ? goldMat : mat);
    mesh.position.x = (i - (count - 1) / 2) * pitch;
    mesh.rotation.z = Math.PI / 4;
    g.add(mesh);
  }
  return g;
}

function buildArchitecture(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  // plinth: two slabs and a thin anodised edge line
  g.add(box(7.8, 0.3, 3.5, m.stone, 0, -0.15, 0));
  g.add(box(7.1, 0.2, 2.9, m.graphite, 0, 0.1, 0));
  g.add(box(7.14, 0.03, 2.94, m.anodised, 0, 0.215, 0, false));
  const plinthInlay = diamondChain(17, 0.4, 0.13, m.glow(0.9), m.gold);
  plinthInlay.position.set(0, -0.15, 1.76);
  g.add(plinthInlay);

  // two monoliths: a clean shaft, a recessed channel with a light-line, anodised collars and a stepped capital
  const H = TOP_Y - 0.2;
  for (const s of [-1, 1]) {
    const x = s * 3.05;
    g.add(box(0.84, 0.22, 0.86, m.stone, x, 0.31, 0)); // foot
    g.add(box(0.5, H - 0.22, 0.62, m.graphite, x, 0.2 + 0.22 + (H - 0.22) / 2, 0)); // shaft
    g.add(box(0.2, H - 1.1, 0.05, m.stone, x, 0.2 + H / 2 + 0.1, 0.32, false)); // recessed channel
    g.add(box(0.024, H - 1.3, 0.03, m.glow(1.8), x, 0.2 + H / 2 + 0.1, 0.35, false)); // light-line
    for (const f of [0.22, 0.5, 0.78]) g.add(box(0.62, 0.1, 0.74, m.anodised, x, 0.2 + H * f, 0)); // collars
    g.add(box(0.78, 0.14, 0.82, m.graphite, x, TOP_Y - 0.07, 0)); // capital steps
    g.add(box(0.6, 0.12, 0.68, m.anodised, x, TOP_Y + 0.04, 0, false));
    // brackets that carry the heddle bar
    g.add(box(0.16, 0.2, 0.3, m.anodised, x - s * 0.34, 4.35, 0.14));
  }
  // heddle bar: the rod that lifts alternate warp threads
  g.add(box(5.5, 0.07, 0.07, m.anodised, 0, 4.35, 0.2));

  // lintel with diamond-chain inlay
  g.add(box(7.1, 0.52, 0.78, m.graphite, 0, TOP_Y + 0.26, 0));
  g.add(box(6.0, 0.06, 0.82, m.anodised, 0, TOP_Y + 0.55, 0));
  const lintelInlay = diamondChain(15, 0.4, 0.15, m.glow(1.2), m.gold);
  lintelInlay.position.set(0, TOP_Y + 0.26, 0.4);
  g.add(lintelInlay);
  // cloth beam
  g.add(box(5.95, 0.3, 0.56, m.anodised, 0, BEAM_Y, 0));
  g.add(box(6.05, 0.06, 0.62, m.graphite, 0, BEAM_Y - 0.18, 0));
  return g;
}

/** The window: a diamond of compute modules, intensity falling off from the centre. */
function buildModules(m: ReturnType<typeof mats>) {
  const g = new THREE.Group();
  const pitch = 0.3;
  const body = new THREE.BoxGeometry(0.265, 0.265, 0.16);
  const face = new THREE.BoxGeometry(0.17, 0.17, 0.012);
  const glows = [m.glow(2.4), m.glow(1.5), m.glow(0.85), m.glow(0.4)];
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const d = Math.abs(i) + Math.abs(j);
      if (d > 3) continue;
      const mod = new THREE.Mesh(body, m.module);
      mod.position.set(i * pitch, WIN_Y + j * pitch, 0.05);
      mod.castShadow = true;
      mod.receiveShadow = true;
      g.add(mod);
      // a quiet pseudo-random few are dark: it reads as live hardware, not a lamp wall
      const idle = (i * 7 + j * 13 + 40) % 5 === 0 && d > 0;
      const f = new THREE.Mesh(face, idle ? m.glow(0.12) : glows[Math.min(d, 3)]);
      f.position.set(i * pitch, WIN_Y + j * pitch, 0.13);
      g.add(f);
    }
  }
  // gold rivet at the centre module — the mark's gold nodes, once
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16), m.gold);
  rivet.rotation.x = Math.PI / 2;
  rivet.position.set(0, WIN_Y, 0.145);
  g.add(rivet);
  return g;
}

export type LoomHandle = { capture: () => string };

export default function LoomScene({ onReady, interactive = true }: { onReady?: () => void; interactive?: boolean }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const small = window.innerWidth < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false; // geometry is static; shadows are baked once
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.6;

    const camera = new THREE.PerspectiveCamera(22, 1, 0.1, 100);
    const target = new THREE.Vector3(0, 3.3, 0);

    // lighting: warm-white key high-left, violet rim behind-right, window glow
    const key = new THREE.DirectionalLight("#ffffff", 3.6);
    key.position.set(-6.5, 10, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
    Object.assign(key.shadow.camera, { left: -7, right: 7, top: 8, bottom: -3, near: 1, far: 30 });
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    key.shadow.radius = 5;
    scene.add(key);
    const rim = new THREE.DirectionalLight(C.v400, 4.2);
    rim.position.set(7, 4.5, -6);
    scene.add(rim);
    scene.add(new THREE.HemisphereLight("#9a8cff", "#0b0a22", 0.55));
    const glow = new THREE.PointLight(C.v500, 14, 5.5, 1.6);
    glow.position.set(0, WIN_Y, 1.1);
    scene.add(glow);

    const m = mats();
    const loom = new THREE.Group();
    loom.add(buildArchitecture(m), buildWarp(m), buildCloth(m), buildModules(m));

    // shuttle + the weft it is laying
    const shuttle = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.36, 6, 12), m.anodised);
    body.rotation.z = Math.PI / 2;
    shuttle.add(body);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), m.glow(3));
    tip.position.x = 0.23;
    shuttle.add(tip);
    shuttle.position.set(0, CLOTH_Y1 + 0.1, 0.1);
    shuttle.castShadow = true;
    loom.add(shuttle);
    const weft = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1, 8), m.glow(1.8));
    weft.rotation.z = Math.PI / 2;
    loom.add(weft);

    // light moving up selected warp threads
    const pulseGeo = new THREE.SphereGeometry(0.03, 10, 10);
    const pulses = [7, 14, 20, 27, 33, 41, 48].map((wi, k) => {
      const p = new THREE.Mesh(pulseGeo, m.glow(3.2));
      p.userData = { x: X0 + wi * PITCH, speed: 0.35 + (k % 3) * 0.12, off: k * 0.37 };
      loom.add(p);
      return p;
    });

    // soft contact shadow + ground shadow
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.5 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.301;
    floor.receiveShadow = true;
    scene.add(floor);
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const cx = cv.getContext("2d")!;
    const gr = cx.createRadialGradient(128, 128, 10, 128, 128, 128);
    gr.addColorStop(0, "rgba(0,0,0,0.75)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    cx.fillStyle = gr;
    cx.fillRect(0, 0, 256, 256);
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(11, 6.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true, depthWrite: false }));
    contact.rotation.x = -Math.PI / 2;
    contact.position.y = -0.3;
    scene.add(contact);
    // violet spill from the window glow onto the ground
    const cv2 = document.createElement("canvas");
    cv2.width = cv2.height = 256;
    const cx2 = cv2.getContext("2d")!;
    const g2 = cx2.createRadialGradient(128, 128, 0, 128, 128, 128);
    g2.addColorStop(0, "rgba(121,59,237,0.38)");
    g2.addColorStop(1, "rgba(121,59,237,0)");
    cx2.fillStyle = g2;
    cx2.fillRect(0, 0, 256, 256);
    const spill = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 5.6), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    spill.rotation.x = -Math.PI / 2;
    spill.position.set(0, -0.298, 1.2);
    scene.add(spill);

    scene.add(loom);

    /* ---- sizing / camera framing ---- */
    const az = THREE.MathUtils.degToRad(27);
    const el0 = THREE.MathUtils.degToRad(13);
    let yaw = 0;
    let pitch = 0;
    const size = () => {
      const w = el.clientWidth || 600;
      const h = el.clientHeight || 600;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
    };
    const place = () => {
      // distance so the whole object (≈ 8.4 wide × 6.4 tall) fits with margin
      const vfov = THREE.MathUtils.degToRad(camera.fov);
      const hfov = 2 * Math.atan(Math.tan(vfov / 2) * camera.aspect);
      const dist = Math.max(8.3 / (2 * Math.tan(vfov / 2)), 9.6 / (2 * Math.tan(hfov / 2)));
      const a = az + yaw;
      const e = el0 + pitch;
      camera.position.set(
        target.x + dist * Math.sin(a) * Math.cos(e),
        target.y + dist * Math.sin(e),
        target.z + dist * Math.cos(a) * Math.cos(e),
      );
      camera.lookAt(target);
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(() => {
      size();
      place();
      renderer.shadowMap.needsUpdate = true;
    });
    ro.observe(el);
    size();
    place();
    renderer.shadowMap.needsUpdate = true;

    /* ---- interaction (parallax orbit), visibility, loop ---- */
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let tx = 0;
    let ty = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    if (interactive && !reduce && window.matchMedia("(hover: hover)").matches) window.addEventListener("pointermove", onMove);

    let visible = true;
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting), { threshold: 0.01 });
    io.observe(el);

    const clock = new THREE.Clock();
    let raf = 0;
    let told = false;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const t = clock.getElapsedTime();
      if (!reduce) {
        yaw += (tx * 0.1 - yaw) * 0.05;
        pitch += (-ty * 0.04 - pitch) * 0.05;
        place();
        // shuttle sweeps a row; the weft it has laid trails behind it
        const sx = Math.sin(t * 0.42) * 2.55;
        shuttle.position.x = sx;
        shuttle.rotation.z = Math.cos(t * 0.42) > 0 ? 0 : Math.PI;
        const left = X0 - 0.05;
        weft.scale.y = Math.max(0.01, sx - left);
        weft.position.set((sx + left) / 2, CLOTH_Y1 + 0.1, 0.06);
        for (const p of pulses) {
          const u = (t * p.userData.speed + p.userData.off) % 1;
          p.position.set(p.userData.x, BEAM_Y + 0.4 + u * (TOP_Y - BEAM_Y - 0.6), 0.03);
          p.scale.setScalar(Math.sin(u * Math.PI));
        }
        glow.intensity = 13 + Math.sin(t * 1.3) * 2.2;
      }
      renderer.render(scene, camera);
      if (!told) {
        told = true;
        onReady?.();
      }
    };
    frame();

    // dev helper: renders one frame and returns a PNG/WebP data URL for the poster
    (window as unknown as { __loomCapture?: (w: number, h: number, type?: string) => string }).__loomCapture = (w, h, type = "image/webp") => {
      const prev = [renderer.domElement.width, renderer.domElement.height];
      const pr = renderer.getPixelRatio();
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      yaw = 0;
      pitch = 0;
      place();
      renderer.render(scene, camera);
      const url = renderer.domElement.toDataURL(type, 0.92);
      renderer.setPixelRatio(pr);
      renderer.setSize(prev[0] / pr, prev[1] / pr, false);
      size();
      place();
      return url;
    };

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady, interactive]);

  return <div ref={host} className="loom3d" />;
}
