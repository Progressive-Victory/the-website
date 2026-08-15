import endorsementStyles from '../endorsement.module.css'
import { type CandidateConfig } from '../endorsements.data'
import { waveListVariants } from '../endorsements.motion'
import styles from './CandidateCarousel.module.css'
import { ElectionStatusBadge } from './ElectionStatusBadge'
import { PersonCard } from '@/components/common'
import { motion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const carouselItemVariants = {
    hidden: { opacity: 0, filter: 'blur(3px)' },
    visible: {
        opacity: 1,
        filter: 'blur(0px)',
        transition: { type: 'spring', stiffness: 260, damping: 24, mass: 0.82 },
    },
} as const

interface CandidateCarouselProps {
    candidates: CandidateConfig[]
    gap?: number
    arcSpan?: number
    horizontalRadius?: number
    scaleRange?: [number, number]
}

export function CandidateCarousel({
    candidates,
    gap = 140,
    arcSpan = 2.4,
    horizontalRadius = 65,
    scaleRange = [0.85, 1],
}: CandidateCarouselProps) {
    const visibleRange = 800
    const [scrollOffset, setScrollOffset] = useState(0)
    const [mounted, setMounted] = useState(false)
    const rafRef = useRef<number>(0)

    const trackLength = candidates.length * gap

    const items = useMemo(() => {
        const result: { candidate: CandidateConfig; index: number }[] = []
        const copies = Math.ceil((visibleRange * 2) / trackLength) + 1
        for (let c = 0; c < copies; c++) {
            for (let i = 0; i < candidates.length; i++) {
                result.push({
                    candidate: candidates[i],
                    index: c * candidates.length + i,
                })
            }
        }
        return result
    }, [candidates, trackLength, visibleRange])

    useEffect(() => {
        setMounted(true)
        let last = performance.now()
        const speed = 0.1

        const tick = (now: number) => {
            const delta = now - last
            last = now
            setScrollOffset((prev) => prev + delta * speed)
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    }, [])

    if (!mounted) return <div className={styles.carousel} />

    return (
        <motion.div
            className={styles.carousel}
            variants={waveListVariants}
            initial="hidden"
            animate="visible"
        >
            {items.map(({ candidate, index }) => {
                const linearPos = index * gap - scrollOffset
                const wrapped =
                    ((linearPos % trackLength) + trackLength) % trackLength
                const centered = wrapped - trackLength / 2

                const isVisible = Math.abs(centered) <= visibleRange
                const t = centered / visibleRange
                const arcAngle = t * (arcSpan / 2)
                const xPos = Math.sin(arcAngle) * horizontalRadius
                const depth = (Math.cos(arcAngle) + 1) / 2
                const scale =
                    scaleRange[0] + (scaleRange[1] - scaleRange[0]) * depth
                const yOffset = (1 - depth) * 6

                return (
                    <motion.div
                        key={`${candidate.id}-${index}`}
                        className={styles.tile}
                        variants={carouselItemVariants}
                        style={{
                            left: `${50 + xPos}%`,
                            transform: `translateX(-50%) translateY(${yOffset}px) scale(${scale})`,
                            zIndex: Math.round(depth * 100),
                            visibility: isVisible ? 'visible' : 'hidden',
                        }}
                    >
                        <PersonCard
                            name={candidate.name}
                            imageSrc={candidate.image}
                            imageSize={92}
                            imageFrameClassName={
                                candidate.avatarBackgroundColor === 'blue'
                                    ? endorsementStyles.tileImageFramePledge
                                    : endorsementStyles.tileImageFrameNoPledge
                            }
                            badge={
                                <ElectionStatusBadge
                                    electionStatus={candidate.electionStatus}
                                />
                            }
                        />
                    </motion.div>
                )
            })}
        </motion.div>
    )
}
