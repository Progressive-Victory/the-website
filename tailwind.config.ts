import type { Config } from 'tailwindcss'

export default {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    variants: {
        extend: {
            padding: ['last'],
            display: ['group-hover'],
        },
    },
    theme: {
        fontFamily: {
            sans: ['Inter', 'sans-serif'],
            serif: ['Merriweather', 'serif'],
            mono: [
                'ui-monospace',
                'SFMono-Regular',
                'Menlo',
                'Monaco',
                'Consolas',
                'Liberation Mono',
                'Courier New',
                'monospace',
            ],
        },
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                payne: '#586575',
                'steel-blue': '#4483C7',
                valencia: '#CE3728',
                'valencia-light': '#EBAFA9',
                'black-pearl-dark': '#09223A',
                'black-pearl-light': '#1B4568',
                'curious-blue-core': '#2986CC',
                'curious-blue-80': '#549ED6',
                'curious-blue-40': '#9FC9E8',
                'curious-blue-20': '#D4E7F5',
                'selective-yellow-core': '#FDB515',
                'selective-yellow-50': '#FED67C',
                'selective-yellow-15': '#F5F0E0',
            },
        },
    },
    plugins: [],
} satisfies Config
