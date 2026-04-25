/**
 * GenAudiusLogo — Gen Audius Pro
 * ================================
 * Reusable brand logo component.
 * Uses the official Gen Audius wave icon (3 gradient wave shapes).
 *
 * Props:
 *   size      — 'xs'|'sm'|'md'|'lg'|'xl'|'2xl'|number (px of icon)
 *   layout    — 'horizontal' | 'vertical'
 *   showText  — boolean
 *   glow      — boolean
 *   className — string
 *   onClick   — function
 */

import React from 'react';

/* ── Inline SVG icon (the 3-wave Gen Audius logo) ── */
const WaveIcon = ({ size = 48, glow = false }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 160"
        width={size}
        height={size}
        style={{
            filter: glow
                ? `drop-shadow(0 0 ${size * 0.15}px rgba(45,218,189,0.5)) drop-shadow(0 0 ${size * 0.1}px rgba(107,33,212,0.4))`
                : undefined,
            flexShrink: 0,
        }}
    >
        <defs>
            {/* Left wave: Blue → Cyan */}
            <linearGradient id="ga-grad-left" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(45,218,189)" />
                <stop offset="100%" stopColor="rgb(32,21,148)" />
            </linearGradient>
            {/* Center wave: Magenta → Violet */}
            <linearGradient id="ga-grad-center" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(208,104,242)" />
                <stop offset="100%" stopColor="rgb(32,21,148)" />
            </linearGradient>
            {/* Right wave: Blue → Green */}
            <linearGradient id="ga-grad-right" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(54,209,31)" />
                <stop offset="100%" stopColor="rgb(41,27,189)" />
            </linearGradient>
        </defs>

        {/* Left wave */}
        <path
            fill="url(#ga-grad-left)"
            d="M 55 20
               C 48 30, 42 42, 38 55
               C 33 70, 30 86, 30 100
               C 30 114, 33 128, 38 140
               C 42 150, 48 158, 55 160
               C 60 161, 65 157, 68 150
               C 72 140, 74 128, 74 115
               C 74 100, 71 85, 66 72
               C 62 60, 58 48, 58 35
               C 58 28, 57 22, 55 20 Z"
        />

        {/* Center wave (taller) */}
        <path
            fill="url(#ga-grad-center)"
            d="M 100 5
               C 93 15, 87 28, 83 43
               C 78 60, 76 78, 76 97
               C 76 116, 78 134, 83 150
               C 87 162, 93 170, 100 170
               C 107 170, 113 162, 117 150
               C 122 134, 124 116, 124 97
               C 124 78, 122 60, 117 43
               C 113 28, 107 15, 100 5 Z"
        />

        {/* Right wave */}
        <path
            fill="url(#ga-grad-right)"
            d="M 145 20
               C 143 22, 142 28, 142 35
               C 142 48, 138 60, 134 72
               C 129 85, 126 100, 126 115
               C 126 128, 128 140, 132 150
               C 135 157, 140 161, 145 160
               C 152 158, 158 150, 162 140
               C 167 128, 170 114, 170 100
               C 170 86, 167 70, 162 55
               C 158 42, 152 30, 145 20 Z"
        />
    </svg>
);

const SIZES = {
    xs:  { icon: 28,  title: '13px', sub: '8px',  gap: 6  },
    sm:  { icon: 36,  title: '15px', sub: '9px',  gap: 8  },
    md:  { icon: 48,  title: '18px', sub: '10px', gap: 10 },
    lg:  { icon: 64,  title: '22px', sub: '11px', gap: 12 },
    xl:  { icon: 88,  title: '28px', sub: '13px', gap: 14 },
    '2xl': { icon: 120, title: '34px', sub: '15px', gap: 16 },
};

export default function GenAudiusLogo({
    size = 'md',
    layout = 'horizontal',
    showText = true,
    glow = false,
    className = '',
    onClick,
}) {
    const s = typeof size === 'number'
        ? { icon: size, title: `${Math.round(size * 0.3)}px`, sub: `${Math.round(size * 0.14)}px`, gap: Math.round(size * 0.14) }
        : (SIZES[size] || SIZES.md);

    const isVertical = layout === 'vertical';

    return (
        <div
            className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
            style={{ gap: s.gap }}
            onClick={onClick}
        >
            <WaveIcon size={s.icon} glow={glow} />

            {showText && (
                <div
                    className={`flex flex-col ${isVertical ? 'items-center' : 'items-start'}`}
                    style={{ gap: 2 }}
                >
                    <span
                        className="font-black leading-none tracking-tight"
                        style={{
                            fontSize: s.title,
                            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.85) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Gen Audius
                    </span>
                    <span
                        className="font-black uppercase leading-none"
                        style={{
                            fontSize: s.sub,
                            letterSpacing: '0.2em',
                            background: 'linear-gradient(90deg, #F5A623, #E91E8C)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        Pro
                    </span>
                </div>
            )}
        </div>
    );
}

/**
 * LogoVertical — compact vertical version for the sidebar
 * Big icon on top, "Gen Audius" text below, "Pro" badge
 */
export function LogoVertical({ iconSize = 80, className = '', glow = true }) {
    return (
        <div className={`flex flex-col items-center ${className}`} style={{ gap: 8 }}>
            <WaveIcon size={iconSize} glow={glow} />

            <div className="flex flex-col items-center" style={{ gap: 3 }}>
                <span
                    className="font-black tracking-tight leading-none"
                    style={{
                        fontSize: Math.max(14, Math.round(iconSize * 0.22)),
                        background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.8) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-0.01em',
                    }}
                >
                    Gen Audius
                </span>
                <span
                    className="font-black uppercase leading-none"
                    style={{
                        fontSize: Math.max(9, Math.round(iconSize * 0.11)),
                        letterSpacing: '0.3em',
                        background: 'linear-gradient(90deg, #F5A623, #E91E8C)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}
                >
                    ✦ Studio Pro
                </span>
            </div>
        </div>
    );
}