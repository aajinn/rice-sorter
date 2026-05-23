import type { RiceType } from './types'

export interface RiceConfig {
  label: string
  g0: string
  g1: string
  g2: string
  crease: string
  germ: string
  highlight: string
  particle: string
}

export const RICE_CONFIG: Record<RiceType, RiceConfig> = {
  white: {
    label: 'WHITE',
    g0: '#faf6ee', g1: '#f0e8d8', g2: '#d4c8b0',
    crease: 'rgba(180,160,130,0.25)',
    germ: 'rgba(160,140,110,0.3)',
    highlight: 'rgba(255,255,255,0.55)',
    particle: '#f5f0e8'
  },
  brown: {
    label: 'BROWN',
    g0: '#d4b84a', g1: '#b8942a', g2: '#7a5a0e',
    crease: 'rgba(100,70,20,0.35)',
    germ: 'rgba(80,55,15,0.4)',
    highlight: 'rgba(255,240,180,0.35)',
    particle: '#c4a44a'
  },
  red: {
    label: 'RED',
    g0: '#d44a3a', g1: '#b83020', g2: '#7a1a00',
    crease: 'rgba(80,15,0,0.4)',
    germ: 'rgba(60,10,0,0.45)',
    highlight: 'rgba(255,180,160,0.3)',
    particle: '#c4463a'
  },
  black: {
    label: 'BLACK',
    g0: '#5a3a8a', g1: '#3a2060', g2: '#1a0a2e',
    crease: 'rgba(20,10,30,0.5)',
    germ: 'rgba(10,5,20,0.5)',
    highlight: 'rgba(180,150,220,0.25)',
    particle: '#4a2c7a'
  }
}

export const ALL_TYPES: RiceType[] = ['white', 'brown', 'red', 'black']

export const LEVEL_NAMES: Record<number, string> = {
  1: 'NPC',
  2: 'Basmati Brainrot',
  3: 'Mewing',
  4: 'Looksmaxxing',
  5: 'Rizz-otto',
  6: 'Doomscrolling',
  7: 'Delulu',
  8: 'Fanum Tax',
  9: 'The Goon Cave',
  10: 'Crashout',
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] ?? ''
}

export function getRiceCount(level: number): number {
  return Math.min(Math.floor(100 * Math.pow(1.55, level - 1)), 5000)
}

export function getActiveTypes(lvl: number): RiceType[] {
  if (lvl <= 3) return ['white', 'brown']
  if (lvl <= 6) return ['white', 'brown', 'red']
  return ['white', 'brown', 'red', 'black']
}
