import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function startConstellation() {
  const PARTICLE_COUNT = 75;
  const LINK_DISTANCE = 33;
  const PARTICLE_SIZE = 1.1;
  const COLOR_PARTICLE = 0x74bfff;
  const COLOR_LINK = 0x94cfff;
  const COLOR_TRACER = 0xffffff;
  const SCENE_DEPTH = 90;
  const LINK_OPACITY = 0.15;
  const TRACER_OPACITY = 0.38;

  const canvas = document.getElementById("constellationCanvas");
  const scene = new THREE.Scene();

  scene.background = null; // use CSS background for vignette

  let w = window.innerWidth;
  let h = window.innerHeight;
  let aspect = w / h;
  const camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 700);
  camera.position.z = SCENE_DEPTH;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setSize(w, h, false);
  renderer.setPixelRatio(window.devicePixelRatio); // sharp on retina screens

  window.addEventListener("resize", () => {
    w = window.innerWidth;
    h = window.innerHeight;
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    renderer.setPixelRatio(window.devicePixelRatio);
  });

  // Particles
  const particles = [];
  const particleGeometry = new THREE.SphereGeometry(PARTICLE_SIZE, 12, 12);
  const particleMaterial = new THREE.MeshBasicMaterial({
    color: COLOR_PARTICLE,
    transparent: true,
    opacity: 0.93
  });
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    mesh.position.set(
      THREE.MathUtils.randFloatSpread(w * 0.28),
      THREE.MathUtils.randFloatSpread(h * 0.22),
      THREE.MathUtils.randFloatSpread(SCENE_DEPTH * 0.22)
    );
    mesh.userData = {
      velocity: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(0.55),
        THREE.MathUtils.randFloatSpread(0.55),
        THREE.MathUtils.randFloatSpread(0.49)
      )
    };
    particles.push(mesh);
    scene.add(mesh);
  }

  // Links
  function getLinks() {
    const links = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      for (let j = i + 1; j < PARTICLE_COUNT; j++) {
        const a = particles[i].position;
        const b = particles[j].position;
        const d = a.distanceTo(b);
        if (d < LINK_DISTANCE) {
          links.push([i, j, d]);
        }
      }
    }
    return links;
  }

  // Tracer "data packets"
  class Tracer {
    constructor(aIdx, bIdx) {
      this.aIdx = aIdx;
      this.bIdx = bIdx;
      this.t = Math.random();
      this.speed = 0.0024 + Math.random() * 0.0024;
      this.forward = Math.random() < 0.5;
    }
    step() {
      this.t += this.speed * (this.forward ? 1 : -1);
      if (this.t > 1) this.t = 0;
      if (this.t < 0) this.t = 1;
    }
    pos() {
      const a = particles[this.aIdx].position;
      const b = particles[this.bIdx].position;
      return new THREE.Vector3().lerpVectors(a, b, this.t);
    }
  }

  // Pick links for tracers
  let links = getLinks();
  const tracerLinks = [];
  for (let i = 0; i < Math.min(22, links.length); i += Math.floor(links.length / 22) || 1) {
    tracerLinks.push(links[i]);
  }
  const tracers = tracerLinks.map(l => new Tracer(l[0], l[1]));

  // Animation loop
  function animate() {
    // Move particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mesh = particles[i];
      mesh.position.add(mesh.userData.velocity);

      // Bounce softly in box
      ['x','y','z'].forEach(axis => {
        const limit = axis === 'z' ? SCENE_DEPTH*0.19 : (axis === 'x' ? w*0.14 : h*0.13);
        if (mesh.position[axis] < -limit || mesh.position[axis] > limit) {
          mesh.userData.velocity[axis] *= -1;
          mesh.position[axis] = clamp(mesh.position[axis], -limit, limit);
        }
        // random wander
        mesh.userData.velocity[axis] += THREE.MathUtils.randFloatSpread(0.008);
        mesh.userData.velocity[axis] = clamp(mesh.userData.velocity[axis], -0.55, 0.55);
      });
    }

    // Camera subtle movement
    const t = performance.now() * 0.00015;
    camera.position.x = Math.sin(t) * 1.3;
    camera.position.y = Math.cos(t) * 1.1;
    camera.lookAt(0, 0, 0);

    // Draw links
    links = getLinks();
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].isLine) scene.remove(scene.children[i]);
    }
    links.forEach(([aIdx, bIdx, d]) => {
      const a = particles[aIdx].position;
      const b = particles[bIdx].position;
      const mat = new THREE.LineBasicMaterial({ color: COLOR_LINK, transparent: true, opacity: LINK_OPACITY });
      const geom = new THREE.BufferGeometry().setFromPoints([a, b]);
      const line = new THREE.Line(geom, mat);
      scene.add(line);
    });

    // Tracer animation
    tracers.forEach(tracer => tracer.step());
    for (let i = 0; i < tracers.length; i++) {
      const pos = tracers[i].pos();
      const geom = new THREE.SphereGeometry(PARTICLE_SIZE * 0.56, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: COLOR_TRACER, transparent: true, opacity: TRACER_OPACITY });
      const sphere = new THREE.Mesh(geom, mat);
      sphere.position.copy(pos);
      // subtle glow via material
      mat.emissive = new THREE.Color(COLOR_TRACER);
      mat.emissiveIntensity = 0.42;
      scene.add(sphere);
    }

    renderer.render(scene, camera);

    // Remove tracer spheres after render
    for (let i = scene.children.length - 1; i >= 0; i--) {
      if (scene.children[i].isMesh && !particles.includes(scene.children[i])) {
        scene.remove(scene.children[i]);
      }
    }

    requestAnimationFrame(animate);
  }

  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  animate();
}
