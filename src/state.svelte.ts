import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { writable } from 'svelte/store'

export const showCompleted = writable(
    (localStorage.getItem('showCompleted') ?? 'true') === 'true'
)
showCompleted.subscribe((value) => {
    localStorage.setItem('showCompleted', value.toString())
})

type StorageData = {
    completed: string[]
    almanax: string[]
}
const readCompleted = (): StorageData => {
    const v1 = localStorage.getItem('v1')
    if (v1) {
        const completedStr = decompressFromBase64(v1)
        const completedJson: StorageData = JSON.parse(completedStr)
        return completedJson
    }

    const v0 = localStorage.getItem('finishedQuests')
    if (v0) {
        const completedStr = decompressFromBase64(v0)
        const completedJson = JSON.parse(completedStr)
        return { completed: Array.from(new Set(completedJson)), almanax: [] }
    }
    return { completed: [], almanax: [] }
}
const storeCompleted = (completed: StorageData) => {
    const completedJson = JSON.stringify({ ...localCompleted, ...completed })
    const completedStr = compressToBase64(completedJson)
    localStorage.setItem('v1', completedStr)
}
export const completed = writable<StorageData>(readCompleted())
let localCompleted: StorageData
completed.subscribe((value) => {
    storeCompleted(value)
    localCompleted = value
})

export const getRawCompleted = () => {
    const completedJson = JSON.stringify(localCompleted)
    const completedStr = compressToBase64(completedJson)
    return completedStr
}
export const setRawCompleted = (completedStr: string) => {
    const completedJson = decompressFromBase64(completedStr)
    const completedVal: StorageData = JSON.parse(completedJson)
    completed.set(completedVal)
}
