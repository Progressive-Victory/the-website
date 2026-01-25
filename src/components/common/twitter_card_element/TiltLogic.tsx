'use client'

import styles from './tilt.module.css'
import { motion, useSpring, useTransform } from 'motion/react'
import { useState } from 'react'
import type React from 'react'

function useMousePosition() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
    }

    return { mousePosition, handleMouseMove }
}

export function TiltMessage({
    children,
    className,
    disabled = false,
    strength = 1,
    rotateMax = 10,
    zRotate = -2.5,
    hoverScale = 1.02,
}: {
    children: React.ReactNode
    className?: string
    disabled?: boolean
    strength?: number
    rotateMax?: number
    zRotate?: number
    hoverScale?: number
}) {
    const [isHovered, setIsHovered] = useState(false)
    const [canTilt, setCanTilt] = useState(false)
    const [elementPosition, setElementPosition] = useState({
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    })
    const { mousePosition, handleMouseMove } = useMousePosition()

    const tiltX = useSpring(0, { stiffness: 300, damping: 50 })
    const tiltY = useSpring(0, { stiffness: 300, damping: 50 })

    const rotateX = useTransform(tiltY, [-1, 1], [-rotateMax, rotateMax])
    const rotateY = useTransform(tiltX, [-1, 1], [-rotateMax, rotateMax])

    const handleMouseEnter = (e: React.MouseEvent) => {
        if (disabled) return
        setIsHovered(true)
        const rect = e.currentTarget.getBoundingClientRect()
        setElementPosition({
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height,
        })
    }

    const handleMouseLeave = () => {
        if (disabled) return
        setIsHovered(false)
        setCanTilt(false)
        tiltX.set(0)
        tiltY.set(0)
    }

    if (!disabled && isHovered && canTilt) {
        const x =
            (mousePosition.x - elementPosition.left) / elementPosition.width
        const y =
            (mousePosition.y - elementPosition.top) / elementPosition.height

        tiltX.set((x - 0.5) * 0.5 * strength)
        tiltY.set((y - 0.5) * -0.5 * strength)
    }

    return (
        <motion.div
            className={[styles.tilt, className].filter(Boolean).join(' ')}
            style={{
                rotateX: disabled ? 0 : rotateX,
                rotateY: disabled ? 0 : rotateY,
                transformPerspective: 1000,
            }}
            animate={{
                rotateZ: disabled ? 0 : isHovered ? zRotate : 0,
                scale: disabled ? 1 : isHovered ? hoverScale : 1,
            }}
            transition={{ duration: 0.2 }}
            onAnimationComplete={() => {
                if (!disabled && isHovered) setCanTilt(true)
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={disabled ? undefined : handleMouseMove}
        >
            {children}
        </motion.div>
    )
}
