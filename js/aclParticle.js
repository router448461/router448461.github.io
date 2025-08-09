export class ACLParticle {
  constructor(W, H, clusterCfg, center) {
    this.W = W;
    this.H = H;
    this.cfg = clusterCfg;

    // Confinement region (circle)
    this.cx = center.cx;
    this.cy = center.cy;
    this.rConfine = center.r;

    // Initial position inside circle
    const theta = Math.random() * Math.PI * 2;
    const radius = Math.sqrt(Math.random()) * this.rConfine * 0.95;
    this.x = this.cx + Math.cos(theta) * radius;
    this.y = this.cy + Math.sin(theta) * radius;

    // Velocity
    const ang = Math.random() * Math.PI * 2;
    const spd = Math.max(
      0.05,
      this.cfg.speed.base + (Math.random() - 0.5) * this.cfg.speed.var
    );
    this.vx = Math.cos(ang) * spd;
    this.vy = Math.sin(ang) * spd;

    // Visuals
    this.baseColor = this.cfg.color;
    this.radius = this.cfg.radius;

    // State
    this.lastActive = performance.now();
    this.state = 'normal'; // 'elevated' | 'idle' | 'quarantine'
    this.quarantineEnd = 0;

    // Behavior
    this.jitter = this.cfg.behavior.jitter;
    this.trustHalo = !!this.cfg.behavior.trustHalo;
  }

  setCenter(center) {
    this.cx = center.cx;
    this.cy = center.cy;
    this.rConfine = center.r;
  }

  pingActivity() {
    this.lastActive = performance.now();
    if (this.state !== 'quarantine') {
      this.state = 'elevated';
      // decay back to normal
      const t0 = this.lastActive;
      setTimeout(() => {
        if (this.lastActive === t0 && this.state === 'elevated') {
          this.state = 'normal';
        }
      }, 4500);
    }
  }

  quarantineFor(ms = 8000) {
    const now = performance.now();
    this.state = 'quarantine';
    this.quarantineEnd = now + ms;
  }

  update() {
    const now = performance.now();

    // Idle detection
    const idleThreshold = 7000; // ms
    if (this.state !== 'quarantine' && now - this.lastActive > idleThreshold) {
      this.state = 'idle';
    }

    // Movement base
    let ax = 0, ay = 0;

    // Soft tether back to center (keeps cluster tight, military formation)
    const dx = this.cx - this.x;
    const dy = this.cy - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist > this.rConfine) {
      // Strong pull if out of bounds
      ax += (dx / dist) * 0.12;
      ay += (dy / dist) * 0.12;
    } else {
      // Gentle cohesion
      ax += (dx / (this.rConfine || 1)) * 0.02;
      ay += (dy / (this.rConfine || 1)) * 0.02;
    }

    // Quarantine slows to a crawl
    const speedFactor =
      this.state === 'quarantine' ? 0.2 :
      this.state === 'idle' ? 0.7 :
      1.0;

    // Micro jitter simulates environmental noise
    ax += (Math.random() - 0.5) * this.jitter * 0.05;
    ay += (Math.random() - 0.5) * this.jitter * 0.05;

    // Integrate
    this.vx = (this.vx + ax) * 0.995; // slight damping
    this.vy = (this.vy + ay) * 0.995;

    this.x += this.vx * speedFactor;
    this.y += this.vy * speedFactor;

    // Quarantine timeout
    if (this.state === 'quarantine' && now >= this.quarantineEnd) {
      this.state = 'normal';
      this.lastActive = now;
    }
  }

  draw(ctx) {
    let r = this.radius;
    let fill =
