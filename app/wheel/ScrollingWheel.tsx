'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icons from '@/components/icons'

interface ScrollingWheelProps {
  candidates: Array<{ studentUsername: string; tickets: number }>
  status: 'idle' | 'spinning' | 'done'
  winnerUsername?: string
  winnerTicketIndex?: number
}

export default function ScrollingWheel({ candidates, status, winnerUsername, winnerTicketIndex }: ScrollingWheelProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Create a list of all names (repeated based on tickets)
  const allNames = candidates.flatMap(c => 
    Array(c.tickets).fill(c.studentUsername)
  )

  useEffect(() => {
    if (status === 'spinning' && !isScrolling) {
      startScrolling()
    } else if (status === 'idle') {
      // Gentle scrolling when idle
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % allNames.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [status, allNames.length])

  const startScrolling = () => {
    if (!winnerUsername) return
    
    setIsScrolling(true)
    
    // Find winner index
    const winnerIndex = allNames.findIndex(name => name === winnerUsername)
    if (winnerIndex === -1) return

    let speed = 50 // Start fast
    let iterations = 0
    const maxIterations = 100 // Total scroll iterations
    
    const scroll = () => {
      setCurrentIndex(prev => (prev + 1) % allNames.length)
      iterations++
      
      // Gradually slow down
      if (iterations > maxIterations * 0.7) {
        speed += 20 // Slow down significantly
      } else if (iterations > maxIterations * 0.5) {
        speed += 10
      }
      
      // Stop at winner
      if (iterations >= maxIterations) {
        // Ensure we land on winner
        setCurrentIndex(winnerIndex)
        setIsScrolling(false)
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current)
        }
        return
      }
      
      scrollIntervalRef.current = setTimeout(scroll, speed)
    }
    
    scroll()
  }

  // Get visible names (current and neighbors)
  const getVisibleNames = () => {
    const visible = []
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + allNames.length) % allNames.length
      visible.push({
        name: allNames[index],
        offset: i,
        index
      })
    }
    return visible
  }

  const visibleNames = getVisibleNames()

  return (
    <div className="relative">
      {/* Scrolling Container */}
      <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 overflow-hidden border-4 border-primary/20 shadow-xl">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
        
        {/* Winner indicator (center line) */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="flex items-center justify-center gap-2">
            <div className="flex-1 h-1 bg-gradient-to-r from-transparent via-red-500 to-red-500" />
            <div className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
              ← الفائز
            </div>
            <div className="flex-1 h-1 bg-gradient-to-l from-transparent via-red-500 to-red-500" />
          </div>
        </div>
        
        {/* Names container */}
        <div className="relative h-96 flex flex-col items-center justify-center">
          <AnimatePresence mode="popLayout">
            {visibleNames.map((item, idx) => {
              const isCenter = item.offset === 0
              const opacity = isCenter ? 1 : Math.max(0.2, 1 - Math.abs(item.offset) * 0.3)
              const scale = isCenter ? 1.2 : Math.max(0.7, 1 - Math.abs(item.offset) * 0.15)
              
              return (
                <motion.div
                  key={`${item.index}-${idx}`}
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ 
                    y: item.offset * 80,
                    opacity,
                    scale
                  }}
                  exit={{ y: 50, opacity: 0 }}
                  transition={{ 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  className={`absolute ${
                    isCenter 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-2xl border-4 border-white' 
                      : 'bg-white text-neutral-700 border-2 border-neutral-200'
                  } px-8 py-4 rounded-xl font-bold text-xl text-center min-w-[300px]`}
                  style={{
                    zIndex: isCenter ? 30 : 10 - Math.abs(item.offset)
                  }}
                >
                  {item.name}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
      </div>
      
      {/* Status Messages */}
      <div className="mt-6">
        {status === 'idle' && (
          <div className="text-center text-neutral-600">
            <div className="mb-2 flex justify-center">
              <Icons.clock className="w-6 h-6" />
            </div>
            <p>في انتظار السحب...</p>
            <p className="text-sm mt-2">عدد المشاركين: {candidates.length}</p>
          </div>
        )}
        
        {isScrolling && (
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="mb-2 flex justify-center"
            >
              <Icons.dice className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="text-lg font-bold text-primary">جاري السحب...</p>
          </div>
        )}
        
        {status === 'done' && !isScrolling && winnerUsername && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-md mx-auto">
              <p className="text-sm text-green-600 font-medium mb-2">الفائز في السحب</p>
              <p className="text-3xl font-bold text-green-700 mb-2">{winnerUsername}</p>
              <p className="text-sm text-neutral-600">مبروك! 🎊</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
