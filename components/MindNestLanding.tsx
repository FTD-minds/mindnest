'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface Particle {
  baseX: number; baseY: number; x: number; y: number; r: number
  color: { r: number; g: number; b: number }
  alpha: number; phase: number; floatAmp: number; floatFreq: number
  riseSpeed: number; wobbleX: number
}

const PALETTE = [
  { r: 10, g: 35, b: 12 }, { r: 16, g: 50, b: 20 }, { r: 22, g: 65, b: 28 },
  { r: 30, g: 78, b: 35 }, { r: 12, g: 42, b: 18 }, { r: 38, g: 88, b: 42 },
  { r: 6,  g: 28, b: 10 }, { r: 48, g: 98, b: 48 }, { r: 18, g: 58, b: 25 },
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
      alpha: Math.random() * 0.28 + 0.10,
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
      const cx = br.left - cr.left + br.width / 2
      const cy = br.top  - cr.top  + br.height / 2
      const rx = br.width  / 2 + (s.gsHover ? 16 : 9)
      const ry = br.height / 2 + (s.gsHover ? 7 : 3)
      for (let i = 0; i < 6; i++) {
        const a = s.orbitPhase + (i / 6) * Math.PI * 2
        ctx.beginPath()
        ctx.arc(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, s.gsHover ? 3.2 : 2.2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(155,215,135,${s.gsHover ? 0.55 : 0.28})`
        ctx.fill()
      }
      s.orbitPhase += s.gsHover ? 0.038 : 0.016
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }} />
}

function spawnEl(parent: HTMLElement, cls: string, style: string, lifetime: number) {
  const el = document.createElement('div')
  el.className = cls; el.style.cssText = style
  parent.appendChild(el)
  setTimeout(() => el.remove(), lifetime)
}

function portalBurst(e: React.MouseEvent, container: HTMLElement) {
  const r = container.getBoundingClientRect()
  const x = e.clientX - r.left, y = e.clientY - r.top
  const W = container.offsetWidth, H = container.offsetHeight
  ;[0, 1, 2].forEach(i => spawnEl(container, 'mn-portal-ring',
    `left:${x}px;top:${y}px;width:${45+i*18}px;height:${45+i*18}px;animation-delay:${i*0.11}s;animation-duration:${0.9+i*0.08}s;`,
    1300))
  ;[0,40,80,120,160,200,240,280,320].forEach((a, i) => {
    const rad = a * Math.PI / 180, dist = 50 + Math.random() * 28, sz = 3 + Math.random() * 4
    spawnEl(container, 'mn-portal-dot',
      `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;--tx:${Math.cos(rad)*dist}px;--ty:${Math.sin(rad)*dist}px;animation-delay:${i*0.025}s;`,
      900)
  })
  setTimeout(() => {
    const overlay = container.querySelector<HTMLElement>('.mn-transition')
    if (!overlay) return
    overlay.style.setProperty('--ox', ((x / W) * 100) + '%')
    overlay.style.setProperty('--oy', ((y / H) * 100) + '%')
    overlay.classList.add('mn-transition-show')
    setTimeout(() => overlay.classList.remove('mn-transition-show'), 950)
  }, 320)
}

function convergenceBurst(e: React.MouseEvent, container: HTMLElement) {
  const r = container.getBoundingClientRect()
  const x = e.clientX - r.left, y = e.clientY - r.top
  ;[0,30,60,90,120,150,180,210,240,270,300,330].forEach((a, i) => {
    const rad = a * Math.PI / 180, dist = 90 + Math.random() * 40, sz = 2.5 + Math.random() * 3.5
    spawnEl(container, 'mn-conv-dot',
      `left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;--fx:${Math.cos(rad)*dist}px;--fy:${Math.sin(rad)*dist}px;animation-delay:${i*0.018}s;animation-duration:${0.75+Math.random()*0.2}s;`,
      1100)
  })
  setTimeout(() => {
    spawnEl(container, 'mn-conv-bloom', `left:${x}px;top:${y}px;width:100px;height:100px;`, 1000)
    spawnEl(container, 'mn-conv-ring',  `left:${x}px;top:${y}px;width:80px;height:80px;`, 800)
  }, 500)
}

function ScrollScene({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
  const y       = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [40, 0, 0, -20])
  return (
    <div ref={ref} className={`w-full flex items-center justify-center py-20 px-10 ${dark ? 'bg-[#1c2e1c]' : 'bg-[#f4f1e6]'}`}>
      <motion.div style={{ opacity, y }} className="max-w-xl text-center">{children}</motion.div>
    </div>
  )
}

export default function MindNestLanding() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [siActive, setSiActive] = useState(false)

  const handleGsClick = (e: React.MouseEvent) => {
    if (!heroRef.current) return
    portalBurst(e, heroRef.current)
  }

  const handleSiClick = (e: React.MouseEvent) => {
    if (siActive || !heroRef.current) return
    setSiActive(true)
    convergenceBurst(e, heroRef.current)
    setTimeout(() => setSiActive(false), 1200)
  }

  return (
    <div className="w-full">
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: '100vh', background: '#f4f1e6' }}>
        <HeroCanvas containerRef={heroRef as React.RefObject<HTMLDivElement>} />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center z-10 pointer-events-none">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.9, ease: 'easeOut' }}
            className="text-[10px] tracking-[0.18em] uppercase text-[#4a6a38] mb-5">
            AI Parenting Companion · 0–36 Months
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
            className="font-serif text-[clamp(48px,8vw,72px)] font-light text-[#152015] leading-none tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            MindNest
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}
            className="mt-3 text-[17px] italic font-light text-[#2d522d]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Every month. Every milestone. Nest has you covered.
          </motion.p>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.9, ease: 'easeOut' }}
            className="mt-2 text-[13px] font-light text-[#3a5230] tracking-wide">
            Instant answers for every question, worry, and wonder.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.9, ease: 'easeOut' }}
            className="flex gap-4 mt-8 pointer-events-auto">
            <button id="gs-btn" onClick={handleGsClick}
              onMouseEnter={() => (window as any).__setGsHover?.(true)}
              onMouseLeave={() => (window as any).__setGsHover?.(false)}
              className="px-8 py-3 rounded-full border-[1.5px] border-[#1c2e1c]/40 bg-transparent text-[#1c2e1c] text-sm tracking-widest transition-all duration-300 hover:scale-[1.04] hover:border-[#1c2e1c]/60 active:scale-[0.97]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Get Started
            </button>
            <button id="si-btn" onClick={handleSiClick}
              className="px-8 py-3 rounded-full bg-[#1c2e1c] text-[#f0ede0] text-sm tracking-widest transition-all duration-300 hover:scale-[1.04] hover:bg-[#2d4a2d] active:scale-[0.97]"
              style={{ fontFamily: "'DM Sans', sans-serif", boxShadow: '0 0 0 1.5px rgba(90,140,80,0.28), 0 4px 16px rgba(10,30,10,0.22)' }}>
              Sign In
            </button>
          </motion.div>
        </div>
        <div className="mn-transition absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          style={{ background: '#152015', transform: 'scale(0)', opacity: 0 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 20, color: 'rgba(240,237,224,0)', letterSpacing: '0.06em' }}>
            Welcome to MindNest
          </span>
        </div>
      </div>

      <div className="w-full">
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#3d6b3d]/20 to-transparent mx-auto" />
        <ScrollScene>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7a9a68] mb-4">01 — Begin</p>
          <h2 className="text-[42px] font-light text-[#152015] leading-[1.15] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Every parent deserves to feel <em className="italic text-[#2d522d]">confident.</em>
          </h2>
          <p className="text-[13px] text-[#4a6a3a] leading-[1.8] max-w-sm mx-auto">
            Not just survive. MindNest is built for the moments between the milestones — the 3am questions, the quiet worries, the small wonders only you notice.
          </p>
        </ScrollScene>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#3d6b3d]/20 to-transparent mx-auto" />
        <ScrollScene>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7a9a68] mb-4">02 — Personalize</p>
          <h2 className="text-[42px] font-light text-[#152015] leading-[1.15] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Built around <em className="italic text-[#2d522d]">your</em> baby's journey.
          </h2>
          <p className="text-[13px] text-[#4a6a3a] leading-[1.8] max-w-sm mx-auto mb-6">
            From the first breath to the first step. MindNest learns your child's age, stage, and needs — so every answer feels like it was written just for you.
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {['Newborn', '3 Months', '6 Months', '12 Months', '36 Months'].map((label, i) => (
              <motion.span key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
                className="px-4 py-2 rounded-full text-[12px] text-[#2d522d] border border-[#2d522d]/20 tracking-wide">
                {label}
              </motion.span>
            ))}
          </div>
        </ScrollScene>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#3d6b3d]/20 to-transparent mx-auto" />
        <ScrollScene>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7a9a68] mb-4">03 — Milestones</p>
          <h2 className="text-[42px] font-light text-[#152015] leading-[1.15] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Every month, <em className="italic text-[#2d522d]">something new</em> emerges.
          </h2>
          <p className="text-[13px] text-[#4a6a3a] leading-[1.8] max-w-sm mx-auto">
            Sleep shifts. Growth spurts. First words. First steps. Nest tracks what matters most at each stage — so you are always one step ahead, never left guessing.
          </p>
        </ScrollScene>
        <div className="w-px h-16 bg-gradient-to-b from-transparent via-[#3d6b3d]/40 to-[#1c2e1c] mx-auto" />
        <ScrollScene dark>
          <motion.div initial={{ opacity: 0, scale: 0.7 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.34, 1.4, 0.64, 1] }}
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center text-[28px] font-light"
            style={{ background: 'radial-gradient(circle at 35% 35%, #4a8a3a, #1c4018)', boxShadow: '0 0 0 1px rgba(140,200,110,0.3), 0 0 40px rgba(80,160,60,0.2)', fontFamily: "'Cormorant Garamond', serif", color: 'rgba(220,240,210,0.9)' }}>
            N
          </motion.div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7ab868] mb-4">04 — Meet Nest</p>
          <h2 className="text-[42px] font-light text-[#e8e4d4] leading-[1.15] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your AI companion, <em className="italic text-[#9dd884]">always present.</em>
          </h2>
          <p className="text-[13px] text-[#8aaa78] leading-[1.8] max-w-sm mx-auto">
            Nest does not just answer questions. It understands where you are in the journey and meets you there, every time, with calm and clarity.
          </p>
        </ScrollScene>
        <ScrollScene dark>
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#7ab868] mb-4">05 — Begin</p>
          <h2 className="text-[42px] font-light text-[#e8e4d4] leading-[1.15] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Your journey <em className="italic text-[#9dd884]">starts now.</em>
          </h2>
          <p className="text-[13px] text-[#8aaa78] leading-[1.8] max-w-sm mx-auto mb-8">
            Join thousands of parents navigating the 0 to 36 month adventure with confidence, clarity, and calm.
          </p>
          <motion.button initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-full bg-[#f0ede0] text-[#152015] text-sm tracking-widest"
            style={{ fontFamily: "'DM Sans', sans-serif", boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}>
            Get Started with MindNest
          </motion.button>
        </ScrollScene>
      </div>
    </div>
  )
}
