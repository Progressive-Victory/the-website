export const brandDarkBlue = {
    200: '#09223A', //Core
    100: '#1B4568', //Light
    DEFAULT: '#09223A', //Black Pearl
}

export const brandLightBlue = {
    400: '#2986CC', //Core
    300: '#549ED6', //80%
    200: '#9FC9E8', //40%
    100: '#D4E7F5', //20%
    DEFAULT: '#2986CC', //Curious Blue
}

export const brandRed = {
    200: '#CE3728', //Core
    100: '#EBAFA9', //40%
    DEFAULT: '#CE3728', //Valencia
}

export const brandYellow = {
    300: '#FDB515', //Core
    200: '#FED67C', //50%
    100: '#F5F0E0', //15%
    DEFAULT: '#FDB515', //Selective Yellow
}

export const brandWhite = {
    100: '#FFFFFF', //Core
    DEFAULT: '#FFFFFF', //When In Doubt White
}

export const offBrandGrey = {
    100: '#313131',
    DEFAULT: '#313131',
}

export const mapBlue = {
    //was previous just labled blue
    700: '#09223A', //prev: didn't exist
    600: '#1b4568', //prev: didn't exist
    500: '#2986CC', //prev: 10233A
    400: '#549ED6', //prev: 1D4668
    300: '#9FC8E0', //prev: 2B84B9
    200: '#D4E7F5', //prev: 9FC8E0
    100: '#D6E4E8', //prev: D6E4E8
    DEFAULT: '#09223A', //prev: 10233A
}

const colors = {
    brandDarkBlue,
    brandLightBlue,
    brandRed,
    brandYellow,
    brandWhite,
    offBrandGrey,
    mapBlue,
}

export type BrandColor =
    | 'brandDarkBlue'
    | 'brandLightBlue'
    | 'brandRed'
    | 'brandYellow'
    | 'brandWhite'
    | 'offBrandGrey'
    | 'mapBlue'
export type ShadeIndex = 700 | 600 | 500 | 400 | 300 | 200 | 100

export const getBrandColor = (color: BrandColor, shade?: ShadeIndex) => {
    const shades = colors[color]
    return shades[shade ?? 'DEFAULT'] ?? shades.DEFAULT
}
