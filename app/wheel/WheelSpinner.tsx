'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Icons from '@/components/icons'

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
    const radius = Math.min(centerX, centerY) - 20
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw outer ring shadow
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.beginPath()
    ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fill()
    ctx.restore()
    
    // Save context
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    
    // Draw segments with premium styling
    segments.forEach((seg, idx) => {
      const startAngle = (seg.startAngle * Math.PI) / 180
      const endAngle = (seg.endAngle * Math.PI) / 180
      
      // Draw segment with gradient
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, radius)
      gradient.addColorStop(0, seg.color)
      gradient.addColorStop(1, adjustBrightness(seg.color, -20))
      
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 4
      ctx.stroke()
      
      // Add glossy highlight
      ctx.save()
      ctx.clip()
      const highlightGradient = ctx.createRadialGradient(0, -radius * 0.3, 0, 0, -radius * 0.3, radius * 0.8)
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
      highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = highlightGradient
      ctx.fill()
      ctx.restore()
      
      // Draw text with better styling
      ctx.save()
      const midAngle = (startAngle + endAngle) / 2
      ctx.rotate(midAngle)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 16px Cairo, Arial'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetX = 2
      ctx.shadowOffsetY = 2
      ctx.fillText(seg.username, radius - 25, 6)
      ctx.restore()
    })
    
    // Draw center hub with gradient
    const centerGradient = ctx.createRadialGradient(0, -10, 0, 0, 0, 40)
    centerGradient.addColorStop(0, '#ffffff')
    centerGradient.addColorStop(1, '#e5e5e5')
    
    ctx.beginPath()
    ctx.arc(0, 0, 40, 0, 2 * Math.PI)
    ctx.fillStyle = centerGradient
    ctx.fill()
    ctx.strokeStyle = '#0ea5e9'
    ctx.lineWidth = 4
    ctx.stroke()
    
    // Add center shine
    ctx.beginPath()
    ctx.arc(-8, -8, 15, 0, 2 * Math.PI)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.fill()
    
    ctx.restore()
    
    // Draw premium pointer (at top)
    const pointerGradient = ctx.createLinearGradient(centerX - 20, 0, centerX + 20, 0)
    pointerGradient.addColorStop(0, '#ef4444')
    pointerGradient.addColorStop(0.5, '#dc2626')
    pointerGradient.addColorStop(1, '#ef4444')
    
    ctx.beginPath()
    ctx.moveTo(centerX, 15)
    ctx.lineTo(centerX - 18, 50)
    ctx.lineTo(centerX + 18, 50)
    ctx.closePath()
    ctx.fillStyle = pointerGradient
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Add pointer shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
    ctx.shadowBlur = 8
    ctx.shadowOffsetY = 4
  }
  
  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, amount: number) => {
    const hsl = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hsl) return color
    const h = parseInt(hsl[1])
    const s = parseInt(hsl[2])
    const l = Math.max(0, Math.min(100, parseInt(hsl[3]) + amount))
    return `hsl(${h}, ${s}%, ${l}%)`
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
          <div className="mb-2"><Icons.clock className="w-6 h-6" /></div>
          <p>في انتظار السحب...</p>
        </div>
      )}
      
      {isSpinning && (
        <div className="text-center mt-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="text-4xl mb-2"
          ><Icons.dice className="w-6 h-6" /></motion.div>
          <p className="text-lg font-bold text-primary">جاري السحب...</p>
        </div>
      )}
      
      {status === 'done' && !isSpinning && winnerUsername && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mt-8"
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
  )
}
