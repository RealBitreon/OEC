'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface WheelSpinnerProps {
  candidates: Array<{ studentUsername: string; tickets: number }>
  status: 'idle' | 'spinning' | 'done'
  winnerUsername?: string
  winnerTicketIndex?: number
}

export default function WheelSpinner({ candidates, status, winnerUsername, winnerTicketIndex }: WheelSpinnerProps) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Calculate segments based on tickets
  const totalTickets = candidates.reduce((sum, c) => sum + c.tickets, 0)
  const segments = candidates.map((c, idx) => ({
    username: c.studentUsername,
    tickets: c.tickets,
    percentage: (c.tickets / totalTickets) * 100,
    startAngle: 0, // Will be calculated
    endAngle: 0,   // Will be calculated
    color: `hsl(${(idx * 360) / candidates.length}, 70%, 60%)`
  }))

  // Calculate angles
  let currentAngle = 0
  segments.forEach(seg => {
    seg.startAngle = currentAngle
    seg.endAngle = currentAngle + (seg.tickets / totalTickets) * 360
    currentAngle = seg.endAngle
  })

  useEffect(() => {
    if (status === 'spinning' && !isSpinning) {
      spinWheel()
    } else if (status === 'idle') {
      // Gentle rotation animation
      const interval = setInterval(() => {
        setRotation(prev => (prev + 0.5) % 360)
      }, 50)
      return () => clearInterval(interval)
    }
  }, [status])

  useEffect(() => {
    drawWheel()
  }, [rotation, candidates])

  const spinWheel = () => {
    if (!winnerUsername || winnerTicketIndex === undefined) return
    
    setIsSpinning(true)
    
    // Calculate winner angle
    const winnerSegment = segments.find(s => s.username === winnerUsername)
    if (!winnerSegment) return
    
    const targetAngle = (winnerSegment.startAngle + winnerSegment.endAngle) / 2
    const spins = 5 // Number of full rotations
    const finalRotation = 360 * spins + (360 - targetAngle) + 90 // Point to top
    
    // Animate
    const duration = 5000
    const startTime = Date.now()
    const startRotation = rotation
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3)
      
      const newRotation = startRotation + finalRotation * eased
      setRotation(newRotation % 360)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsSpinning(false)
      }
    }
    
    requestAnimationFrame(animate)
  }

  const drawWheel = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Save context
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Draw segments
    segments.forEach((seg, idx) => {
      const startAngle = (seg.startAngle * Math.PI) / 180
      const endAngle = (seg.endAngle * Math.PI) / 180
      
      // Draw segment
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 3
      ctx.stroke()
      
      // Draw text
      ctx.save()
      const midAngle = (startAngle + endAngle) / 2
      ctx.rotate(midAngle)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 14px Arial'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(seg.username, radius - 20, 5)
      ctx.restore()
    })
    
    // Draw center circle
    ctx.beginPath()
    ctx.arc(0, 0, 30, 0, 2 * Math.PI)
    ctx.fillStyle = '#fff'
    ctx.fill()
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 3
    ctx.stroke()
    
    ctx.restore()
    
    // Draw pointer (at top)
    ctx.beginPath()
    ctx.moveTo(centerX, 10)
    ctx.lineTo(centerX - 15, 40)
    ctx.lineTo(centerX + 15, 40)
    ctx.closePath()
    ctx.fillStyle = '#ff0000'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="mx-auto max-w-full"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      
      {status === 'idle' && (
        <div className="text-center mt-4 text-neutral-600">
          <div className="text-2xl mb-2">⏳</div>
          <p>في انتظار السحب...</p>
        </div>
      )}
      
      {isSpinning && (
        <div className="text-center mt-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-4xl mb-2"
          >
            🎲
          </motion.div>
          <p className="text-lg font-bold text-primary">جاري السحب...</p>
        </div>
      )}
      
      {status === 'done' && !isSpinning && winnerUsername && (
        <div className="text-center mt-4">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-lg font-bold text-green-600">الفائز: {winnerUsername}</p>
        </div>
      )}
    </div>
  )
}
