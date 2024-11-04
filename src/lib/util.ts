export const classNames = (
    ...classes: (string | null | undefined | boolean | number)[]
): string => classes.filter((c) => c).join(' ')

export const normalize = (str: string): string =>
    str
        .toLowerCase()
        .normalize('NFD')
        .replace('œ', 'oe')
        .replace(/[^a-z0-9]/g, '')
