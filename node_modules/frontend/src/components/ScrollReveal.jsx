import { useEffect, useRef, useState } from 'react'

/**
 * ScrollReveal wrapper — animates children into view when they enter the viewport.
 *
 * Props:
 *  - animation: 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'zoom-in' | 'fade' (default: 'fade-up')
 *  - delay: ms delay before animation starts (default: 0)
 *  - duration: ms transition duration (default: 700)
 *  - threshold: 0-1 how much must be visible (default: 0.15)
 *  - once: only animate once (default: true)
 *  - style: extra inline styles
 *  - className: extra class names
 */
export default function ScrollReveal({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 700,
    threshold = 0.15,
    once = true,
    style = {},
    className = '',
    ...props
}) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    if (once) observer.unobserve(el)
                } else if (!once) {
                    setVisible(false)
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold, once])

    const transition = `opacity ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`

    const transforms = {
        'fade-up': 'translateY(50px)',
        'fade-down': 'translateY(-50px)',
        'fade-left': 'translateX(-50px)',
        'fade-right': 'translateX(50px)',
        'zoom-in': 'scale(0.85)',
        'fade': 'none',
    }

    const hiddenTransform = transforms[animation] || transforms['fade-up']

    const animStyle = visible
        ? { opacity: 1, transform: 'translate(0, 0) scale(1)', transition }
        : { opacity: 0, transform: hiddenTransform, transition }

    return (
        <div
            ref={ref}
            className={className}
            style={{ ...animStyle, ...style }}
            {...props}
        >
            {children}
        </div>
    )
}
