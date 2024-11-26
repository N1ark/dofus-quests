import type { Position } from 'cytoscape'
import { compressToBase64, decompressFromBase64 } from 'lz-string'
import { writable } from 'svelte/store'
import BitSet from './bitset'
import { data } from './data'
import { positions } from './positions'

export type Profile = {
    id: string
    name: string
    image: number
    color: string
    title: number
    gender: 'male' | 'female'
}

export type ProfileData = {
    version: 1
    profiles: Profile[]
    current: string
}

type DataV2 = {
    completed: string[] // quest + achievement IDs with 'q' or 'a' prefix
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

const defaultProfile: Profile = {
    id: 'default',
    name: 'My Profile',
    image: 0,
    color: '#A7FF27',
    title: 368,
    gender: 'male',
}

const defaultData: Data = {
    completed: [],
}

// Location parsers

export const getPreferredPositions = (): Record<string, Position> => {
    const stored = localStorage.getItem('preferredPositions')
    if (!stored) return positions
    const storedStr = decompressFromBase64(stored)
    const preferred = JSON.parse(storedStr)
    return { ...positions, ...preferred }
}

export const setPreferredPositions = (preferred: Record<string, Position>) => {
    const preferredStr = JSON.stringify(preferred)
    const b64 = compressToBase64(preferredStr)
    localStorage.setItem('preferredPositions', b64)
}

// Profile parsers

const readProfiles = (): ProfileData => {
    const rawData = localStorage.getItem('profiles')
    if (!rawData) {
        const profile = defaultProfile
        return { version: 1, profiles: [profile], current: profile.id }
    }
    const dataStr = decompressFromBase64(rawData)
    const dataJson: ProfileData = JSON.parse(dataStr)
    if (dataJson.profiles.length === 0) {
        const profile = defaultProfile
        dataJson.profiles = [profile]
        dataJson.current = profile.id
    }
    if (!dataJson.profiles.some((p) => p.id === dataJson.current)) {
        dataJson.current = dataJson.profiles[0].id
    }
    return dataJson
}

const storeProfiles = (profiles: ProfileData) => {
    const completedJson = JSON.stringify(profiles)
    const completedStr = compressToBase64(completedJson)
    localStorage.setItem('profiles', completedStr)
    console.debug(
        'Stored profiles:',
        profiles.profiles.map((p) => p.name)
    )
}

// State parsers

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
            return data.almanax.find((a) => a.day === d && a.month === m)?.id
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
    const profiled = localStorage.getItem(`completed-${localProfiles.current}`)
    if (profiled) {
        const completedStr = decompressFromBase64(profiled)
        const completedJson: StorageDataV2 = JSON.parse(completedStr)
        if (completedJson.v === 2) return parse_v2(completedJson)
        else console.error('Unknown version:', completedJson)
    }

    try {
        const v2 = localStorage.getItem('v2')
        if (v2) {
            const completedStr = decompressFromBase64(v2)
            const completedJson: StorageDataV2 = JSON.parse(completedStr)
            const data = parse_v2(completedJson)
            storeCompleted(data)
            localStorage.removeItem('v2')
            return data
        }

        const v1 = localStorage.getItem('v1')
        if (v1) {
            const completedStr = decompressFromBase64(v1)
            const completedJson: StorageDataV1 = JSON.parse(completedStr)
            const data = v1_to_v2(completedJson)
            storeCompleted(data)
            localStorage.removeItem('v1')
            return data
        }

        const v0 = localStorage.getItem('finishedQuests')
        if (v0) {
            const completedStr = decompressFromBase64(v0)
            const completedJson = JSON.parse(completedStr)
            const data = v1_to_v2(v0_to_v1(completedJson))
            storeCompleted(data)
            localStorage.removeItem('finishedQuests')
            return data
        }
        return defaultData
    } catch {
        return defaultData
    }
}

const storeCompleted = (completed: Data) => {
    const completedStr = stringify_v2(completed)
    localStorage.setItem(`completed-${localProfiles.current}`, completedStr)
    console.warn('Stored completed for profile', localProfiles.current)
}

export const getRawCompleted = (): string => {
    return stringify_v2(localCompleted)
}
export const setRawCompleted = (completedStr: string) => {
    const completedVal = parseUnknownVersion(completedStr)
    completed.set(completedVal)
}

// Writables

export const showCompleted = writable<boolean>(
    (localStorage.getItem('showCompleted') ?? 'true') === 'true'
)

let localProfiles: ProfileData = readProfiles()
export const profiles = writable<ProfileData>(localProfiles)

let localCompleted: Data = readCompleted()
export const completed = writable<Data>(localCompleted)

// Subscriptions

showCompleted.subscribe((value) => {
    localStorage.setItem('showCompleted', value.toString())
})

profiles.subscribe((newProfile) => {
    storeProfiles(newProfile)
    localProfiles = newProfile

    completed.set(readCompleted())

    const profileIds = newProfile.profiles.map((p) => p.id)
    for (const key of Object.keys(localStorage)) {
        if (
            key.startsWith('completed-') &&
            !profileIds.includes(key.slice('completed-'.length))
        ) {
            localStorage.removeItem(key)
        }
    }
})

completed.subscribe((value) => {
    storeCompleted(value)
    localCompleted = value
})
