import { describe, it, expect } from 'vitest'
import type { Grain, Bowl } from '@/components/types'
import {
  createBowls, spawnRice, stepThrownGrain, isGrainOffscreen,
  respawnGrain, findBowlAt, scoreCorrectPlacement, scoreWrongBowl,
  scoreDragWrong, isLevelComplete, spawnLevelParticles,
  calcThrowVelocity, hitTestGrain,
} from '@/components/game'

function makeGrain(overrides: Partial<Grain> = {}): Grain {
  return {
    x: 200, y: 400, w: 20, h: 8, angle: 0,
    vx: 0, vy: 0, type: 'white', placed: false,
    thrown: false, animScale: 1, animTime: 0,
    ...overrides,
  }
}

function makeBowl(overrides: Partial<Bowl> = {}): Bowl {
  return {
    x: 100, y: 80, w: 150, h: 78,
    label: 'WHITE', type: 'white', shakeTime: 0,
    ...overrides,
  }
}

describe('createBowls', () => {
  it('returns 2 bowls for level 1', () => {
    const bowls = createBowls(800, 1)
    expect(bowls).toHaveLength(2)
  })

  it('returns 4 bowls for level 10', () => {
    const bowls = createBowls(800, 10)
    expect(bowls).toHaveLength(4)
  })

  it('bowls are positioned within canvas width', () => {
    const cw = 800
    const bowls = createBowls(cw, 5)
    for (const b of bowls) {
      expect(b.x).toBeGreaterThanOrEqual(0)
      expect(b.x + b.w).toBeLessThanOrEqual(cw)
    }
  })

  it('bowls have correct labels matching their type', () => {
    const bowls = createBowls(800, 1)
    expect(bowls[0].label).toBe('WHITE')
    expect(bowls[0].type).toBe('white')
    expect(bowls[1].label).toBe('BROWN')
    expect(bowls[1].type).toBe('brown')
  })
})

describe('spawnRice', () => {
  it('returns correct structure', () => {
    const result = spawnRice(800, 600, 1)
    expect(result).toHaveProperty('grains')
    expect(result).toHaveProperty('remaining')
    expect(result).toHaveProperty('bowls')
  })

  it('spawns expected number of grains', () => {
    const { grains } = spawnRice(800, 600, 1)
    expect(grains.length).toBeGreaterThan(0)
  })

  it('all grains have required properties', () => {
    const { grains } = spawnRice(800, 600, 1)
    for (const g of grains) {
      expect(g).toHaveProperty('x')
      expect(g).toHaveProperty('y')
      expect(g).toHaveProperty('type')
      expect(g.placed).toBe(false)
    }
  })
})

describe('stepThrownGrain', () => {
  it('applies gravity to vy', () => {
    const g = makeGrain({ vy: 0 })
    stepThrownGrain(g, 0.18)
    expect(g.vy).toBe(0.18)
    expect(g.y).toBe(400.18)
  })

  it('applies drag to vx', () => {
    const g = makeGrain({ vx: 10 })
    stepThrownGrain(g, 0.18)
    expect(g.vx).toBeLessThan(10)
  })
})

describe('isGrainOffscreen', () => {
  it('returns false for grain in bounds', () => {
    const g = makeGrain({ x: 400, y: 300 })
    expect(isGrainOffscreen(g, 800, 600)).toBe(false)
  })

  it('returns true for grain far left', () => {
    const g = makeGrain({ x: -60, y: 300 })
    expect(isGrainOffscreen(g, 800, 600)).toBe(true)
  })

  it('returns true for grain below screen', () => {
    const g = makeGrain({ x: 400, y: 700 })
    expect(isGrainOffscreen(g, 800, 600)).toBe(true)
  })
})

describe('respawnGrain', () => {
  it('resets thrown and velocity', () => {
    const g = makeGrain({ thrown: true, vx: 20, vy: 15, x: -100, y: -100 })
    respawnGrain(g, 800, 600)
    expect(g.thrown).toBe(false)
    expect(g.vx).toBe(0)
    expect(g.vy).toBe(0)
  })

  it('repositions within canvas', () => {
    const g = makeGrain({ x: 0, y: 0 })
    respawnGrain(g, 800, 600)
    expect(g.x).toBeGreaterThanOrEqual(125)
    expect(g.x).toBeLessThanOrEqual(800 - 125)
    expect(g.y).toBeGreaterThanOrEqual(180)
    expect(g.y).toBeLessThanOrEqual(600 - 460 + 180)
  })
})

describe('findBowlAt', () => {
  it('returns bowl when grain is inside', () => {
    const bowl = makeBowl({ x: 100, y: 80, w: 150, h: 78 })
    const g = makeGrain({ x: 175, y: 119 })
    expect(findBowlAt(g, [bowl])).toBe(bowl)
  })

  it('returns null when grain is outside', () => {
    const bowl = makeBowl({ x: 100, y: 80, w: 150, h: 78 })
    const g = makeGrain({ x: 10, y: 10 })
    expect(findBowlAt(g, [bowl])).toBeNull()
  })

  it('returns the correct bowl among multiple', () => {
    const bowls = [
      makeBowl({ x: 50, y: 80, w: 150, h: 78, type: 'white', label: 'WHITE' }),
      makeBowl({ x: 250, y: 80, w: 150, h: 78, type: 'brown', label: 'BROWN' }),
    ]
    const g = makeGrain({ x: 325, y: 119 })
    expect(findBowlAt(g, bowls)?.type).toBe('brown')
  })
})

describe('scoreCorrectPlacement', () => {
  it('marks grain as placed', () => {
    const g = makeGrain()
    const bowl = makeBowl()
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 }, score: 0, level: 1 }
    scoreCorrectPlacement(g, bowl, state)
    expect(g.placed).toBe(true)
  })

  it('decrements remaining count', () => {
    const g = makeGrain()
    const bowl = makeBowl()
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 }, score: 0, level: 1 }
    scoreCorrectPlacement(g, bowl, state)
    expect(state.remaining.white).toBe(0)
  })

  it('adds score based on level', () => {
    const g = makeGrain()
    const bowl = makeBowl()
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 }, score: 0, level: 5 }
    scoreCorrectPlacement(g, bowl, state)
    expect(state.score).toBe(15)
  })

  it('returns a floating text', () => {
    const g = makeGrain()
    const bowl = makeBowl()
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 }, score: 0, level: 1 }
    const ft = scoreCorrectPlacement(g, bowl, state)
    expect(ft.text).toBe('+1')
    expect(ft.color).toBe('#4ade80')
    expect(ft.life).toBeGreaterThan(0)
  })
})

describe('scoreWrongBowl', () => {
  it('marks grain as placed', () => {
    const g = makeGrain()
    const bowl = makeBowl({ type: 'brown' })
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 } }
    scoreWrongBowl(g, bowl, state)
    expect(g.placed).toBe(true)
  })

  it('decrements remaining count even on wrong bowl', () => {
    const g = makeGrain()
    const bowl = makeBowl({ type: 'brown' })
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 } }
    scoreWrongBowl(g, bowl, state)
    expect(state.remaining.white).toBe(0)
  })

  it('returns text and debris', () => {
    const g = makeGrain()
    const bowl = makeBowl({ type: 'brown' })
    const state = { remaining: { white: 1, brown: 0, red: 0, black: 0 } }
    const { text, debris } = scoreWrongBowl(g, bowl, state)
    expect(text.text).toBe('✗')
    expect(debris.length).toBe(8)
  })
})

describe('scoreDragWrong', () => {
  it('returns floating text with x mark', () => {
    const bowl = makeBowl()
    const ft = scoreDragWrong(bowl)
    expect(ft.text).toBe('✗')
    expect(ft.color).toBe('#f87171')
    expect(ft.life).toBe(35)
  })
})

describe('isLevelComplete', () => {
  it('returns true when all types are zero', () => {
    expect(isLevelComplete({ white: 0, brown: 0, red: 0, black: 0 })).toBe(true)
  })

  it('returns false when any type remains', () => {
    expect(isLevelComplete({ white: 1, brown: 0, red: 0, black: 0 })).toBe(false)
    expect(isLevelComplete({ white: 0, brown: 3, red: 0, black: 0 })).toBe(false)
  })
})

describe('spawnLevelParticles', () => {
  it('returns 60 particles', () => {
    const particles = spawnLevelParticles(800, 600)
    expect(particles).toHaveLength(60)
  })

  it('all particles have required properties', () => {
    const particles = spawnLevelParticles(800, 600)
    for (const p of particles) {
      expect(p).toHaveProperty('x')
      expect(p).toHaveProperty('y')
      expect(p).toHaveProperty('vx')
      expect(p).toHaveProperty('vy')
      expect(p.life).toBeGreaterThan(0)
    }
  })

  it('particles originate from center', () => {
    const particles = spawnLevelParticles(800, 600)
    for (const p of particles) {
      expect(p.x).toBe(400)
      expect(p.y).toBe(300)
    }
  })
})

describe('calcThrowVelocity', () => {
  it('returns vx and vy', () => {
    const result = calcThrowVelocity(200, 300, 100, 400)
    expect(result).toHaveProperty('vx')
    expect(result).toHaveProperty('vy')
  })

  it('velocity increases with distance', () => {
    const short = calcThrowVelocity(200, 300, 180, 310)
    const long = calcThrowVelocity(200, 300, 50, 400)
    const shortSpeed = Math.sqrt(short.vx ** 2 + short.vy ** 2)
    const longSpeed = Math.sqrt(long.vx ** 2 + long.vy ** 2)
    expect(longSpeed).toBeGreaterThan(shortSpeed)
  })

  it('caps at max speed of 30', () => {
    const result = calcThrowVelocity(200, 300, 0, 0)
    const speed = Math.sqrt(result.vx ** 2 + result.vy ** 2)
    expect(speed).toBeLessThanOrEqual(31)
  })
})

describe('hitTestGrain', () => {
  it('returns true when point is near grain center', () => {
    const g = makeGrain({ x: 200, y: 300, w: 20, h: 8 })
    expect(hitTestGrain(g, 200, 300)).toBe(true)
  })

  it('returns false when point is far from grain', () => {
    const g = makeGrain({ x: 200, y: 300, w: 20, h: 8 })
    expect(hitTestGrain(g, 200, 500)).toBe(false)
  })
})
