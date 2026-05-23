import { describe, it, expect } from 'vitest'
import {
  RICE_CONFIG, ALL_TYPES,
  getLevelName, getRiceCount, getActiveTypes,
} from '@/components/constants'

describe('ALL_TYPES', () => {
  it('contains all four rice types', () => {
    expect(ALL_TYPES).toEqual(['white', 'brown', 'red', 'black'])
  })
})

describe('RICE_CONFIG', () => {
  it('has config for every rice type', () => {
    for (const t of ALL_TYPES) {
      expect(RICE_CONFIG[t]).toBeDefined()
      expect(RICE_CONFIG[t].label).toBeTypeOf('string')
      expect(RICE_CONFIG[t].g0).toBeTypeOf('string')
    }
  })

  it('has unique labels per type', () => {
    const labels = ALL_TYPES.map(t => RICE_CONFIG[t].label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('getLevelName', () => {
  it('returns correct names for known levels', () => {
    expect(getLevelName(1)).toBe('NPC')
    expect(getLevelName(3)).toBe('Mewing')
    expect(getLevelName(5)).toBe('Rizz-otto')
    expect(getLevelName(7)).toBe('Delulu')
    expect(getLevelName(10)).toBe('Crashout')
  })

  it('returns empty string for unknown levels', () => {
    expect(getLevelName(0)).toBe('')
    expect(getLevelName(11)).toBe('')
  })
})

describe('getRiceCount', () => {
  it('returns 100 for level 1', () => {
    expect(getRiceCount(1)).toBe(100)
  })

  it('grows with level', () => {
    const c1 = getRiceCount(1)
    const c3 = getRiceCount(3)
    const c5 = getRiceCount(5)
    expect(c3).toBeGreaterThan(c1)
    expect(c5).toBeGreaterThan(c3)
  })

  it('caps at 5000', () => {
    expect(getRiceCount(10)).toBeLessThanOrEqual(5000)
  })
})

describe('getActiveTypes', () => {
  it('returns white+brown for levels 1-3', () => {
    for (const lvl of [1, 2, 3]) {
      expect(getActiveTypes(lvl)).toEqual(['white', 'brown'])
    }
  })

  it('returns white+brown+red for levels 4-6', () => {
    for (const lvl of [4, 5, 6]) {
      expect(getActiveTypes(lvl)).toEqual(['white', 'brown', 'red'])
    }
  })

  it('returns all four types for levels 7+', () => {
    for (const lvl of [7, 8, 9, 10]) {
      expect(getActiveTypes(lvl)).toEqual(['white', 'brown', 'red', 'black'])
    }
  })
})
