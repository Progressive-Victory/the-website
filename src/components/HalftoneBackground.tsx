import type React from 'react'

interface HalftoneBackgroundProps {
    opacity?: number
}

export function HalftoneBackground({ opacity = 0.1 }: HalftoneBackgroundProps) {
    return (
        <div
            style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',

                backgroundColor: 'black',
                filter: 'contrast(55)',
                opacity,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,

                    backgroundImage:
                        'radial-gradient(circle at center, white 10%, transparent 96%)',
                    backgroundSize: '0.45rem 0.45rem',
                    backgroundRepeat: 'round',
                    backgroundPosition: 'center',

                    WebkitMaskImage:
                        'linear-gradient(45deg, transparent 5%, rgb(255,255,255) 10%, rgba(255,255,255,0.5) 96%)',
                    maskImage:
                        'linear-gradient(45deg, transparent 5%, rgb(255,255,255) 10%, rgba(255,255,255,0.5) 96%)',
                }}
            />
        </div>
    )
}
