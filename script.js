// script.js
const fireC  = document.getElementById('fire-canvas')
const iceC   = document.getElementById('ice-canvas')
const blendC = document.getElementById('blend-canvas')
const fCtx   = fireC .getContext('2d')
const iCtx   = iceC  .getContext('2d')
const bCtx   = blendC.getContext('2d')

let W, H, midY, domeR

function resize() {
  W = innerWidth; H = innerHeight
  [fireC, iceC, blendC].forEach(c => {
    c.width  = W
    c.height = H
  })
  midY  = H / 2
  domeR = Math.min(W * 0.45, H * 0.4)
}

window.addEventListener('resize', resize)
resize()

class Particle {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class FireParticle extends Particle {
  constructor() {
    super(Math.random() * W, H + 30 * Math.random())
    this.vx   = (Math.random() - 0.5) * 1.2
    this.vy   = - (2 + Math.random() * 2)
    this.life = 50 + Math.random() * 50
    this.r    = 10 + Math.random() * 15
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    this.life--
    if (this.y < midY || this.life < 0) {
      Object.assign(this, new FireParticle())
    }
  }
  draw(ctx) {
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.shadowColor = 'rgba(255,160,0,0.8)'
    ctx.shadowBlur  = this.r * .8
    const grd = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.r
    )
    grd.addColorStop(0, 'rgba(255,255,200,0.9)')
    grd.addColorStop(1, 'rgba(255,0,0,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

class SnowParticle extends Particle {
  constructor() {
    super(Math.random() * W, -10 - H * 0.1 * Math.random())
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = 1 + Math.random() * 2
    this.r  = 2 + Math.random() * 3
  }
  update() {
    this.x += this.vx
    this.y += this.vy
    const dx = this.x - W/2
    const dy = this.y - midY
    if (dx*dx + dy*dy > domeR*domeR) {
      Object.assign(this, new SnowParticle())
    }
  }
  draw(ctx) {
    ctx.fillStyle = 'rgba(230,255,255,0.9)'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

const fires = Array.from({ length: 150 }, () => new FireParticle())
const snows = Array.from({ length: 250 }, () => new SnowParticle())

function animate() {
  fCtx.clearRect(0, 0, W, H)
  iCtx.clearRect(0, 0, W, H)
  bCtx.clearRect(0, 0, W, H)

  fires.forEach(p => { p.update(); p.draw(fCtx) })

  iCtx.save()
  iCtx.beginPath()
  iCtx.arc(W/2, midY, domeR, 0, Math.PI, true)
  iCtx.clip()
  snows.forEach(p => { p.update(); p.draw(iCtx) })
  iCtx.restore()

  iCtx.beginPath()
  iCtx.arc(W/2, midY, domeR, 0, Math.PI, true)
  iCtx.lineWidth = 3
  iCtx.strokeStyle = 'white'
  iCtx.stroke()

  const band = 40
  bCtx.save()
  bCtx.filter = 'blur(16px)'
  bCtx.globalAlpha = 0.6
  bCtx.beginPath()
  bCtx.rect(0, midY - band/2, W, band)
  bCtx.clip()
  bCtx.drawImage(fireC, 0, 0)
  bCtx.drawImage(iceC , 0, 0)
  bCtx.restore()

  requestAnimationFrame(animate)
}

animate()
```
