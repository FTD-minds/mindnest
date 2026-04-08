'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  baseX: number; baseY: number; x: number; y: number; r: number
  color: { r: number; g: number; b: number }
  alpha: number; phase: number; floatAmp: number; floatFreq: number
  riseSpeed: number; wobbleX: number
}

const PALETTE = [
  { r: 8,  g: 45,  b: 15 }, { r: 14, g: 62,  b: 25 }, { r: 20, g: 78,  b: 35 },
  { r: 28, g: 90,  b: 42 }, { r: 10, g: 52,  b: 22 }, { r: 35, g: 100, b: 48 },
  { r: 5,  g: 32,  b: 12 }, { r: 45, g: 110, b: 55 }, { r: 16, g: 68,  b: 30 },
]

function HeroCanvas({ containerRef }: { containerRef: React.RefObject<HTMLDivElement> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: -999, y: -999 })
  const stateRef  = useRef<{
    particles: Particle[]; time: number; W: number; H: number
    gsHover: boolean; orbitPhase: number; animId: number
  }>({ particles: [], time: 0, W: 0, H: 0, gsHover: false, orbitPhase: 0, animId: 0 })

  const makeParticle = useCallback((W: number, H: number, init: boolean): Particle => {
    const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]
    const baseX = Math.random() * W
    const baseY = init ? Math.random() * H : H + 70
    return {
      baseX, baseY, x: baseX, y: baseY,
      r: Math.random() * 58 + 18,
      color: c,
      alpha: Math.random() * 0.38 + 0.18,
      phase: Math.random() * Math.PI * 2,
      floatAmp: Math.random() * 22 + 9,
      floatFreq: Math.random() * 0.011 + 0.004,
      riseSpeed: Math.random() * 0.28 + 0.13,
      wobbleX: (Math.random() - 0.5) * 0.45,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    const resize = () => {
      s.W = canvas.width  = container.offsetWidth
      s.H = canvas.height = container.offsetHeight
      s.particles = Array.from({ length: 46 }, () => makeParticle(s.W, s.H, true))
    }
    resize()
    window.addEventListener('resize', resize)

    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 } }
    container.addEventListener('mousemove', onMove)
    container.addEventListener('mouseleave', onLeave)

    const drawLeaves = () => {
      const t = s.time
      ;[
        { side: 'l', count: 8, bx: 0.07, by: 0.07, step: 28 },
        { side: 'r', count: 7, bx: 0.93, by: 0.50, step: 26 },
      ].forEach(({ side, count, bx, by, step }) => {
        for (let i = 0; i < count; i++) {
          const x = s.W * bx + (side === 'l' ? 1 : -1) * Math.sin(t * 0.0017 + i) * 13
          const y = s.H * by + i * step + Math.cos(t * 0.0012 + i) * 9
          const sc = 0.58 + i * 0.07
          const an = side === 'l'
            ? Math.sin(t * 0.001 + i) * 0.16 + 0.38
            : Math.sin(t * 0.0009 + i * 1.2) * 0.16 - 0.48
          ctx.save()
          ctx.translate(x, y); ctx.rotate(an); ctx.scale(sc, sc)
          ctx.beginPath(); ctx.moveTo(0, 0)
          ctx.bezierCurveTo(22, -20, 42, -6, 24, 20)
          ctx.bezierCurveTo(12, 32, -12, 20, 0, 0)
          ctx.fillStyle = `rgba(10,42,16,${0.08 + i * 0.009})`; ctx.fill()
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(18, 10)
          ctx.strokeStyle = `rgba(10,42,16,${0.05 + i * 0.006})`
          ctx.lineWidth = 0.7; ctx.stroke()
          ctx.restore()
        }
      })
    }

    const drawOrbit = () => {
      const btn = document.getElementById('gs-btn')
      if (!btn) return
      const cr = container.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      if (br.top > window.innerHeight || br.bottom < 0) return
      const cx = br.left - cr.left + br.width / 2
      const cy = br.top  - cr.top  + br.height / 2
      const rx = br.width  / 2 + (s.gsHover ? 18 : 10)
      const ry = br.height / 2 + (s.gsHover ? 8  : 4)
      for (let i = 0; i < 6; i++) {
        const a = s.orbitPhase + (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, s.gsHover ? 3.8 : 2.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(40,90,35,${s.gsHover ? 0.7 : 0.45})`
        ctx.fill()
      }
      s.orbitPhase += s.gsHover ? 0.04 : 0.018
    }

    const loop = () => {
      s.time++
      ctx.clearRect(0, 0, s.W, s.H)
      drawLeaves()
      const mx = mouseRef.current.x, my = mouseRef.current.y
      s.particles.forEach(p => {
        p.x = p.baseX + Math.sin(s.time * p.floatFreq + p.phase) * p.floatAmp
        p.y = p.baseY + Math.cos(s.time * p.floatFreq * 0.65 + p.phase) * (p.floatAmp * 0.5)
        p.baseY -= p.riseSpeed; p.baseX += p.wobbleX * 0.3
        if (p.baseY + p.r < -40) Object.assign(p, makeParticle(s.W, s.H, false))
        const dx = mx - p.x, dy = my - p.y, dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 170) { const f = (170 - dist) / 170; p.x -= dx * f * 0.065; p.y -= dy * f * 0.065 }
        const { r, g, b } = p.color
        const gr = ctx.createRadialGradient(p.x - p.r * 0.28, p.y - p.r * 0.28, p.r * 0.04, p.x, p.y, p.r)
        gr.addColorStop(0,    `rgba(${r+65},${g+85},${b+55},${p.alpha*1.6})`)
        gr.addColorStop(0.42, `rgba(${r+28},${g+48},${b+22},${p.alpha*1.15})`)
        gr.addColorStop(0.78, `rgba(${r},${g},${b},${p.alpha})`)
        gr.addColorStop(1,    `rgba(${r},${g},${b},0)`)
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = gr; ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x - p.r * 0.26, p.y - p.r * 0.3, p.r * 0.18, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(185,245,185,${p.alpha*0.36})`; ctx.fill()
      })
      drawOrbit()
      s.animId = requestAnimationFrame(loop)
    }
    loop()
    ;(window as any).__setGsHover = (v: boolean) => { s.gsHover = v }

    return () => {
      cancelAnimationFrame(s.animId)
      window.removeEventListener('resize', resize)
      container.removeEventListener('mousemove', onMove)
      container.removeEventListener('mouseleave', onLeave)
    }
  }, [containerRef, makeParticle])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  )
}

/* ── Spawn helper ── */
function spawnEl(parent: HTMLElement, cls: string, style: string, lifetime: number) {
  const el = document.createElement('div')
  el.className = cls; el.style.cssText = style
  parent.appendChild(el)
  setTimeout(() => el.remove(), lifetime)
}

/* ── Portal burst (Get Started + Scene 5 CTA) ── */
function portalBurst(
  e: React.MouseEvent,
  container: HTMLElement,
  opts: { ringColor?: string; dotBg?: string; showTransition?: boolean } = {}
) {
  const r = container.getBoundingClientRect()
  const x = e.clientX - r.left, y = e.clientY - r.top
  const W = container.offsetWidth, H = container.offsetHeight
  const ringColor = opts.ringColor ?? 'rgba(40,80,35,0.6)'
  const dotBg     = opts.dotBg     ?? 'rgba(40,90,35,0.75)'

  ;[0, 1, 2].forEach(i =>
    spawnEl(container, 'mn-portal-ring',
      `left:${x}px;top:${y}px;width:${45+i*18}px;height:${45+i*18}px;` +
      `border-color:${ringColor};` +
      `animation-delay:${i*0.11}s;animation-duration:${0.9+i*0.08}s;`,
      1300))

  ;[0,40,80,120,160,200,240,280,320].forEach((a, i) => {
    const rad = a * Math.PI / 180, dist = 50 + Math.random() * 28, sz = 3 + Math.random() * 4
    spawnEl(container, 'mn-portal-dot',
      `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;background:${dotBg};` +
      `--tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;animation-delay:${i*0.025}s;`,
      900)
  })

  if (opts.showTransition) {
    setTimeout(() => {
      const overlay = container.querySelector<HTMLElement>('.mn-transition')
      if (!overlay) return
      overlay.style.setProperty('--ox', ((x / W) * 100) + '%')
      overlay.style.setProperty('--oy', ((y / H) * 100) + '%')
      overlay.classList.add('mn-transition-show')
      setTimeout(() => overlay.classList.remove('mn-transition-show'), 950)
    }, 320)
  }
}

/* ── SI burst (Sign In) ── */
function siBurst(e: React.MouseEvent, container: HTMLElement) {
  const r = container.getBoundingClientRect()
  const x = e.clientX - r.left, y = e.clientY - r.top
  spawnEl(container, 'mn-si-ring', `left:${x}px;top:${y}px;width:60px;height:60px;`, 900)
  spawnEl(container, 'mn-si-ring', `left:${x}px;top:${y}px;width:60px;height:60px;animation-delay:0.15s;`, 1100)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, dist = 28 + Math.random() * 18, sz = 2.5 + Math.random() * 2.5
    spawnEl(container, 'mn-si-dot',
      `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;` +
      `--tx:${Math.cos(a)*dist}px;--ty:${Math.sin(a)*dist}px;animation-delay:${i*0.04}s;`,
      950)
  }
}

/* ── Seed of Life SVG Orb ── */
function SeedOfLifeOrb() {
  const [touched, setTouched] = useState(false)
  const handleTouch = () => {
    setTouched(true)
    setTimeout(() => setTouched(false), 1500)
  }
  return (
    <div className={`orb-wrap${touched ? ' orb-touched' : ''}`} id="orbWrap" onTouchStart={handleTouch}>
      <svg className="orb-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="sG" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#4a8a5a" />
            <stop offset="30%"  stopColor="#2a5a35" />
            <stop offset="65%"  stopColor="#1a3a22" />
            <stop offset="85%"  stopColor="#0f2416" />
            <stop offset="100%" stopColor="#081408" />
          </radialGradient>
          <radialGradient id="rG" cx="50%" cy="50%" r="50%">
            <stop offset="75%"  stopColor="transparent" />
            <stop offset="88%"  stopColor="#3a8a4a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5ab86a" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="hG" cx="35%" cy="28%" r="40%">
            <stop offset="0%"   stopColor="#a0f0b0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="bG" cx="65%" cy="80%" r="35%">
            <stop offset="0%"   stopColor="#3a6a45" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="spG" cx="30%" cy="24%" r="18%">
            <stop offset="0%"   stopColor="#e0ffe8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <clipPath id="sC"><circle cx="110" cy="110" r="98" /></clipPath>
          <filter id="gG" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="110" cy="110" r="108" fill="none" stroke="#2a6a35" strokeWidth="0.5" opacity="0.3" />
        <circle cx="110" cy="110" r="102" fill="none" stroke="#3a8a45" strokeWidth="0.3" opacity="0.2" />
        <circle cx="110" cy="110" r="98"  fill="url(#sG)" />
        <circle cx="110" cy="110" r="98"  fill="url(#bG)" />
        <g clipPath="url(#sC)">
          <g className="geo-group">
            <g className="geo-lines" filter="url(#gG)" stroke="#7ae890" strokeWidth="0.8" fill="none" opacity="0.7">
              <circle cx="110" cy="110" r="60" stroke="#5ad870" strokeWidth="0.6" opacity="0.5" />
              <circle cx="110" cy="110" r="75" stroke="#4ac860" strokeWidth="0.4" opacity="0.3" />
              <circle cx="110" cy="110" r="30" />
              <circle cx="110" cy="80"  r="30" />
              <circle cx="136" cy="95"  r="30" />
              <circle cx="136" cy="125" r="30" />
              <circle cx="110" cy="140" r="30" />
              <circle cx="84"  cy="125" r="30" />
              <circle cx="84"  cy="95"  r="30" />
            </g>
          </g>
        </g>
        <circle cx="110" cy="110" r="98" fill="url(#rG)" className="rim-light" />
        <circle cx="110" cy="110" r="98" fill="url(#hG)" />
        <ellipse cx="84" cy="68" rx="18" ry="11" fill="url(#spG)" className="specular" transform="rotate(-20,84,68)" />
      </svg>
    </div>
  )
}

/* ── Main component ── */
export default function MindNestLanding() {
  const heroRef = useRef<HTMLDivElement>(null)
  const sc5Ref  = useRef<HTMLDivElement>(null)
  const [siActive, setSiActive] = useState(false)
  const [s5Active, setS5Active] = useState(false)

  /* IntersectionObserver for scroll scenes + haptic */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const id = e.target.id
        if      (id === 'sc1') document.getElementById('fg1')?.classList.add('on')
        else if (id === 'sc2') document.getElementById('fg2')?.classList.add('on')
        else if (id === 'sc3') document.getElementById('fg3')?.classList.add('on')
        else if (id === 'sc4') e.target.classList.add('s4-on')
        else if (id === 'sc5') e.target.classList.add('s5-on')
        obs.unobserve(e.target)
      })
    }, { threshold: 0.25, rootMargin: '0px 0px -80px 0px' })

    ;['sc1','sc2','sc3','sc4','sc5'].forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })

    const onScroll = () => {
      if (window.scrollY > 80 && (navigator as any).vibrate) (navigator as any).vibrate(6)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      obs.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const handleGsClick = (e: React.MouseEvent) => {
    if (!heroRef.current) return
    portalBurst(e, heroRef.current, { showTransition: true })
  }

  const handleSiClick = (e: React.MouseEvent) => {
    if (siActive || !heroRef.current) return
    setSiActive(true)
    siBurst(e, heroRef.current)
    setTimeout(() => setSiActive(false), 1000)
  }

  const handleS5Click = (e: React.MouseEvent) => {
    if (s5Active || !sc5Ref.current) return
    setS5Active(true)
    portalBurst(e, sc5Ref.current, {
      ringColor: 'rgba(240,237,224,0.5)',
      dotBg: 'rgba(240,237,224,0.7)',
    })
    setTimeout(() => setS5Active(false), 1000)
  }

  return (
    <div style={{ width: '100%' }}>

      {/* ── Hero ── */}
      <div ref={heroRef} id="hero">
        <HeroCanvas containerRef={heroRef as React.RefObject<HTMLDivElement>} />

        <div id="hero-content">
          <motion.div className="h-tag"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: 'easeOut' }}>
            AI Parenting Companion · 0–36 Months
          </motion.div>

          <motion.div className="h-title"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}>
            MindNest
          </motion.div>

          <motion.div className="h-tagline"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}>
            Every month. Every milestone. Nest has you covered.
          </motion.div>

          <motion.div className="h-desc"
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.9, ease: 'easeOut' }}>
            Instant answers for every question, worry, and wonder.
          </motion.div>

          <motion.div className="h-btns"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.9, ease: 'easeOut' }}>
            <button
              id="gs-btn"
              onClick={handleGsClick}
              onMouseEnter={() => (window as any).__setGsHover?.(true)}
              onMouseLeave={() => (window as any).__setGsHover?.(false)}>
              Get Started
            </button>
            <button id="si-btn" onClick={handleSiClick}>
              Sign In
            </button>
          </motion.div>
        </div>

        <div className="scroll-peek"><div className="peek-nub" /></div>

        <div className="mn-transition" id="mnTrans">
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 22, letterSpacing: '0.06em' }}>
            Welcome to MindNest
          </span>
        </div>
      </div>

      {/* ── Scene 1 — Begin ── */}
      <div className="scene" id="sc1" style={{ background: '#b8c9a8' }}>
        <div className="scene-bg" id="bg1" style={{ background: 'radial-gradient(circle at 25% 65%,rgba(60,100,50,0.25) 0%,transparent 55%)' }} />
        <div className="scene-overlay" />
        <div className="scene-fg" id="fg1">
          <div className="s-num" style={{ color: '#2d5220' }}>01 — Begin</div>
          <div className="s-title" style={{ color: '#0a150a' }}>
            Every parent deserves to feel <em style={{ color: '#2d522d' }}>confident.</em>
          </div>
          <div className="s-body" style={{ color: '#1a3018', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            Not just survive. MindNest is built for the moments between the milestones — the 3am questions, the quiet worries, the small wonders only you notice.
          </div>
        </div>
      </div>

      {/* ── Scene 2 — Personalize ── */}
      <div className="scene" id="sc2" style={{ background: '#afc0a0' }}>
        <div className="scene-bg" id="bg2" style={{ background: 'radial-gradient(circle at 75% 35%,rgba(60,100,50,0.25) 0%,transparent 55%)' }} />
        <div className="scene-overlay" />
        <div className="scene-fg" id="fg2">
          <div className="s-num" style={{ color: '#2d5220' }}>02 — Personalize</div>
          <div className="s-title" style={{ color: '#0a150a' }}>
            Built around <em style={{ color: '#2d522d' }}>your</em> baby's journey.
          </div>
          <div className="s-body" style={{ color: '#1a3018', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            MindNest learns your child's age, stage, and needs — so every answer feels like it was written just for you.
          </div>
          <div className="pills">
            <div className="pill">Newborn</div>
            <div className="pill">3 Months</div>
            <div className="pill">6 Months</div>
            <div className="pill">12 Months</div>
            <div className="pill">36 Months</div>
          </div>
        </div>
      </div>

      {/* ── Scene 3 — Milestones ── */}
      <div className="scene" id="sc3" style={{ background: '#a6b898' }}>
        <div className="scene-bg" id="bg3" style={{ background: 'radial-gradient(circle at 50% 70%,rgba(60,100,50,0.25) 0%,transparent 55%)' }} />
        <div className="scene-overlay" />
        <div className="scene-fg" id="fg3">
          <div className="s-num" style={{ color: '#2d5220' }}>03 — Milestones</div>
          <div className="s-title" style={{ color: '#0a150a' }}>
            Every month, <em style={{ color: '#2d522d' }}>something new</em> emerges.
          </div>
          <div className="s-body" style={{ color: '#1a3018', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            Sleep shifts. Growth spurts. First words. First steps. Nest tracks what matters most — so you are always one step ahead, never left guessing.
          </div>
        </div>
      </div>

      {/* ── Scene 4 — Meet Nest ── */}
      <div className="scene scene-dark" id="sc4">
        <div id="sc4-inner">
          <SeedOfLifeOrb />

          <div className="s-num" style={{ color: '#7ab868' }}>04 — Meet Nest</div>
          <div className="s-title" style={{ color: '#e8e4d4', marginBottom: 10 }}>
            Meet the mind <em style={{ color: '#9dd884' }}>behind every answer.</em>
          </div>
          <div className="s-body" style={{ color: '#8aaa78', marginBottom: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            MindNest's AI core — a pediatric intelligence engine trained on developmental science, sleep research, and real parenting data. It doesn't just respond. It reasons, adapts, and grows with your child.
          </div>

          <div className="feat-grid">
            <div className="feat">
              <div className="feat-title">Always There</div>
              <div className="feat-body">Day or night, feeding or 3am panic — Nest responds in seconds, any hour, any stage. No waiting rooms. No hold music.</div>
            </div>
            <div className="feat">
              <div className="feat-title">Knows Your Baby</div>
              <div className="feat-body">Nest learns your child's exact age and stage, tailoring every answer to where they are right now — not where babies are on average.</div>
            </div>
            <div className="feat">
              <div className="feat-title">Built on Science</div>
              <div className="feat-body">Every response is grounded in peer-reviewed pediatric research. Not forum opinions. Not parenting myths. Just evidence you can act on.</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Scene 5 — Begin ── */}
      <div className="scene scene-5" id="sc5" ref={sc5Ref}>
        <div className="s5-wrap">
          <div className="s5-num s-num" style={{ color: '#7ab868' }}>05 — Begin</div>
          <div className="s5-title s-title" style={{ color: '#e8e4d4' }}>
            Your journey <em style={{ color: '#9dd884' }}>starts now.</em>
          </div>
          <div className="s5-body s-body" style={{ color: '#8aaa78', marginBottom: 8, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            Join thousands of parents navigating the 0 to 36 month adventure with confidence, clarity, and calm.
          </div>
          <div className="s5-cta">
            <button className="s5-cta-btn" id="s5Btn" onClick={handleS5Click} style={{ background: '#f0ede0', color: '#1c2e1c' }}>
              Get Started with MindNest
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
