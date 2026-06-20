'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function LoadingScreen() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: '#f8f5ef' }}>

      <style>{`
        @keyframes panWiggle { 0%,100%{transform:rotate(-2deg)} 50%{transform:rotate(2deg)} }
        @keyframes eggAppear { 0%{transform:scale(0) translateY(20px);opacity:0} 60%{transform:scale(1.1) translateY(-5px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
        @keyframes yolkBounce { 0%{transform:scale(0);opacity:0} 50%{transform:scale(1.2);opacity:1} 75%{transform:scale(0.9)} 100%{transform:scale(1);opacity:1} }
        @keyframes steamRise { 0%{opacity:0.7;transform:translateY(0) scaleX(1)} 100%{opacity:0;transform:translateY(-40px) scaleX(2)} }
        @keyframes bubble { 0%,100%{transform:scale(0);opacity:0} 50%{transform:scale(1);opacity:0.8} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes sparkle { 0%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(180deg)} 100%{opacity:0;transform:scale(0) rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .egg-float { animation: float 3s ease-in-out infinite; }
        .pan-wiggle { animation: panWiggle 2s ease-in-out infinite; }
        .egg-appear { animation: eggAppear 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.3s both; }
        .yolk-bounce { animation: yolkBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.8s both; transform-origin: center; }
        .steam-1 { animation: steamRise 1.5s ease-out 1s infinite; }
        .steam-2 { animation: steamRise 1.5s ease-out 1.3s infinite; }
        .steam-3 { animation: steamRise 1.5s ease-out 1.6s infinite; }
        .bubble-1 { animation: bubble 0.8s ease-in-out 1.2s infinite; }
        .bubble-2 { animation: bubble 0.8s ease-in-out 1.5s infinite; }
        .bubble-3 { animation: bubble 0.8s ease-in-out 1.8s infinite; }
        .bubble-4 { animation: bubble 0.8s ease-in-out 1s infinite; }
        .sparkle-1 { animation: sparkle 2s ease-in-out 1.5s infinite; }
        .sparkle-2 { animation: sparkle 2s ease-in-out 2s infinite; }
        .sparkle-3 { animation: sparkle 2s ease-in-out 2.5s infinite; }
        .dot-1 { animation: dotBounce 0.6s ease-in-out 0s infinite; }
        .dot-2 { animation: dotBounce 0.6s ease-in-out 0.15s infinite; }
        .dot-3 { animation: dotBounce 0.6s ease-in-out 0.3s infinite; }
        .text-dot-1 { animation: dotBounce 0.6s ease-in-out 0s infinite; }
        .text-dot-2 { animation: dotBounce 0.6s ease-in-out 0.2s infinite; }
        .text-dot-3 { animation: dotBounce 0.6s ease-in-out 0.4s infinite; }
      `}</style>

      {/* EGG ANIMATION */}
      <div className="egg-float" style={{ width: '220px', height: '220px', position: 'relative' }}>
        <svg width="220" height="220" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">

          {/* SHADOW */}
          <ellipse cx="110" cy="185" rx="70" ry="8" fill="#44624a" opacity="0.15"/>

          {/* PAN */}
          <g className="pan-wiggle">
            <ellipse cx="110" cy="175" rx="72" ry="14" fill="#2d2d2d"/>
            <ellipse cx="110" cy="168" rx="68" ry="12" fill="#3a3a3a"/>
            <ellipse cx="110" cy="165" rx="64" ry="10" fill="#444"/>
            <rect x="155" y="158" width="52" height="10" rx="5" fill="#2d2d2d" transform="rotate(10 155 163)"/>
            <rect x="153" y="157" width="50" height="8" rx="4" fill="#3a3a3a" transform="rotate(10 153 161)"/>
          </g>

          {/* EGG WHITE */}
          <g className="egg-appear">
            <ellipse cx="95" cy="155" rx="38" ry="24" fill="white" opacity="0.95"/>
            <ellipse cx="118" cy="158" rx="22" ry="16" fill="white" opacity="0.95"/>
            <ellipse cx="108" cy="152" rx="30" ry="20" fill="white" opacity="0.95"/>
            <ellipse cx="110" cy="154" rx="34" ry="18" fill="white"/>
          </g>

          {/* EGG YOLK */}
          <g className="yolk-bounce" style={{ transformOrigin: '108px 150px' }}>
            <circle cx="108" cy="150" r="18" fill="#FCD34D"/>
            <circle cx="108" cy="150" r="14" fill="#FBBF24"/>
            <circle cx="103" cy="145" r="5" fill="#FDE68A" opacity="0.7"/>
          </g>

          {/* STEAM */}
          <g className="steam-1">
            <path d="M90 130 Q87 120 90 110 Q93 100 90 90" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          </g>
          <g className="steam-2">
            <path d="M108 125 Q105 115 108 105 Q111 95 108 85" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          </g>
          <g className="steam-3">
            <path d="M126 130 Q123 120 126 110 Q129 100 126 90" stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6"/>
          </g>

          {/* BUBBLES */}
          <circle className="bubble-1" cx="82" cy="162" r="3" fill="white" opacity="0.6"/>
          <circle className="bubble-2" cx="135" cy="160" r="2.5" fill="white" opacity="0.6"/>
          <circle className="bubble-3" cx="95" cy="168" r="2" fill="white" opacity="0.5"/>
          <circle className="bubble-4" cx="122" cy="165" r="3" fill="white" opacity="0.5"/>

          {/* SPARKLES */}
          <g className="sparkle-1">
            <path d="M65 100 L67 94 L69 100 L75 102 L69 104 L67 110 L65 104 L59 102 Z" fill="#FCD34D"/>
          </g>
          <g className="sparkle-2">
            <path d="M155 85 L156.5 81 L158 85 L162 86.5 L158 88 L156.5 92 L155 88 L151 86.5 Z" fill="#FCD34D"/>
          </g>
          <g className="sparkle-3">
            <path d="M48 140 L49 137 L50 140 L53 141 L50 142 L49 145 L48 142 L45 141 Z" fill="#86efac"/>
          </g>

        </svg>
      </div>

      {/* TEXT */}
      <p style={{ fontSize: '22px', fontWeight: '700', color: '#44624a', margin: '8px 0 4px', letterSpacing: '0.1em' }}>
        DISHCOVERY
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
        <span style={{ fontSize: '13px', color: '#888' }}>Cooking something up</span>
        <span className="text-dot-1" style={{ fontSize: '13px', color: '#888' }}>.</span>
        <span className="text-dot-2" style={{ fontSize: '13px', color: '#888' }}>.</span>
        <span className="text-dot-3" style={{ fontSize: '13px', color: '#888' }}>.</span>
      </div>

      {/* BOUNCING DOTS */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
        <div className="dot-1" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44624a' }}/>
        <div className="dot-2" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44624a' }}/>
        <div className="dot-3" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44624a' }}/>
      </div>

    </div>
  )
}
