import { useEffect, useRef } from 'react'
import './ScrollIntro.css'

export default function ScrollIntro() {
    const containerRef = useRef(null)
    const stickyRef = useRef(null)
    const imageRef = useRef(null)
    const overlayRef = useRef(null)
    const titleRef = useRef(null)
    const scrollHintRef = useRef(null)

    useEffect(() => {
        const container = containerRef.current
        const image = imageRef.current
        const overlay = overlayRef.current
        const title = titleRef.current
        const scrollHint = scrollHintRef.current

        const handleScroll = () => {
            const rect = container.getBoundingClientRect()
            const containerTop = window.scrollY + rect.top
            const containerHeight = container.offsetHeight
            const viewportHeight = window.innerHeight

            const scrollable = containerHeight - viewportHeight
            const scrolled = Math.max(0, window.scrollY - containerTop)
            const progress = Math.min(1, scrolled / scrollable)

            // Image: zoom in as user scrolls
            const scale = 1 + progress * 0.45
            image.style.transform = `scale(${scale})`

            // Overlay: darken slightly
            const overlayOpacity = 0.55 + progress * 0.25
            overlay.style.backgroundColor = `rgba(5, 10, 20, ${overlayOpacity})`

            // Title: drift up and fade out in the last 40% of scroll
            const titleProgress = Math.max(0, (progress - 0.5) / 0.5)
            const titleOpacity = Math.max(0, 1 - titleProgress * 1.6)
            const titleY = titleProgress * -60
            title.style.opacity = titleOpacity
            title.style.transform = `translateY(${titleY}px)`

            // Scroll hint: fade out early
            const hintOpacity = Math.max(0, 1 - progress * 4)
            scrollHint.style.opacity = hintOpacity
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div ref={containerRef} className="scroll-intro-container">
            <div ref={stickyRef} className="scroll-intro-sticky">
                {/* Background image */}
                <div className="scroll-intro-image-wrap">
                    <img
                        ref={imageRef}
                        src="/Gemini.png"
                        alt="Surgical theatre"
                        className="scroll-intro-image"
                    />
                </div>

                {/* Dark overlay */}
                <div ref={overlayRef} className="scroll-intro-overlay" />

                {/* Ambient glow */}
                <div className="scroll-intro-glow" />

                {/* Content */}
                <div className="scroll-intro-content">
                    <div ref={titleRef} className="scroll-intro-title-group">
                        <span className="scroll-intro-eyebrow">Digital Theatre Operations</span>
                        <h1 className="scroll-intro-title">TheatreX</h1>
                        <p className="scroll-intro-tagline">
                            Precision. Efficiency. Intelligence.
                        </p>
                    </div>

                    {/* Scroll hint */}
                    <div ref={scrollHintRef} className="scroll-intro-hint">
                        <span className="scroll-hint-text">Scroll to explore</span>
                        <div className="scroll-hint-mouse">
                            <div className="scroll-hint-wheel" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
