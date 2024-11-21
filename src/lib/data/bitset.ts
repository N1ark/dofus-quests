import { base64ToInt, intToBase64 } from '../util'

export default class BitSet {
    private data: Partial<Record<number, number>> = {}

    constructor() {
        this.data = {}
    }

    set(index: number, val: boolean | 1 | 0 = true): void {
        const bucket = Math.floor(index / 32)
        const bit = index % 32
        const data = this.data[bucket] || 0
        if (val) {
            this.data[bucket] = data | (1 << bit)
        } else {
            const newBucket = data & ~(1 << bit)
            if (newBucket === 0) delete this.data[bucket]
            else this.data[bucket] = newBucket
        }
    }

    get(index: number): boolean {
        const bucket = Math.floor(index / 32)
        const bit = index % 32
        return !!((this.data[bucket] || 0) & (1 << bit))
    }

    *entries(): Generator<number> {
        for (const [bucket, bits] of Object.entries(this.data)) {
            if (!bits) continue
            const offset = 32 * +bucket
            for (let i = 0; i < 32; i++) {
                if (bits & (1 << i)) yield offset + i
            }
        }
    }

    toList(): number[] {
        return Array.from(this.entries())
    }

    toStr(): string {
        // sequence separated by '/' of '<off since last> <bucket>' or '<bucket>' if offset is 1, in base36
        let last = -1
        const seq = []
        for (const [idx, bucket] of Object.entries(this.data)) {
            if (!bucket) continue
            const off = +idx - last
            if (off === 1) {
                seq.push(intToBase64(bucket))
            } else {
                seq.push(intToBase64(off) + ' ' + intToBase64(bucket))
            }
            last = +idx
        }
        const txt = seq.join('/')
        return txt
    }

    static fromStr(str: string): BitSet {
        const bitSet = new BitSet()
        const seq = str.split('/')
        let idx = -1
        for (let i = 0; i < seq.length; i++) {
            const s = seq[i]
            if (s.includes(' ')) {
                const [off, bucket] = s.split(' ').map(base64ToInt)
                idx += off
                bitSet.data[idx] = bucket
            } else {
                const bucket = base64ToInt(s)
                bitSet.data[++idx] = bucket
            }
        }
        return bitSet
    }

    static fromIterable(iterable: Iterable<number>): BitSet {
        const bitSet = new BitSet()
        for (const index of iterable) bitSet.set(index)
        return bitSet
    }
}
