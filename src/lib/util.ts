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
