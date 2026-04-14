'use client'

import { useState } from 'react'

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface NestOrbProps {
  size?:    number
  state?:   OrbState
  onClick?: () => void
}

export function NestOrb({ size = 52, state = 'idle', onClick }: NestOrbProps) {
  const [touched, setTouched] = useState(false)

  const handleTouch = () => {
    setTouched(true)
    setTimeout(() => setTouched(false), 1500)
  }

  const stateClass = state !== 'idle' ? ` orb-${state}` : ''

  return (
    <div
      className={`orb-wrap${touched ? ' orb-touched' : ''}${stateClass}`}
      onTouchStart={handleTouch}
      onClick={onClick}
      style={{
        width:  size,
        height: size,
        cursor: onClick ? 'pointer' : undefined,
        margin: 0,
      }}
    >
      <svg
        className="orb-svg"
        viewBox="0 0 220 220"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <radialGradient id="noSG" cx="38%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#4a8a5a" />
            <stop offset="30%"  stopColor="#2a5a35" />
            <stop offset="65%"  stopColor="#1a3a22" />
            <stop offset="85%"  stopColor="#0f2416" />
            <stop offset="100%" stopColor="#081408" />
          </radialGradient>
          <radialGradient id="noRG" cx="50%" cy="50%" r="50%">
            <stop offset="75%"  stopColor="transparent" />
            <stop offset="88%"  stopColor="#3a8a4a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#5ab86a" stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id="noHG" cx="35%" cy="28%" r="40%">
            <stop offset="0%"   stopColor="#a0f0b0" stopOpacity="0.35" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="noBG" cx="65%" cy="80%" r="35%">
            <stop offset="0%"   stopColor="#3a6a45" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="noSpG" cx="30%" cy="24%" r="18%">
            <stop offset="0%"   stopColor="#e0ffe8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <clipPath id="noSC"><circle cx="110" cy="110" r="98" /></clipPath>
          <filter id="noGG" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <circle cx="110" cy="110" r="108" fill="none" stroke="#2a6a35" strokeWidth="0.5" opacity="0.3" />
        <circle cx="110" cy="110" r="102" fill="none" stroke="#3a8a45" strokeWidth="0.3" opacity="0.2" />
        <circle cx="110" cy="110" r="98"  fill="url(#noSG)" />
        <circle cx="110" cy="110" r="98"  fill="url(#noBG)" />

        <g clipPath="url(#noSC)">
          <g className="geo-group">
            <g className="geo-lines" filter="url(#noGG)" stroke="#7ae890" strokeWidth="0.8" fill="none" opacity="0.7">
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

        <circle cx="110" cy="110" r="98" fill="url(#noRG)" className="rim-light" />
        <circle cx="110" cy="110" r="98" fill="url(#noHG)" />
        <ellipse cx="84" cy="68" rx="18" ry="11" fill="url(#noSpG)" className="specular" transform="rotate(-20,84,68)" />
      </svg>
    </div>
  )
}
