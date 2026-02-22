import { useEffect, useRef } from 'react'
import './OxygenBubbles.css'

export default function OxygenBubbles() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        let animationId

        // Mouse tracking — waves warp near cursor
        const mouse = { x: -9999, y: -9999 }
        const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY }
        const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999 }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseleave', handleMouseLeave)

        const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
        resize()
        window.addEventListener('resize', resize)

        // ── ECG wave shape (normalised 0-1 input → y offset) ──
        // Produces a realistic ECG PQRST waveform within one cycle
        function ecgShape(t) {
            // P wave
            if (t < 0.12) return 0.06 * Math.sin(Math.PI * t / 0.12)
            // PR segment
            if (t < 0.18) return 0
            // Q dip
            if (t < 0.22) return -0.08 * Math.sin(Math.PI * (t - 0.18) / 0.04)
            // R spike (tall)
            if (t < 0.30) return Math.sin(Math.PI * (t - 0.22) / 0.08)
            // S dip
            if (t < 0.36) return -0.18 * Math.sin(Math.PI * (t - 0.30) / 0.06)
            // ST segment
            if (t < 0.50) return 0
            // T wave
            if (t < 0.66) return 0.14 * Math.sin(Math.PI * (t - 0.50) / 0.16)
            // baseline
            return 0
        }

        // ── Pulse line config ──
        const WAVE_COUNT = 5
        const waves = []

        function createWaves() {
            waves.length = 0
            const h = canvas.height
            for (let i = 0; i < WAVE_COUNT; i++) {
                waves.push({
                    y: h * (0.15 + (i / (WAVE_COUNT - 1)) * 0.7),          // spread vertically
                    amplitude: 28 + Math.random() * 18,                      // R-spike height px
                    speed: 0.0006 + Math.random() * 0.0003,                  // scroll speed
                    cycleWidth: 220 + Math.random() * 80,                    // px per heartbeat
                    phase: Math.random() * 1000,                             // initial offset
                    opacity: 0.18 + Math.random() * 0.14,                    // base opacity
                    lineWidth: 1.2 + Math.random() * 0.8,
                    glowSize: 8 + Math.random() * 8,
                })
            }
        }
        createWaves()
        window.addEventListener('resize', createWaves)

        const MOUSE_RADIUS = 150

        function animate(time) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            for (const w of waves) {
                const offset = time * w.speed + w.phase
                const pulseGlow = 0.5 + 0.5 * Math.sin(time * 0.002 + w.phase) // gentle pulsing glow

                ctx.save()

                // Glow
                ctx.shadowColor = `rgba(59, 130, 246, ${w.opacity * pulseGlow})`
                ctx.shadowBlur = w.glowSize * pulseGlow

                ctx.strokeStyle = `rgba(96, 165, 250, ${w.opacity})`
                ctx.lineWidth = w.lineWidth
                ctx.lineJoin = 'round'
                ctx.lineCap = 'round'

                ctx.beginPath()

                const step = 2 // px per sample — smooth enough
                for (let px = -10; px <= canvas.width + 10; px += step) {
                    // Where in the repeating ECG cycle is this pixel?
                    const t = ((px + offset * w.cycleWidth) % w.cycleWidth + w.cycleWidth) % w.cycleWidth / w.cycleWidth

                    let yOff = ecgShape(t) * w.amplitude

                    // Mouse distortion — bulge wave away from cursor
                    const dx = px - mouse.x
                    const dy = w.y + yOff - mouse.y
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if (dist < MOUSE_RADIUS && dist > 0) {
                        const strength = (1 - dist / MOUSE_RADIUS) * 30
                        yOff += (dy / dist) * strength
                    }

                    const y = w.y + yOff
                    if (px === -10) ctx.moveTo(px, y)
                    else ctx.lineTo(px, y)
                }

                ctx.stroke()

                // Draw a brighter "scan dot" at the leading edge of the latest heartbeat
                const scanX = ((offset * w.cycleWidth) % canvas.width + canvas.width) % canvas.width
                const scanT = ((scanX + offset * w.cycleWidth) % w.cycleWidth + w.cycleWidth) % w.cycleWidth / w.cycleWidth
                let scanY = w.y + ecgShape(scanT) * w.amplitude

                // Mouse distortion on dot too
                const sdx = scanX - mouse.x
                const sdy = scanY - mouse.y
                const sDist = Math.sqrt(sdx * sdx + sdy * sdy)
                if (sDist < MOUSE_RADIUS && sDist > 0) {
                    scanY += (sdy / sDist) * (1 - sDist / MOUSE_RADIUS) * 30
                }

                const dotGlow = 0.6 + 0.4 * pulseGlow
                ctx.shadowColor = `rgba(96, 165, 250, ${dotGlow})`
                ctx.shadowBlur = 16
                ctx.beginPath()
                ctx.arc(scanX, scanY, 2.5, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(147, 197, 253, ${dotGlow})`
                ctx.fill()

                ctx.restore()
            }

            animationId = requestAnimationFrame(animate)
        }

        animationId = requestAnimationFrame(animate)

        return () => {
            cancelAnimationFrame(animationId)
            window.removeEventListener('resize', resize)
            window.removeEventListener('resize', createWaves)
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseleave', handleMouseLeave)
        }
    }, [])

    return <canvas ref={canvasRef} className="oxygen-bubbles" />
}
