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
