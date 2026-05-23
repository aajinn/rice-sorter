let ctx: AudioContext | null = null

function getCtx() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function playCorrect() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(880, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(1320, c.currentTime + 0.08)
  g.gain.setValueAtTime(0.35, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.2)
}

export function playWrong() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.type = 'square'
  o.frequency.setValueAtTime(200, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.15)
  g.gain.setValueAtTime(0.2, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.25)
}

export function playLevelUp() {
  const c = getCtx()
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'sine'
    const t = c.currentTime + i * 0.1
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.3, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    o.start(t)
    o.stop(t + 0.25)
  })
}

export function playGameOver() {
  const c = getCtx()
  const notes = [523, 440, 349, 262]
  notes.forEach((freq, i) => {
    const o = c.createOscillator()
    const g = c.createGain()
    o.connect(g)
    g.connect(c.destination)
    o.type = 'triangle'
    const t = c.currentTime + i * 0.2
    o.frequency.setValueAtTime(freq, t)
    g.gain.setValueAtTime(0.3, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    o.start(t)
    o.stop(t + 0.35)
  })
}

export function playPickup() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(600, c.currentTime)
  o.frequency.exponentialRampToValueAtTime(900, c.currentTime + 0.05)
  g.gain.setValueAtTime(0.2, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.12)
}

export function playTimer() {
  const c = getCtx()
  const o = c.createOscillator()
  const g = c.createGain()
  o.connect(g)
  g.connect(c.destination)
  o.type = 'sine'
  o.frequency.setValueAtTime(1000, c.currentTime)
  g.gain.setValueAtTime(0.2, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1)
  o.start(c.currentTime)
  o.stop(c.currentTime + 0.1)
}
