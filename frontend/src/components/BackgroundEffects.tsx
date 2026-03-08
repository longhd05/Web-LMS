import { motion } from 'framer-motion'
import { useMemo } from 'react'

interface Sparkle {
  id: number
  left: string
  top: string
  size: number
  duration: number
  delay: number
}

export default function BackgroundEffects() {
  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 5
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[999]">
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: sparkle.left,
            top: sparkle.top,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Subtle Shimmer Gradient */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 0%, transparent 50%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [0.98, 1.02, 0.98]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
