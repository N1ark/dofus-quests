import type { ElementsDefinition } from 'cytoscape'
import rawPositions from './positions.json'

type Position = {
    x: number
    y: number
}

export const positions = rawPositions as Record<string, Position>
export function applyPositions(
    data: ElementsDefinition,
    positions: Record<string, Position>
) {
    data.nodes.forEach((node) => {
        const position = positions[node.data.id!]
        if (position) node.position = position
    })
}
