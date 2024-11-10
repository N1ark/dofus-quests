import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { writable } from 'svelte/store'
import BitSet from '../lib/bitset'
import { data } from '../lib/data'

export const showCompleted = writable(
    (localStorage.getItem('showCompleted') ?? 'true') === 'true'
)
showCompleted.subscribe((value) => {
    localStorage.setItem('showCompleted', value.toString())
})

type DataV2 = {
    completed: string[] // quest + achievement IDs with 'q' or 'a' prefix
}
const defaultData: DataV2 = {
    completed: [],
}
export type Data = DataV2

type StorageDataV2 = {
    // encoded as b64(json)
    v: 2
    q: string // b64(bitset of q ids)
    a: string // b64(bitset of a ids)
}

type StorageDataV1 = {
    // encoded as b64(json)
    completed: string[]
    almanax: string[] // MM/DD/YYYY
}
type StorageDataV0 = string[] // encoded as b64(json)

const v0_to_v1 = (v0: StorageDataV0): StorageDataV1 => ({
    completed: Array.from(new Set(v0)),
    almanax: [],
})

const v1_to_v2 = (v1: StorageDataV1): DataV2 => {
    const base = v1.completed
    const almanax = v1.almanax
        .map((day) => {
            const d = +day.split('/')[1]
            const m = +day.split('/')[0]
            return data.almanax.find((a) => a.day === d && a.month === m)
                ?.questId
        })
        .filter((q): q is string => q !== undefined)
    return {
        completed: base.concat(almanax),
    }
}

const parse_v2 = (v2: StorageDataV2): DataV2 => {
    const q = BitSet.fromStr(v2.q)
        .toList()
        .map((n) => 'q' + n)
    const a = BitSet.fromStr(v2.a)
        .toList()
        .map((n) => 'a' + n)
    return { completed: q.concat(a) }
}
const stringify_v2 = (v2: DataV2): string => {
    const obj: StorageDataV2 = {
        v: 2,
        q: BitSet.fromIterable(
            v2.completed.filter((n) => n[0] === 'q').map((q) => +q.slice(1))
        ).toStr(),
        a: BitSet.fromIterable(
            v2.completed.filter((n) => n[0] === 'a').map((a) => +a.slice(1))
        ).toStr(),
    }
    const str = JSON.stringify(obj)
    const b64 = compressToBase64(str)
    return b64
}

const parseUnknownVersion = (v: string): Data => {
    type UnknownFormat = StorageDataV0 | StorageDataV1 | StorageDataV2
    const str = decompressFromBase64(v)
    const obj: UnknownFormat = JSON.parse(str)
    console.log('Unknown format:', obj)
    if ('v' in obj) return parse_v2(obj)
    else if ('completed' in obj) return v1_to_v2(obj)
    else return v1_to_v2(v0_to_v1(obj))
}

const readCompleted = (): Data => {
    const v2 = localStorage.getItem('v2')
    if (v2) {
        const completedStr = decompressFromBase64(v2)
        const completedJson: StorageDataV2 = JSON.parse(completedStr)
        return parse_v2(completedJson)
    }

    const v1 = localStorage.getItem('v1')
    if (v1) {
        const completedStr = decompressFromBase64(v1)
        const completedJson: StorageDataV1 = JSON.parse(completedStr)
        return v1_to_v2(completedJson)
    }

    const v0 = localStorage.getItem('finishedQuests')
    if (v0) {
        const completedStr = decompressFromBase64(v0)
        const completedJson = JSON.parse(completedStr)
        return v1_to_v2(v0_to_v1(completedJson))
    }
    return defaultData
}
const storeCompleted = (completed: Data) => {
    const completedStr = stringify_v2(completed)
    localStorage.setItem('v2', completedStr)
}
export const completed = writable<Data>(readCompleted())
let localCompleted: Data
completed.subscribe((value) => {
    storeCompleted(value)
    localCompleted = value
})

export const getRawCompleted = (): string => {
    return stringify_v2(localCompleted)
}
export const setRawCompleted = (completedStr: string) => {
    const completedVal = parseUnknownVersion(completedStr)
    completed.set(completedVal)
}
