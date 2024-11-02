import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { writable } from 'svelte/store'

export const showCompleted = writable(
    (localStorage.getItem('showCompleted') ?? 'true') === 'true'
)
showCompleted.subscribe((value) => {
    localStorage.setItem('showCompleted', value.toString())
})

const readCompleted = (): string[] => {
    const completedRaw = localStorage.getItem('finishedQuests')
    if (completedRaw) {
        const completedStr = decompressFromBase64(completedRaw)
        const completedJson: string[] = JSON.parse(completedStr)
        return Array.from(new Set(completedJson))
    }
    return []
}
const storeCompleted = (completed: string[]) => {
    const completedJson = JSON.stringify(Array.from(new Set(completed)))
    const completedStr = compressToBase64(completedJson)
    localStorage.setItem('finishedQuests', completedStr)
}
export const completed = writable(readCompleted())
let localCompleted: string[]
completed.subscribe((value) => {
    storeCompleted(value)
    localCompleted = value
})

export const getRawCompleted = () => {
    const completedJson = JSON.stringify(Array.from(new Set(localCompleted)))
    const completedStr = compressToBase64(completedJson)
    return completedStr
}
export const setRawCompleted = (completedStr: string) => {
    const completedJson = decompressFromBase64(completedStr)
    const completedVal = JSON.parse(completedJson)
    completed.set(completedVal)
}
