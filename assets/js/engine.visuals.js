import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

export function startConstellation() {
  const PARTICLE_COUNT = 110;
  const LINK_DISTANCE = 57;
  const PARTICLE_SIZE = 2.4;
  const COLOR_PARTICLE = 0x5fb3ff;
  const COLOR_LINK = 0x84c5ff;
  const COLOR_TRACER = 0xffffff;
  const SCENE_DEPTH = 170;
  const LINK_OPACITY = 0.17;
  const TRACER_OPACITY = 0.38;

  const canvas = document.getElementById("constellationCanvas");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0b0f16);

  let w = window.innerWidth;
  let h = window.innerHeight;
  let aspect = w / h;
  const camera = new THREE.PerspectiveCamera(62, aspect, 0.1, 900);
  camera.position.z = SCENE_DEPTH;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x0b0f16, 1);

  window.addEventListener("resize", () => {
    w = window.innerWidth;
    h = window.innerHeight;
    aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });

  // Particles
  const particles = [];
  const particleGeometry = new THREE.SphereGeometry(PARTICLE_SIZE, 10, 10);
  const particleMaterial = new THREE.MeshBasicMaterial({ color: COLOR_PARTICLE });
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
    mesh.position.set(
      THREE.MathUtils.randFloatSpread(w * 0.7),
      THREE.MathUtils.randFloatSpread(h * 0.7),
      THREE.MathUtils.randFloatSpread(SCENE_DEPTH * 0.7)
    );
    mesh.userData = {
      velocity: new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(0.8),
        THREE.MathUtils.randFloatSpread(0.8),
        THREE.MathUtils.randFloatSpread(0.7)
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
      this.speed = 0.003 + Math.random() * 0.003;
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
  for (let i = 0; i < Math.min(30, links.length); i += Math.floor(links.length / 30) || 1) {
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
        const limit = axis === 'z' ? SCENE_DEPTH*0.4 : (axis === 'x' ? w*0.35 : h*0.35);
        if (mesh.position[axis] < -limit || mesh.position[axis] > limit) {
          mesh.userData.velocity[axis] *= -1;
          mesh.position[axis] = clamp(mesh.position[axis], -limit, limit);
        }
        // random wander
        mesh.userData.velocity[axis] += THREE.MathUtils.randFloatSpread(0.012);
        mesh.userData.velocity[axis] = clamp(mesh.userData.velocity[axis], -0.85, 0.85);
      });
    }

    // Camera subtle movement (military realism)
    const t = performance.now() * 0.00013;
    camera.position.x = Math.sin(t) * 2.5;
    camera.position.y = Math.cos(t) * 1.9;
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
      const geom = new THREE.SphereGeometry(PARTICLE_SIZE * 0.55, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ color: COLOR_TRACER, transparent: true, opacity: TRACER_OPACITY });
      const sphere = new THREE.Mesh(geom, mat);
      sphere.position.copy(pos);
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
