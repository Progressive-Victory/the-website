import { Logo } from '@/components/common'
import React from 'react'

export function BlogHeader() {
    function DoubleTextEffect(
        text = 'Test',
        upperColor = '#09223a',
        lowerColor = '#4483C7'
    ) {
        const words = text.split(' ')
        return (
            <div aria-label={text}>
                {words.map((word, index) => (
                    <div key={index} className="relative inline-block">
                        <span
                            className="absolute bottom-0.5 right-0.5 tracking-wide"
                            style={{ color: upperColor }}
                        >
                            {word}
                        </span>
                        <span
                            className="tracking-wide"
                            style={{ color: lowerColor }}
                        >
                            {word}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-2 bg-white py-5">
            <div className="grid content-center text-right text-2xl font-extrabold text-[#09223a] sm:text-4xl md:text-5xl lg:text-6xl">
                {DoubleTextEffect('Progressive'.toUpperCase())}
                {DoubleTextEffect('Victory'.toUpperCase())}
                {DoubleTextEffect('Blog'.toUpperCase(), '#4483C7', '#09223a')}
            </div>
            <div className="sm:w-50 lg:w-70 relative inline-block w-40 md:w-60">
                <Logo className="absolute bottom-1 left-1" />
                <Logo pColor="#4483C7" />
            </div>
        </div>
    )
}
