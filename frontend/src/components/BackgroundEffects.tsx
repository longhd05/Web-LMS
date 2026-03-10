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
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
      {/* Aurora bands on top */}
      <motion.div
        className="absolute left-[-15%] top-[-18%] h-[42vh] w-[130%]"
        style={{
          background: 'radial-gradient(ellipse at 50% 55%, rgba(167, 243, 208, 0.45) 0%, rgba(110, 231, 183, 0.26) 35%, rgba(56, 189, 248, 0.2) 58%, transparent 75%)',
          filter: 'blur(22px)'
        }}
        animate={{
          x: [-30, 20, -10, -30],
          y: [0, 10, -4, 0],
          opacity: [0.55, 0.9, 0.65, 0.55],
          scaleX: [1, 1.08, 0.98, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute right-[-18%] top-[-12%] h-[36vh] w-[120%]"
        style={{
          background: 'radial-gradient(ellipse at 55% 40%, rgba(125, 211, 252, 0.42) 0%, rgba(196, 181, 253, 0.22) 40%, transparent 70%)',
          filter: 'blur(24px)'
        }}
        animate={{
          x: [15, -24, 12, 15],
          y: [0, -8, 6, 0],
          opacity: [0.4, 0.7, 0.5, 0.4],
          scaleX: [1.02, 0.95, 1.06, 1.02]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Twinkling stars */}
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
            opacity: [0.15, 1, 0.2, 0.9, 0.15],
            scale: [0.8, 1.35, 0.9, 1.2, 0.8]
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
          background: 'radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 38%, transparent 62%)'
        }}
        animate={{
          opacity: [0.2, 0.42, 0.26, 0.2],
          scale: [0.98, 1.03, 1, 0.98]
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}
