export const blue = {
    700: '#09223a', //prev: didn't exist
    600: '#1b4568', //prev: didn't exist
    500: '#2986cc', //prev: 10233A
    400: '#549ED6', //prev: 1D4668
    300: '#9FC8E0', //prev: 2B84B9
    200: '#D4E7F5', //prev: 9FC8E0
    100: '#D6E4E8', //prev: D6E4E8
    DEFAULT: '#10233A',
}

export const orange = {
    700: '#F7B514',
    600: '#F7B514',
    500: '#F7B514',
    400: '#F7B514',
    300: '#F7B514',
    200: '#F7D67C',
    100: '#F3EFE0',
    DEFAULT: '#F7B514',
}

export const red = {
    700: '#CE3628',
    600: '#CE3628',
    500: '#CE3628',
    400: '#CE3628',
    300: '#CE3628',
    200: '#E9AFA9',
    100: '#E9AFA9',
    DEFAULT: '#CE3628',
}

export const grey = {
    700: '#313131',
    600: '#313131',
    500: '#313131',
    400: '#313131',
    300: '#313131',
    200: '#313131',
    100: '#313131',
    DEFAULT: '#313131',
}

export const white = {
    700: '#FFFFFF',
    600: '#FFFFFF',
    500: '#FFFFFF',
    400: '#FFFFFF',
    300: '#FFFFFF',
    200: '#FFFFFF',
    100: '#FFFFFF',
    DEFAULT: '#FFFFF',
}

const colors = { blue, orange, red, grey, white }

export type BrandColor = 'blue' | 'orange' | 'red' | 'grey' | 'white'
export type ShadeIndex = 700 | 600 | 500 | 400 | 300 | 200 | 100

export const getBrandColor = (color: BrandColor, shade?: ShadeIndex) => {
    return colors[color][shade ?? 'DEFAULT']
}
