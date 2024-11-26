export const classNames = (
    ...classes: (string | null | undefined | boolean | number)[]
): string => classes.filter((c) => c).join(' ')

export const normalize = (str: string): string =>
    str
        .toLowerCase()
        .normalize('NFD')
        .replace('œ', 'oe')
        .replace(/[^a-z0-9]/g, '')

const digits =
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'
const digitsMap = (() => {
    const digitsMap: Record<string, number> = {}
    for (var i = 0; i < digits.length; i++) {
        digitsMap[digits[i]] = i
    }
    return digitsMap
})()
export const intToBase64 = (int32: number): string => {
    let result = ''
    while (true) {
        result = digits[int32 & 0x3f] + result
        int32 >>>= 6
        if (int32 === 0) break
    }
    return result
}
export const base64ToInt = (digitsStr: string): number => {
    let result = 0
    for (var i = 0; i < digitsStr.length; i++) {
        result = (result << 6) + digitsMap[digitsStr[i]]
    }
    return result
}

export const splitText = (
    txt: string,
    maxWidth: number,
    ctx: CanvasRenderingContext2D
): string[] => {
    const lines: string[] = []
    let size = ctx.measureText(txt)
    if (size.width <= maxWidth) return [txt]

    const words = txt.split(' ')
    let line = words[0]
    for (const word of words.slice(1)) {
        const testLine = line + ' ' + word
        size = ctx.measureText(testLine)
        if (size.width > maxWidth) {
            lines.push(line)
            line = word
        } else {
            line = testLine
        }
    }
    lines.push(line)
    return lines
}

export const fillMultilineTextBot = (
    lines: string[],
    x: number,
    y: number,
    lineHeight: number,
    ctx: CanvasRenderingContext2D
) => {
    y -= (lines.length - 1) * lineHeight
    for (const line of lines) {
        ctx.fillText(line, x, y)
        y += lineHeight
    }
}

export const clamp = (n: number, min: number, max: number): number =>
    Math.min(Math.max(n, min), max)

export const tinyId = () => Math.random().toString(36).slice(2)

export function hslToRgb(h: number, s: number, l: number) {
    let r, g, b

    if (s === 0) {
        r = g = b = l // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s
        const p = 2 * l - q
        r = hueToRgb(p, q, h + 1 / 3)
        g = hueToRgb(p, q, h)
        b = hueToRgb(p, q, h - 1 / 3)
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function hueToRgb(p: number, q: number, t: number) {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
}
