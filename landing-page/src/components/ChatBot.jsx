import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import './ChatBot.css'

const FAQ_DATA = [
    {
        keywords: ['what', 'theatrex', 'about', 'what is', 'do'],
        answer: 'TheatreX is a digital platform that streamlines hospital surgical theatre operations — real-time monitoring, smart scheduling, staff management, and analytics all in one place.'
    },
    {
        keywords: ['feature', 'features', 'can', 'offer', 'capability'],
        answer: 'TheatreX offers: Real-time theatre status monitoring, Smart scheduling with conflict detection, Staff management & shift tracking, Analytics & insights dashboards, Automated notifications, and Resource optimization.'
    },
    {
        keywords: ['demo', 'try', 'test', 'trial', 'free'],
        answer: 'Yes! You can request a free demo by clicking the "Request Demo" button in our navigation bar, or scroll down to our contact section. Our team will walk you through the platform.'
    },
    {
        keywords: ['price', 'cost', 'pricing', 'plan', 'subscription', 'pay'],
        answer: 'TheatreX offers flexible pricing based on hospital size and needs. Contact us through the demo request form and our team will provide a customized quote for your institution.'
    },
    {
        keywords: ['schedule', 'scheduling', 'book', 'booking', 'calendar'],
        answer: 'Our smart scheduling system auto-detects conflicts, suggests optimal time slots, supports drag & drop, and sends real-time notifications to all assigned staff when changes occur.'
    },
    {
        keywords: ['team', 'who', 'built', 'developer', 'create'],
        answer: 'TheatreX is built by a dedicated team of 6 developers and healthcare tech enthusiasts. You can meet our team in the Team section below!'
    },
    {
        keywords: ['contact', 'reach', 'email', 'support', 'help'],
        answer: 'You can reach us through the Contact section at the bottom of this page, or request a demo directly. We typically respond within 24 hours.'
    },
    {
        keywords: ['security', 'secure', 'data', 'privacy', 'safe', 'encrypt'],
        answer: 'TheatreX uses enterprise-grade encryption, role-based access controls, and follows healthcare data protection standards. Your data security is our top priority.'
    },
    {
        keywords: ['hospital', 'clinic', 'integrate', 'integration', 'system'],
        answer: 'TheatreX is designed for hospitals of all sizes. It can integrate with existing hospital management systems and is built to scale with your needs.'
    },
    {
        keywords: ['real-time', 'live', 'monitor', 'status', 'track'],
        answer: 'Our live dashboard shows real-time theatre occupancy, procedure progress, cleaning status, staff assignments, and automated alerts — all updating instantly.'
    },
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
        answer: 'Hello! 👋 Welcome to TheatreX. I can help answer questions about our platform, features, pricing, or anything else. What would you like to know?'
    },
    {
        keywords: ['thank', 'thanks', 'bye', 'goodbye'],
        answer: 'You\'re welcome! If you have more questions, feel free to ask anytime. You can also request a demo to see TheatreX in action! 😊'
    },
]

const QUICK_REPLIES = [
    'What is TheatreX?',
    'Key features',
    'Request a demo',
    'Pricing info',
    'Is it secure?',
]

function findAnswer(input) {
    const lower = input.toLowerCase().trim()

    let bestMatch = null
    let bestScore = 0

    for (const faq of FAQ_DATA) {
        let score = 0
        for (const kw of faq.keywords) {
            if (lower.includes(kw)) score++
        }
        if (score > bestScore) {
            bestScore = score
            bestMatch = faq
        }
    }

    if (bestMatch && bestScore > 0) return bestMatch.answer

    return "I'm not sure about that, but I'd love to help! You can request a demo for a detailed walkthrough, or try asking about our features, scheduling, security, or pricing."
}

export default function ChatBot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hi there! 👋 I\'m the TheatreX assistant. Ask me anything about our platform, or pick a topic below!' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        }
    }, [])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const sendMessage = (text) => {
        if (!text.trim()) return

        const userMsg = { from: 'user', text: text.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // Simulate typing delay
        const delay = 400 + Math.random() * 600
        typingTimeoutRef.current = setTimeout(() => {
            const answer = findAnswer(text)
            setMessages(prev => [...prev, { from: 'bot', text: answer }])
            setIsTyping(false)
            typingTimeoutRef.current = null
        }, delay)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        sendMessage(input)
    }

    const handleQuickReply = (text) => {
        sendMessage(text)
    }

    return (
        <>
            {/* Floating toggle button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'chatbot-toggle-open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <span className="chatbot-toggle-icon">
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </span>
                {!isOpen && <span className="chatbot-toggle-pulse" />}
            </button>

            {/* Chat panel */}
            <div className={`chatbot-panel ${isOpen ? 'chatbot-panel-open' : ''}`}>
                {/* Header */}
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-avatar">
                            <Bot size={20} />
                        </div>
                        <div>
                            <div className="chatbot-header-name">TheatreX Assistant</div>
                            <div className="chatbot-header-status">
                                <span className="chatbot-status-dot" />
                                Online
                            </div>
                        </div>
                    </div>
                    <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="chatbot-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`chatbot-msg chatbot-msg-${msg.from}`}>
                            {msg.from === 'bot' && (
                                <div className="chatbot-msg-avatar">
                                    <Bot size={14} />
                                </div>
                            )}
                            <div className={`chatbot-bubble chatbot-bubble-${msg.from}`}>
                                {msg.text}
                            </div>
                            {msg.from === 'user' && (
                                <div className="chatbot-msg-avatar chatbot-msg-avatar-user">
                                    <User size={14} />
                                </div>
                            )}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chatbot-msg chatbot-msg-bot">
                            <div className="chatbot-msg-avatar"><Bot size={14} /></div>
                            <div className="chatbot-bubble chatbot-bubble-bot chatbot-typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick replies — only show when few messages */}
                {messages.length <= 2 && (
                    <div className="chatbot-quick-replies">
                        {QUICK_REPLIES.map((q, i) => (
                            <button key={i} className="chatbot-quick-btn" onClick={() => handleQuickReply(q)}>
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form className="chatbot-input-area" onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        className="chatbot-input"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxLength={300}
                    />
                    <button type="submit" className="chatbot-send" disabled={!input.trim()} aria-label="Send message">
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </>
    )
}
