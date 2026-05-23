import type { Grain, Bowl, Particle, FloatingText, GameState } from './types'
import { RICE_CONFIG } from './constants'

// ─── Rice grain ───────────────────────────────────────────────

export function drawRiceGrain(ctx: CanvasRenderingContext2D, grain: Grain) {
  const cfg = RICE_CONFIG[grain.type]
  const s = grain.animScale
  const w = grain.w * s
  const h = grain.h * s

  ctx.save()
  ctx.translate(grain.x, grain.y)
  ctx.rotate(grain.angle)

  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetY = 1.5

  const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
  grad.addColorStop(0, cfg.g0)
  grad.addColorStop(0.4, cfg.g1)
  grad.addColorStop(1, cfg.g2)

  ctx.beginPath()
  ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0

  ctx.beginPath()
  ctx.moveTo(-w * 0.25, 0)
  ctx.quadraticCurveTo(0, -h * 0.2, w * 0.25, 0)
  ctx.strokeStyle = cfg.crease
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(w * 0.22, -h * 0.12, Math.max(1, w * 0.04), 0, Math.PI * 2)
  ctx.fillStyle = cfg.germ
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(-w * 0.15, -h * 0.3, w * 0.22, h * 0.18, -0.4, 0, Math.PI * 2)
  ctx.fillStyle = cfg.highlight
  ctx.fill()

  ctx.restore()
}

// ─── Bowl ─────────────────────────────────────────────────────

export function drawBowl(ctx: CanvasRenderingContext2D, bowl: Bowl) {
  ctx.save()

  const shake = bowl.shakeTime > 0 ? Math.sin(bowl.shakeTime * 30) * 3 : 0
  const bx = bowl.x + shake
  const by = bowl.y
  const bw = bowl.w
  const bh = bowl.h
  const c = RICE_CONFIG[bowl.type]

  // Shadow under bowl
  ctx.shadowColor = 'rgba(0,0,0,0.4)'
  ctx.shadowBlur = 16
  ctx.shadowOffsetY = 5

  // Outer body
  ctx.beginPath()
  ctx.moveTo(bx + bw * 0.06, by + bh * 0.12)
  ctx.quadraticCurveTo(bx + bw * 0.02, by + bh * 0.55, bx + bw * 0.22, by + bh * 0.88)
  ctx.quadraticCurveTo(bx + bw * 0.5, by + bh * 0.98, bx + bw * 0.78, by + bh * 0.88)
  ctx.quadraticCurveTo(bx + bw * 0.98, by + bh * 0.55, bx + bw * 0.94, by + bh * 0.12)
  ctx.quadraticCurveTo(bx + bw * 0.5, by - bh * 0.04, bx + bw * 0.06, by + bh * 0.12)
  ctx.closePath()

  const bg = ctx.createLinearGradient(bx, by + bh * 0.1, bx, by + bh)
  bg.addColorStop(0, c.g0 + 'dd')
  bg.addColorStop(0.35, c.g1 + 'cc')
  bg.addColorStop(0.7, c.g2 + 'cc')
  bg.addColorStop(1, c.g0 + '77')
  ctx.fillStyle = bg
  ctx.fill()

  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  // Interior (elliptical opening showing depth)
  const ix = bx + bw / 2
  const iy = by + bh * 0.14
  const irx = bw * 0.4
  const iry = bh * 0.2

  ctx.beginPath()
  ctx.ellipse(ix, iy, irx, iry, 0, 0, Math.PI * 2)
  const ig = ctx.createRadialGradient(ix - irx * 0.1, iy - iry * 0.1, 0, ix, iy, irx)
  ig.addColorStop(0, '#0f0f1a')
  ig.addColorStop(0.5, c.g2 + 'cc')
  ig.addColorStop(1, c.g2 + '77')
  ctx.fillStyle = ig
  ctx.fill()

  ctx.beginPath()
  ctx.ellipse(ix, iy, irx * 0.7, iry * 0.6, 0, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fill()

  // Rim highlight
  ctx.beginPath()
  ctx.ellipse(ix, iy, irx, iry, 0, 0, Math.PI)
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Body highlight
  ctx.beginPath()
  ctx.ellipse(bx + bw * 0.23, by + bh * 0.55, bw * 0.1, bh * 0.08, -0.2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fill()

  // Foot / base
  const fw = bw * 0.28
  const fh = bh * 0.06
  const fy = by + bh * 0.92
  ctx.beginPath()
  ctx.ellipse(bx + bw / 2, fy, fw / 2, fh / 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = c.g2 + '88'
  ctx.fill()

  // Label
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 15px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 4
  ctx.fillText(bowl.label, bx + bw / 2, by + bh * 0.6)

  ctx.restore()
}

// ─── Particles ────────────────────────────────────────────────

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const a = p.life / p.maxLife
    ctx.globalAlpha = a
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

// ─── Floating texts ───────────────────────────────────────────

export function drawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (const ft of texts) {
    const a = ft.life / 60
    ctx.globalAlpha = a
    ctx.fillStyle = ft.color
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(ft.text, ft.x, ft.y)
  }
  ctx.globalAlpha = 1
}

// ─── Slingshot / throw helper ─────────────────────────────────

export function drawSlingshotUI(ctx: CanvasRenderingContext2D, state: GameState) {
  const mx = state.mx
  const my = state.my

  // Pull-back line and trajectory preview
  if (state.throwGrab) {
    const { origX, origY } = state.throwGrab
    const dx = origX - mx
    const dy = origY - my
    const dist = Math.sqrt(dx * dx + dy * dy)
    const pull = Math.min(1, dist / 200)

    ctx.save()

    // Pull line
    ctx.beginPath()
    ctx.moveTo(origX, origY)
    ctx.lineTo(mx, my)
    ctx.strokeStyle = `rgba(255,200,50,${0.2 + pull * 0.4})`
    ctx.lineWidth = 2 + pull * 3
    ctx.setLineDash([6, 4])
    ctx.stroke()
    ctx.setLineDash([])

    // Predicted trajectory
    const speed = Math.min(30, 4 + dist * 0.15)
    const nx = dx / dist
    const ny = dy / dist
    const vx = nx * speed
    const vy = ny * speed - 4
    ctx.beginPath()
    ctx.moveTo(origX, origY)
    let px = origX, py = origY
    let pvx = vx, pvy = vy
    for (let t = 0; t < 40; t++) {
      pvx *= 0.99
      pvy += 0.18
      px += pvx
      py += pvy
      ctx.lineTo(px, py)
    }
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + pull * 0.2})`
    ctx.lineWidth = 1.5
    ctx.stroke()

    ctx.restore()
  }

  // Ctrl-held indicator
  if (state.ctrlHeld && !state.throwGrab) {
    ctx.save()
    ctx.beginPath()
    ctx.arc(mx, my, 22, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,200,50,0.5)'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 4])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(255,200,50,0.7)'
    ctx.font = 'bold 11px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚡', mx, my - 32)
    ctx.restore()
  }

  // Tweezers
  if (state.down && !state.throwGrab) {
    ctx.save()
    ctx.strokeStyle = '#94a3b8'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(mx - 10, my - 30)
    ctx.lineTo(mx, my)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(mx + 10, my - 30)
    ctx.lineTo(mx, my)
    ctx.stroke()
    ctx.restore()
  }
}
