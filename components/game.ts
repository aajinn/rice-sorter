import type { Grain, Bowl, Particle, FloatingText, RiceCounts, RiceType } from './types'
import { getActiveTypes, getRiceCount, RICE_CONFIG, ALL_TYPES } from './constants'

// ─── Bowl creation ────────────────────────────────────────────

export function createBowls(cw: number, lvl: number): Bowl[] {
  const active = getActiveTypes(lvl)
  const bw = Math.min(170, Math.max(90, (cw - 40) / active.length - 8))
  const bh = 78
  const totalW = active.length * bw + (active.length - 1) * 10
  const sx = (cw - totalW) / 2

  return active.map((type, i) => ({
    x: sx + i * (bw + 10),
    y: 85,
    w: bw,
    h: bh,
    label: RICE_CONFIG[type].label,
    type,
    shakeTime: 0,
  }))
}

// ─── Rice spawning ────────────────────────────────────────────

export function spawnRice(cw: number, ch: number, lvl: number) {
  const active = getActiveTypes(lvl)
  const count = getRiceCount(lvl)
  const grains: Grain[] = []
  const remaining: RiceCounts = { white: 0, brown: 0, red: 0, black: 0 }

  for (let i = 0; i < count; i++) {
    const type = active[Math.floor(Math.random() * active.length)]
    remaining[type]++
    grains.push({
      x: Math.random() * (cw - 250) + 125,
      y: Math.random() * (ch - 460) + 180,
      w: 20 + Math.random() * 6,
      h: 7 + Math.random() * 3,
      angle: Math.random() * Math.PI,
      vx: 0, vy: 0,
      type,
      placed: false,
      thrown: false,
      animScale: 1,
      animTime: 0,
    })
  }

  return { grains, remaining, bowls: createBowls(cw, lvl) }
}

// ─── Thrown grain physics ─────────────────────────────────────

export function stepThrownGrain(grain: Grain, gravity: number) {
  grain.vy += gravity
  grain.x += grain.vx
  grain.y += grain.vy
  grain.angle += 0.08

  // drag
  grain.vx *= 0.99
}

export function isGrainOffscreen(grain: Grain, cw: number, ch: number) {
  return grain.x < -50 || grain.x > cw + 50 || grain.y > ch + 50
}

export function respawnGrain(grain: Grain, cw: number, ch: number) {
  grain.x = Math.random() * (cw - 250) + 125
  grain.y = Math.random() * (ch - 460) + 180
  grain.vx = 0
  grain.vy = 0
  grain.thrown = false
  grain.angle = Math.random() * Math.PI
}

// ─── Bowl collision ───────────────────────────────────────────

export function findBowlAt(grain: Grain, bowls: Bowl[]): Bowl | null {
  for (const bowl of bowls) {
    if (
      grain.x >= bowl.x && grain.x <= bowl.x + bowl.w &&
      grain.y >= bowl.y && grain.y <= bowl.y + bowl.h
    ) {
      return bowl
    }
  }
  return null
}

// ─── Correct placement ────────────────────────────────────────

export function scoreCorrectPlacement(
  grain: Grain, bowl: Bowl,
  state: { remaining: RiceCounts; score: number; level: number },
): FloatingText {
  grain.placed = true
  state.remaining[grain.type]--
  state.score += 10 + state.level
  bowl.shakeTime = 0.3

  return {
    x: bowl.x + bowl.w / 2,
    y: bowl.y - 8,
    text: '+1',
    life: 55,
    color: '#4ade80',
  }
}

// ─── Wrong bowl (throw) ───────────────────────────────────────

export function scoreWrongBowl(
  grain: Grain,
  bowl: Bowl,
  state: { remaining: RiceCounts },
): { text: FloatingText; debris: Particle[] } {
  grain.placed = true
  state.remaining[grain.type]--

  const debris: Particle[] = []
  for (let p = 0; p < 8; p++) {
    const a = Math.random() * Math.PI * 2
    const sp = 30 + Math.random() * 60
    debris.push({
      x: grain.x, y: grain.y,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      life: 20 + Math.random() * 15,
      maxLife: 35,
      color: '#ef4444',
      size: 2 + Math.random() * 2,
    })
  }

  return {
    text: {
      x: bowl.x + bowl.w / 2,
      y: bowl.y - 8,
      text: '✗',
      life: 35,
      color: '#f87171',
    },
    debris,
  }
}

// ─── Drag-drop wrong bowl ─────────────────────────────────────

export function scoreDragWrong(bowl: Bowl): FloatingText {
  return {
    x: bowl.x + bowl.w / 2,
    y: bowl.y - 8,
    text: '✗',
    life: 35,
    color: '#f87171',
  }
}

// ─── Level complete check ─────────────────────────────────────

export function isLevelComplete(remaining: RiceCounts) {
  return ALL_TYPES.every(t => remaining[t] === 0)
}

// ─── Level-up particles ───────────────────────────────────────

export function spawnLevelParticles(cw: number, ch: number): Particle[] {
  const colors = ['#f5f0e8', '#c4a44a', '#c4463a', '#4a2c7a', '#ffffff', '#fbbf24', '#34d399']
  const out: Particle[] = []
  for (let i = 0; i < 60; i++) {
    const a = Math.random() * Math.PI * 2
    const sp = 120 + Math.random() * 200
    out.push({
      x: cw / 2, y: ch / 2,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50,
      life: 50 + Math.random() * 30,
      maxLife: 50 + Math.random() * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
    })
  }
  return out
}

// ─── Throw velocity ───────────────────────────────────────────

export function calcThrowVelocity(
  origX: number, origY: number,
  releaseX: number, releaseY: number,
): { vx: number; vy: number } {
  const dx = origX - releaseX
  const dy = origY - releaseY
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const speed = Math.min(30, 4 + dist * 0.15)
  return {
    vx: (dx / dist) * speed,
    vy: (dy / dist) * speed - 4,
  }
}

// ─── Hit-test helper ──────────────────────────────────────────

export function hitTestGrain(grain: Grain, px: number, py: number): boolean {
  const dx = grain.x - px
  const dy = grain.y - py
  return Math.sqrt(dx * dx + dy * dy) < Math.max(grain.w, grain.h) * 0.8
}
