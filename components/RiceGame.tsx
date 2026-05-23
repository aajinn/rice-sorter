'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Grain, GameState, Phase } from './types'
import { ALL_TYPES } from './constants'
import { getActiveTypes, RICE_CONFIG } from './constants'
import {
  drawRiceGrain, drawBowl, drawParticles, drawFloatingTexts, drawSlingshotUI,
} from './renderer'
import {
  spawnRice, createBowls, stepThrownGrain, isGrainOffscreen, respawnGrain,
  findBowlAt, scoreCorrectPlacement, scoreWrongBowl, scoreDragWrong,
  isLevelComplete, spawnLevelParticles, calcThrowVelocity, hitTestGrain,
} from './game'
import { playCorrect, playWrong, playLevelUp, playGameOver, playPickup, playTimer } from './sounds'

const INIT: GameState = {
  level: 1, timer: 90, score: 0,
  rice: [], selected: null, bowls: [],
  particles: [], floatingTexts: [],
  mx: 0, my: 0, down: false, ctrlHeld: false, ended: false,
  remaining: { white: 0, brown: 0, red: 0, black: 0 },
  throwGrab: null,
}

export default function RiceGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const g = useRef<GameState>({ ...INIT })
  const [phase, setPhase] = useState<Phase>('menu')
  const [displayLevel, setDisplayLevel] = useState(1)
  const [displayTimer, setDisplayTimer] = useState(90)
  const [displayCounts, setDisplayCounts] = useState({ white: 0, brown: 0, red: 0, black: 0 })
  const [highScore, setHighScore] = useState(0)
  const [gameOverLevel, setGameOverLevel] = useState(1)
  const [gameOverScore, setGameOverScore] = useState(0)

  const loadHS = useCallback(() => {
    try {
      const v = localStorage.getItem('rice-sorter-hs')
      if (v) setHighScore(parseInt(v, 10) || 0)
    } catch { /* */ }
  }, [])
  const saveHS = useCallback((lvl: number) => {
    try { localStorage.setItem('rice-sorter-hs', lvl.toString()); setHighScore(lvl) } catch { /* */ }
  }, [])
  useEffect(() => { loadHS() }, [loadHS])

  // ── helpers ──────────────────────────────────────────────────

  function pushText(ft: import('./types').FloatingText) { g.current.floatingTexts.push(ft) }
  function pushParticles(ps: import('./types').Particle[]) { g.current.particles.push(...ps) }
  function syncCounts() { setDisplayCounts({ ...g.current.remaining }) }
  function checkNextLevel() {
    if (isLevelComplete(g.current.remaining) && !g.current.ended)
      setTimeout(() => nextLevel(), 350)
  }

  // ── game lifecycle ───────────────────────────────────────────

  function startGame() {
    const c = canvasRef.current
    if (!c) return
    const s = g.current
    Object.assign(s, INIT)
    const { grains, remaining, bowls } = spawnRice(c.width, c.height, 1)
    s.rice = grains; s.remaining = remaining; s.bowls = bowls
    setDisplayLevel(1); setDisplayTimer(90)
    setDisplayCounts(remaining)
    setPhase('playing')
  }

  function nextLevel() {
    const c = canvasRef.current
    if (!c) return
    const s = g.current
    s.level++; s.timer += 15; s.particles = []
    setDisplayLevel(s.level)
    playLevelUp()
    pushParticles(spawnLevelParticles(c.width, c.height))
    const { grains, remaining, bowls } = spawnRice(c.width, c.height, s.level)
    s.rice = grains; s.remaining = remaining; s.bowls = bowls
    setDisplayCounts(remaining)
  }

  function endGame() {
    const s = g.current
    s.ended = true
    setGameOverLevel(s.level); setGameOverScore(s.score)
    setPhase('gameover')
    playGameOver()
    if (s.level > highScore) saveHS(s.level)
  }

  // ── input ────────────────────────────────────────────────────

  function getXY(e: React.PointerEvent) {
    const r = canvasRef.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : null
  }

  function grabForThrow(p: { x: number; y: number }) {
    const s = g.current
    for (const grain of s.rice) {
      if (grain.placed || grain.thrown) continue
      if (hitTestGrain(grain, p.x, p.y)) {
        s.throwGrab = { grain, origX: grain.x, origY: grain.y }
        playPickup()
        return true
      }
    }
    return false
  }

  function grabForDrag(p: { x: number; y: number }) {
    const s = g.current
    for (const grain of s.rice) {
      if (grain.placed) continue
      if (hitTestGrain(grain, p.x, p.y)) {
        s.selected = grain
        playPickup()
        return
      }
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    const p = getXY(e)
    if (!p || g.current.ended) return
    const s = g.current
    s.mx = p.x; s.my = p.y; s.down = true
    if (s.ctrlHeld && grabForThrow(p)) return
    grabForDrag(p)
  }

  function handlePointerMove(e: React.PointerEvent) {
    const p = getXY(e)
    if (!p) return
    const s = g.current
    s.mx = p.x; s.my = p.y
    if (s.selected) { s.selected.x = p.x; s.selected.y = p.y }
    if (s.throwGrab) { s.throwGrab.grain.x = p.x; s.throwGrab.grain.y = p.y }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const p = getXY(e)
    if (!p) return
    const s = g.current
    s.down = false

    if (s.selected) {
      const grain = s.selected; s.selected = null
      const bowl = findBowlAt(grain, s.bowls)
      if (bowl && grain.type === bowl.type) {
        pushText(scoreCorrectPlacement(grain, bowl, s))
        playCorrect()
        syncCounts(); checkNextLevel()
      } else if (bowl) {
        pushText(scoreDragWrong(bowl))
        playWrong()
      }
    }

    if (s.throwGrab) {
      const { grain, origX, origY } = s.throwGrab
      s.throwGrab = null
      const { vx, vy } = calcThrowVelocity(origX, origY, p.x, p.y)
      grain.vx = vx; grain.vy = vy
      grain.thrown = true
      grain.x = origX; grain.y = origY
      const a = Math.atan2(grain.vy, grain.vx)
      grain.angle = a + Math.PI / 2
    }
  }

  // ── timer ────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'playing') return
    const id = setInterval(() => {
      const s = g.current
      if (s.ended) return
      s.timer--
      setDisplayTimer(s.timer)
      if (s.timer > 0 && s.timer <= 10) playTimer()
      if (s.timer <= 0) endGame()
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  // ── keyboard ─────────────────────────────────────────────────

  useEffect(() => {
    function down(e: KeyboardEvent) { if (e.key === 'Control') g.current.ctrlHeld = true }
    function up(e: KeyboardEvent) {
      if (e.key !== 'Control') return
      const s = g.current
      s.ctrlHeld = false
      if (s.throwGrab) {
        s.throwGrab.grain.x = s.throwGrab.origX
        s.throwGrab.grain.y = s.throwGrab.origY
        s.throwGrab = null
      }
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  // ── animation loop ───────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number

    function resize() {
      if (!canvas) return
      const p = canvas.parentElement
      if (!p) return
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function animate() {
      if (!canvas || !ctx) return
      const cw = canvas.width, ch = canvas.height
      const s = g.current

      ctx.clearRect(0, 0, cw, ch)
      const bg = ctx.createLinearGradient(0, 0, 0, ch)
      bg.addColorStop(0, '#1e293b')
      bg.addColorStop(1, '#020617')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, cw, ch)

      for (const bowl of s.bowls) {
        if (bowl.shakeTime > 0) bowl.shakeTime -= 0.025
        drawBowl(ctx, bowl)
      }

      // physics + draw rice
      for (let i = 0; i < s.rice.length; i++) {
        const grain = s.rice[i]
        if (grain.placed) continue

        if (grain.thrown) {
          stepThrownGrain(grain, 0.18)
          const bowl = findBowlAt(grain, s.bowls)
          if (bowl) {
            if (grain.type === bowl.type) {
              pushText(scoreCorrectPlacement(grain, bowl, s))
              playCorrect()
              syncCounts(); checkNextLevel()
            } else {
              const res = scoreWrongBowl(grain, bowl, s)
              pushText(res.text)
              pushParticles(res.debris)
              playWrong()
              syncCounts(); checkNextLevel()
            }
          }
          if (isGrainOffscreen(grain, cw, ch)) respawnGrain(grain, cw, ch)
        }

        if (grain.animTime > 0) {
          grain.animTime -= 0.035
          grain.animScale = 1 + Math.sin(grain.animTime * 30) * 0.08
          if (grain.animTime <= 0) grain.animScale = 1
        }
        if (grain === s.selected) grain.animScale = 1.15
        drawRiceGrain(ctx, grain)
      }

      drawParticles(ctx, s.particles)
      drawFloatingTexts(ctx, s.floatingTexts)
      drawSlingshotUI(ctx, s)

      // update particles
      for (const p of s.particles) {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016
        p.vy += 120 * 0.016
        p.life--
      }
      s.particles = s.particles.filter(p => p.life > 0)

      for (const ft of s.floatingTexts) {
        ft.y -= 0.8; ft.life--
      }
      s.floatingTexts = s.floatingTexts.filter(ft => ft.life > 0)

      raf = requestAnimationFrame(animate)
    }
    animate()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [phase])

  // ── render ───────────────────────────────────────────────────

  const activeTypes = getActiveTypes(displayLevel)

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none">

      {phase === 'playing' && (<>
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className="flex items-center gap-5 px-5 py-2 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/8 shadow-lg">
            <div className="text-center min-w-[44px]">
              <div className="text-[9px] text-gray-400 uppercase tracking-widest">Lvl</div>
              <div className="text-lg font-bold text-white">{displayLevel}</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            <div className="text-center min-w-[44px]">
              <div className="text-[9px] text-gray-400 uppercase tracking-widest">Time</div>
              <div className={`text-lg font-bold ${displayTimer <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{displayTimer}</div>
            </div>
            <div className="w-px h-7 bg-white/10" />
            {activeTypes.map(type => (
              <div key={type} className="text-center min-w-[36px]">
                <div className="text-[9px] text-gray-400 uppercase tracking-widest">{RICE_CONFIG[type].label.slice(0, 3)}</div>
                <div className="text-lg font-bold text-white">{displayCounts[type]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none text-center">
          <div className="text-[11px] text-gray-500/80">Click to pick up · Hold <span className="text-gray-300 bg-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono">Ctrl</span> + Click to throw</div>
        </div>
      </>)}

      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      {phase === 'menu' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 text-center shadow-2xl w-[380px]">
            <div className="text-6xl mb-3">🍚</div>
            <h1 className="text-4xl font-black text-white mb-1">Rice Sorter</h1>
            <p className="text-gray-400 text-sm mb-1">Sort rice into the right bowls</p>
            <p className="text-gray-500 text-xs mb-4">Click to pick up · Hold Ctrl + Click to throw</p>
            {highScore > 0 ? (
              <p className="text-amber-400 font-bold mb-6">Best Level: {highScore}</p>
            ) : <div className="mb-6" />}
            <button onClick={startGame}
              className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl cursor-pointer"
            >Start Game</button>
          </div>
        </div>
      )}

      {phase === 'gameover' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-[32px] p-10 text-center shadow-2xl w-[380px]">
            <div className="text-6xl mb-3">⏰</div>
            <h1 className="text-3xl font-black text-white mb-1">Time Up!</h1>
            <p className="text-gray-300 mb-1">Level {gameOverLevel}</p>
            <p className="text-gray-400 text-sm mb-3">Score: {gameOverScore}</p>
            {gameOverLevel >= highScore && gameOverLevel > 1
              ? <p className="text-amber-400 font-bold mb-4">New High Score!</p>
              : gameOverLevel < highScore
                ? <p className="text-amber-400 text-sm mb-4">Best: Level {highScore}</p>
                : <div className="mb-4" />}
            <button onClick={() => startGame()}
              className="bg-white text-black px-10 py-4 rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform shadow-xl cursor-pointer"
            >Play Again</button>
          </div>
        </div>
      )}

    </div>
  )
}
