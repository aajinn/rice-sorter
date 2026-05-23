export type RiceType = 'white' | 'brown' | 'red' | 'black'

export type Phase = 'menu' | 'playing' | 'gameover'

export type RiceCounts = Record<RiceType, number>

export interface Grain {
  x: number
  y: number
  w: number
  h: number
  angle: number
  vx: number
  vy: number
  type: RiceType
  placed: boolean
  thrown: boolean
  animScale: number
  animTime: number
}

export interface Bowl {
  x: number
  y: number
  w: number
  h: number
  label: string
  type: RiceType
  shakeTime: number
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

export interface FloatingText {
  x: number
  y: number
  text: string
  life: number
  color: string
}

export interface ThrowGrab {
  grain: Grain
  origX: number
  origY: number
}

export interface GameState {
  level: number
  timer: number
  score: number
  rice: Grain[]
  selected: Grain | null
  bowls: Bowl[]
  particles: Particle[]
  floatingTexts: FloatingText[]
  mx: number
  my: number
  down: boolean
  ctrlHeld: boolean
  ended: boolean
  remaining: RiceCounts
  throwGrab: ThrowGrab | null
}
