export function pascalToNormal(str: string): string {
    const pattern = /[a-z](?=[A-Z])/
    const pascalBounds: number[] = []

    for (let i = 0; i < str.length - 1; i++) {
        const sample = str.substring(i, i + 2)
        if (pattern.test(sample)) pascalBounds.push(i)
    }

    const slicedStr: string[] = []
    slicedStr.push(str.slice(0, pascalBounds[0] + 1))
    for (let i = 0; i < pascalBounds.length - 1; i++) {
        slicedStr.push(str.slice(pascalBounds[i] + 1, pascalBounds[i + 1] + 1))
    }
    slicedStr.push(str.slice(pascalBounds[pascalBounds.length - 1] + 1))

    return slicedStr.join(' ')
}
