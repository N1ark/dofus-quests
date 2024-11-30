<script lang="ts">
    import AlignY from 'lucide-svelte/icons/align-center-horizontal'
    import AlignX from 'lucide-svelte/icons/align-center-vertical'
    import Export from 'lucide-svelte/icons/hard-drive-upload'
    import PencilRuler from 'lucide-svelte/icons/pencil-ruler'

    import type cytoscape from 'cytoscape'
    import type { Position } from 'cytoscape'
    import Button from './Button.svelte'

    const { cy }: { cy: cytoscape.Core } = $props()

    const toPositions = (): Record<string, Position> => {
        const nodes = cy.nodes()
        const positions: Record<string, Position> = {}
        nodes.forEach((node) => {
            positions[node.id()] = node.position()
        })
        return positions
    }

    const exportPos = () => console.log(JSON.stringify(toPositions()))

    const align = (dim: 'x' | 'y') => (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        e.stopImmediatePropagation()
        const otherDim = dim === 'x' ? 'y' : 'x'
        const nodes = cy.nodes(':selected')
        if (nodes.length < 2) return
        const newDim = Math.round(
            nodes.reduce((acc, node) => acc + node.position()[dim], 0) /
                nodes.length
        )
        nodes.positions((node) => {
            const pos = node.position()
            const neww = {
                [dim]: newDim,
                [otherDim]: pos[otherDim],
            } as any as Position
            return neww
        })
        nodes.unselect()
    }

    const autolayout = () => {
        const nodes = cy.elements(':selected')
        if (nodes.length < 2) return
        nodes.unselect()
        nodes
            .layout({
                name: 'elk',
                // @ts-ignore-next-line
                nodeDimensionsIncludeLabels: true,
                elk: {
                    algorithm: 'layered',
                    'elk.direction': 'DOWN',
                },
                animate: true,
                animationDuration: 500,
                animationEasing: 'ease',
            })
            .run()
            .on('layoutstop', () => {
                nodes.select()
            })
    }
</script>

<div class="tools">
    <Button
        Icon={AlignX}
        title="Align X"
        onclick={align('x')}
        classes="debug"
        leftSided
    />
    <Button
        Icon={AlignY}
        title="Align Y"
        onclick={align('y')}
        classes="debug"
        leftSided
    />
    <Button
        Icon={PencilRuler}
        title="Auto-layout"
        onclick={autolayout}
        classes="debug"
        leftSided
    />
    <Button
        Icon={Export}
        title="Export positions"
        onclick={exportPos}
        classes="debug"
        leftSided
    />
</div>

<style>
    .tools {
        position: absolute;
        bottom: 16px;
        right: 16px;
        flex-direction: column;
        gap: 8px;
        display: flex;
        z-index: 5;
        pointer-events: all;

        & :global(.debug) {
            border-color: rgba(219, 149, 20, 0.6) !important;
            background-color: #211f1b !important;
            &:hover {
                background-color: #4d412c !important;
            }
        }
    }
</style>
