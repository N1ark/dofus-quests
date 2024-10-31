import dataRaw from './data.json'

export type Data = {
    nodes: {
        id: string
        name: string
        type: 'quest' | 'achievement'
        description: string
        requirements: string[]
    }[]
    edges: {
        to: string
        from: string
        type:
            | 'FINISHED'
            | 'NOT_FINISHED'
            | 'IN_PROGRESS'
            | 'FINISHED_N_TIMES'
            | 'AVAILABLE'
    }[]
    categories: {
        id: number
        name: string
    }[]
}

export const data = dataRaw as Data
export const nodeColors: { [k in Data['nodes'][number]['type']]: string } = {
    quest: '#2B61FE',
    achievement: '#FEDF3C',
}
export const edgeColors: { [k in Data['edges'][number]['type']]: string } = {
    AVAILABLE: '#FF0000',
    FINISHED: '#0b351050',
    NOT_FINISHED: '#c0363650',
    FINISHED_N_TIMES: '#36c09150',
    IN_PROGRESS: '#e1dd3150',
}
