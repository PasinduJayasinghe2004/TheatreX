import { useState, useEffect, useRef } from 'react'

const color = '#2563EB'
const size = 24

export function AnimatedClock() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="7">
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="6s"
                    repeatCount="indefinite"
                />
            </line>
            <line x1="12" y1="12" x2="15.5" y2="14">
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="60s"
                    repeatCount="indefinite"
                />
            </line>
            {/* Pulse ring */}
            <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" opacity="0.3">
                <animate attributeName="r" values="10;12;10" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
}

export function AnimatedCalendar() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
            {/* Animated checkmark appearing on the calendar */}
            <polyline points="9 16 11 18 15 14" stroke={color} strokeWidth="2" fill="none">
                <animate attributeName="stroke-dasharray" values="0 20;20 0" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
            </polyline>
        </svg>
    )
}

export function AnimatedUsers() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Person 1 (center) */}
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            {/* Person 2 (right) - slides in */}
            <g>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="3,0;0,0;0,0;3,0"
                    dur="3s"
                    repeatCount="indefinite"
                />
                <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
            </g>
        </svg>
    )
}

export function AnimatedBarChart() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Baseline */}
            <line x1="3" y1="22" x2="21" y2="22" strokeWidth="1.5" />
            {/* Bar 1 */}
            <rect x="4" y="22" width="3" rx="0.5" fill={color} stroke="none" opacity="0.8">
                <animate attributeName="y" values="22;10;22" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="height" values="0;12;0" dur="2.5s" repeatCount="indefinite" />
            </rect>
            {/* Bar 2 */}
            <rect x="10.5" y="22" width="3" rx="0.5" fill={color} stroke="none" opacity="0.6">
                <animate attributeName="y" values="22;6;22" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
                <animate attributeName="height" values="0;16;0" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
            </rect>
            {/* Bar 3 */}
            <rect x="17" y="22" width="3" rx="0.5" fill={color} stroke="none" opacity="0.9">
                <animate attributeName="y" values="22;14;22" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
                <animate attributeName="height" values="0;8;0" dur="2.5s" begin="0.6s" repeatCount="indefinite" />
            </rect>
        </svg>
    )
}

export function AnimatedActivity() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Heartbeat / ECG line */}
            <polyline points="2 12 6 12 8 8 12 16 14 10 16 12 22 12">
                <animate
                    attributeName="stroke-dasharray"
                    values="0 60;60 0"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </polyline>
            {/* Trailing glow */}
            <polyline points="2 12 6 12 8 8 12 16 14 10 16 12 22 12" stroke={color} strokeWidth="3" opacity="0.15">
                <animate
                    attributeName="stroke-dasharray"
                    values="0 60;60 0"
                    dur="2s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="stroke-dashoffset"
                    values="10;0"
                    dur="2s"
                    repeatCount="indefinite"
                />
            </polyline>
        </svg>
    )
}

export function AnimatedClipboard() {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Clipboard body */}
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            {/* Animated check items sliding in */}
            <g>
                <line x1="8" y1="11" x2="16" y2="11" opacity="0.5">
                    <animate attributeName="opacity" values="0;0.5;0.5;0.5" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="8;16" dur="0.4s" fill="freeze" repeatCount="indefinite" />
                </line>
            </g>
            <g>
                <line x1="8" y1="15" x2="14" y2="15" opacity="0.5">
                    <animate attributeName="opacity" values="0;0;0.5;0.5" dur="3s" repeatCount="indefinite" />
                    <animate attributeName="x2" values="8;14" dur="0.4s" begin="0.5s" fill="freeze" repeatCount="indefinite" />
                </line>
            </g>
            {/* Animated checkmark */}
            <polyline points="8.5 11 10 12.5 13 9.5" strokeWidth="1.5" fill="none">
                <animate attributeName="stroke-dasharray" values="0 10;10 0" dur="0.5s" begin="1s" fill="freeze" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0;1;1" dur="3s" repeatCount="indefinite" />
            </polyline>
            <polyline points="8.5 15 10 16.5 13 13.5" strokeWidth="1.5" fill="none">
                <animate attributeName="stroke-dasharray" values="0 10;10 0" dur="0.5s" begin="1.5s" fill="freeze" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;0;0;1" dur="3s" repeatCount="indefinite" />
            </polyline>
        </svg>
    )
}

/* ─── Stats Section Icons (white, 32px, for blue cards) ─── */

const statSize = 32
const statColor = '#ffffff'

export function AnimatedStatClock() {
    return (
        <svg width={statSize} height={statSize} viewBox="0 0 24 24" fill="none" stroke={statColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="7">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="12" y1="12" x2="15.5" y2="14">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="30s" repeatCount="indefinite" />
            </line>
            <circle cx="12" cy="12" r="10" stroke={statColor} strokeWidth="1" fill="none" opacity="0.4">
                <animate attributeName="r" values="10;12;10" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
}

export function AnimatedStatEye() {
    return (
        <svg width={statSize} height={statSize} viewBox="0 0 24 24" fill="none" stroke={statColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Eye outline */}
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            {/* Iris */}
            <circle cx="12" cy="12" r="3" fill={statColor} fillOpacity="0.3" />
            {/* Pupil with scanning animation */}
            <circle cx="12" cy="12" r="1.5" fill={statColor}>
                <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Scanning sweep line */}
            <line x1="12" y1="5" x2="12" y2="19" stroke={statColor} strokeWidth="1" opacity="0">
                <animate attributeName="x1" values="5;19;5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="x2" values="5;19;5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.5;0" dur="3s" repeatCount="indefinite" />
            </line>
            {/* Blink effect */}
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="rgba(59,130,246,1)" stroke="none">
                <animate attributeName="opacity" values="0;0;0;0;1;0;0;0;0;0" dur="4s" repeatCount="indefinite" />
            </path>
        </svg>
    )
}

export function AnimatedStatTrendingUp() {
    return (
        <svg width={statSize} height={statSize} viewBox="0 0 24 24" fill="none" stroke={statColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Upward trend line */}
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeDasharray="40">
                <animate attributeName="stroke-dashoffset" values="40;0" dur="1.5s" fill="freeze" repeatCount="indefinite" />
            </polyline>
            {/* Arrow head */}
            <polyline points="17 6 23 6 23 12">
                <animate attributeName="opacity" values="0;0;1" dur="1.5s" fill="freeze" repeatCount="indefinite" />
            </polyline>
            {/* Glow trail */}
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={statColor} strokeWidth="4" opacity="0.15" strokeDasharray="40">
                <animate attributeName="stroke-dashoffset" values="40;0" dur="1.5s" fill="freeze" repeatCount="indefinite" />
            </polyline>
        </svg>
    )
}

export function AnimatedStatInfinity() {
    return (
        <svg width={statSize} height={statSize} viewBox="0 0 24 24" fill="none" stroke={statColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Infinity path */}
            <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4 2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z" strokeDasharray="52">
                <animate attributeName="stroke-dashoffset" values="52;0;0;-52" dur="3s" repeatCount="indefinite" />
            </path>
            {/* Glowing dot traveling the path */}
            <circle r="2" fill={statColor} opacity="0.6">
                <animateMotion dur="3s" repeatCount="indefinite" path="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4 2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4z" />
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
}

export function AnimatedCheckCircle() {
    return (
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Circle draws itself */}
            <circle cx="12" cy="12" r="10" strokeDasharray="63">
                <animate attributeName="stroke-dashoffset" values="63;0" dur="0.6s" fill="freeze" />
            </circle>
            {/* Checkmark draws after circle */}
            <polyline points="9 12 11.5 14.5 16 9.5" strokeDasharray="12">
                <animate attributeName="stroke-dashoffset" values="12;0" dur="0.3s" begin="0.5s" fill="freeze" />
                <animate attributeName="opacity" values="0;1" dur="0.01s" begin="0.5s" fill="freeze" />
            </polyline>
        </svg>
    )
}

/* ─── CountUp Component ─── */

export function CountUp({ end, suffix = '', duration = 2000 }) {
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(false)
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
            { threshold: 0.3 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [started])

    useEffect(() => {
        if (!started) return
        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * end))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [started, end, duration])

    return <span ref={ref}>{count}{suffix}</span>
}

/* ─── Smart Scheduling Section Icons ─── */

export function AnimatedCalendarHeader() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="currentColor" opacity="0.85">
                <animate attributeName="opacity" values="0.85;1;0.85" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="3" y="4" width="18" height="7" rx="2" fill="currentColor" />
            <line x1="16" y1="2" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* Grid dots animate in */}
            {[{ cx: 8, cy: 15 }, { cx: 12, cy: 15 }, { cx: 16, cy: 15 }, { cx: 8, cy: 19 }, { cx: 12, cy: 19 }].map((p, i) => (
                <circle key={i} cx={p.cx} cy={p.cy} r="1.2" fill="white">
                    <animate attributeName="opacity" values="0;1;1" dur="1.5s" begin={`${i * 0.15}s`} fill="freeze" repeatCount="indefinite" />
                    <animate attributeName="r" values="0;1.2" dur="0.3s" begin={`${i * 0.15}s`} fill="freeze" repeatCount="indefinite" />
                </circle>
            ))}
            {/* Pulse */}
            <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="white" strokeWidth="1" opacity="0">
                <animate attributeName="opacity" values="0;0.4;0" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="x" values="3;1;3" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="y" values="4;2;4" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="width" values="18;22;18" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="height" values="18;22;18" dur="2.5s" repeatCount="indefinite" />
            </rect>
        </svg>
    )
}

export function AnimatedSmallClock({ iconColor = '#2563EB', iconSize = 20 }) {
    return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="12" x2="12" y2="7">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="4s" repeatCount="indefinite" />
            </line>
            <line x1="12" y1="12" x2="15" y2="14">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="30s" repeatCount="indefinite" />
            </line>
        </svg>
    )
}

export function AnimatedSmallUsers({ iconColor = '#DB2777', iconSize = 20 }) {
    return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <g>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <animateTransform attributeName="transform" type="translate" values="3,0;0,0;0,0;3,0" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="3s" repeatCount="indefinite" />
            </g>
        </svg>
    )
}

export function AnimatedShieldCheck({ iconColor = '#059669', iconSize = 20 }) {
    return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {/* Shield outline draws itself */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeDasharray="60">
                <animate attributeName="stroke-dashoffset" values="60;0" dur="1s" fill="freeze" repeatCount="indefinite" />
            </path>
            {/* Checkmark appears after shield */}
            <polyline points="9 12 11 14 15 10" strokeDasharray="10">
                <animate attributeName="stroke-dashoffset" values="10;0" dur="0.4s" begin="0.8s" fill="freeze" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1" dur="0.01s" begin="0.8s" fill="freeze" repeatCount="indefinite" />
            </polyline>
            {/* Subtle glow pulse */}
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={iconColor} strokeWidth="3" fill="none" opacity="0">
                <animate attributeName="opacity" values="0;0.2;0" dur="2s" begin="1.5s" repeatCount="indefinite" />
            </path>
        </svg>
    )
}

export function AnimatedArrowRight({ iconColor = '#9CA3AF', iconSize = 18 }) {
    return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
            <line x1="5" y1="12" x2="19" y2="12">
                <animate attributeName="x1" values="5;7;5" dur="1.5s" repeatCount="indefinite" />
            </line>
            <polyline points="12 5 19 12 12 19">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                <animateTransform attributeName="transform" type="translate" values="0,0;2,0;0,0" dur="1.5s" repeatCount="indefinite" />
            </polyline>
        </svg>
    )
}

/* ─── Live Status Section Icons ─── */

export function AnimatedZap() {
    return (
        <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10">
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </polygon>
            {/* Flash effect */}
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10" fill="white" opacity="0">
                <animate attributeName="opacity" values="0;0.6;0" dur="2s" repeatCount="indefinite" />
            </polygon>
        </svg>
    )
}

export function AnimatedStatusDot({ dotColor, status }) {
    const pulseMap = {
        'in-use': { dur: '1.2s', maxR: '8' },
        'pre-op': { dur: '1.8s', maxR: '7' },
        'cleaning': { dur: '2.2s', maxR: '7' },
        'available': { dur: '2.5s', maxR: '7' }
    }
    const { dur, maxR } = pulseMap[status] || { dur: '2s', maxR: '7' }
    return (
        <svg width={12} height={12} viewBox="0 0 16 16" style={{ overflow: 'visible' }}>
            {/* Pulsing ring */}
            <circle cx="8" cy="8" r="6" fill="none" stroke={dotColor} strokeWidth="1.5" opacity="0">
                <animate attributeName="r" values={`6;${maxR}`} dur={dur} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur={dur} repeatCount="indefinite" />
            </circle>
            {/* Core dot */}
            <circle cx="8" cy="8" r="6" fill={dotColor}>
                <animate attributeName="r" values="5.5;6;5.5" dur={dur} repeatCount="indefinite" />
            </circle>
        </svg>
    )
}

export function AnimatedInfoDot() {
    return (
        <svg width={20} height={20} viewBox="0 0 20 20" style={{ minWidth: '20px', marginTop: '2px' }}>
            <circle cx="10" cy="10" r="10" fill="#DBEAFE">
                <animate attributeName="r" values="9;10;9" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="10" cy="10" r="3" fill={color}>
                <animate attributeName="r" values="2.5;3.5;2.5" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
        </svg>
    )
}
