import type { Config } from 'tailwindcss'

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
        },
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                'steel-blue': '#4483C7',
                valencia: '#CE3728',
                payne: '#586575',
                'black-pearl-dark': '#09223A',
                'black-pearl-light': '#1B4568',
            },
        },
    },
    plugins: [],
} satisfies Config
