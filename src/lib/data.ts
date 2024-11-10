import dataRaw from './data.json'
import { get } from './localisation.svelte'

export type Quest = {
    id: string
    type: 'quest'
    requirements: string
    categoryId: number
}

export type Achievement = {
    id: string
    type: 'achievement'
    requirements: string
    categoryId: number
    order: number
}

export type Almanax = {
    day: number
    month: number
    id: string
    itemId: number
    itemImg: string
    itemQuantity: number
}

export type Edge = {
    to: string
    from: string
    type:
        | 'FINISHED'
        | 'NOT_FINISHED'
        | 'IN_PROGRESS'
        | 'FINISHED_N_TIMES'
        | 'AVAILABLE'
}

export type Category = {
    id: number
    order: number
}

export type Data = {
    nodes: (Quest | Achievement)[]
    edges: Edge[]
    achievementCategories: Category[]
    questCategories: Category[]
    almanax: Almanax[]
}

export const data = dataRaw as Data

export type CytoData = {
    nodes: { data: { id: string; type: string } }[]
    edges: { data: { source: string; target: string; type: string } }[]
}

export const toCyto = (data: Pick<Data, 'nodes' | 'edges'>): CytoData => ({
    nodes: data.nodes.map(({ id, type }) => ({
        data: { id, type, name: get(id, 'name') },
    })),
    edges: data.edges.map(({ from, to, type }) => ({
        id: `${from}-${to}`,
        data: { source: from, target: to, type: type },
    })),
})

export const onlyPredecessors = (data: Data, id: string): Data => {
    const predecessorNodes = new Set([id])
    let changed = true
    while (changed) {
        changed = false
        data.edges.forEach((edge) => {
            if (
                predecessorNodes.has(edge.to) &&
                !predecessorNodes.has(edge.from)
            ) {
                predecessorNodes.add(edge.from)
                changed = true
            }
        })
    }
    return {
        ...data,
        nodes: data.nodes.filter((node) => predecessorNodes.has(node.id)),
        edges: data.edges.filter(
            (edge) =>
                predecessorNodes.has(edge.from) && predecessorNodes.has(edge.to)
        ),
    }
}

export const id = (node: Quest | Achievement | Edge): string =>
    'id' in node ? node.id : `${node.from}-${node.to}-${node.type}`
export const isAlmanaxQuest = (id: string): boolean =>
    data.almanax.some((a) => a.questId === id)
export const isAchievementQuest = (id: string): boolean =>
    data.nodes.some((n) => n.id === id)
