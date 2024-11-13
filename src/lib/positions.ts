import type { ElementsDefinition } from 'cytoscape'
import rawPositions from './positions.json'

type Position = {
    id: string
    x: number
    y: number
}

export const positions = rawPositions as Position[]
export function applyPositions(data: ElementsDefinition) {
    positions.forEach(({ id, x, y }) => {
        const node = data.nodes.find((node) => node.data.id === id)
        if (node) {
            node.position = { x: Math.round(x), y: Math.round(y) }
        }
    })
}
