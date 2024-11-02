export const classNames = (
    ...classes: (string | null | undefined | boolean | number)[]
): string => classes.filter((c) => c).join(' ')
