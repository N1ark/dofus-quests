<script lang="ts">
    import type { BoundingBox12, BoundingBoxWH } from 'cytoscape'
    import { onMount } from 'svelte'
    import { GROUP_COLORS } from '../data/cytostyle'
    import { get } from '../locale/localisation.svelte'
    import { fillMultilineTextBot, splitText } from '../util'

    const groupColors = Object.entries(GROUP_COLORS).map(([id, color]) => {
        const match = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)!
        const r = parseInt(match[1], 16)
        const g = parseInt(match[2], 16)
        const b = parseInt(match[3], 16)
        return {
            id: +id,
            stroke: `rgb(${r}, ${g}, ${b})`,
            fill: `rgba(${r}, ${g}, ${b}, 0.2)`,
        }
    })

    const { cy }: { cy: cytoscape.Core } = $props()

    let canvasDiv = $state<HTMLCanvasElement>()

    const resize = () => {
        const width = cy.width()
        const height = cy.height()
        if (!canvasDiv) return
        canvasDiv.style.width = `${width}px`
        canvasDiv.style.height = `${height}px`
    }

    const render = () => {
        if (!canvasDiv) return

        const ctx = canvasDiv.getContext('2d')
        if (!ctx) return

        const width = (canvasDiv.width =
            canvasDiv.offsetWidth * window.devicePixelRatio)
        const height = (canvasDiv.height =
            canvasDiv.offsetHeight * window.devicePixelRatio)
        if (width === 0 || height === 0) return

        ctx.clearRect(0, 0, width, height)
        ctx.transform(
            window.devicePixelRatio,
            0,
            0,
            window.devicePixelRatio,
            0,
            0
        )
        const pad = cy.zoom() * 50
        const nodeByGroup: Record<string, BoundingBox12 & BoundingBoxWH> = {}
        const nodesAll = cy.nodes()
        for (const { id, fill, stroke } of groupColors) {
            const nodes = nodesAll.filter(
                (n) => n.data('group') === id && !n.hasClass('hidden')
            )
            if (!nodes || nodes.length === 0) continue

            // Rectangle mode
            const bb = nodes.renderedBoundingBox()
            nodeByGroup[id] = bb
            const rectW = bb.w + pad * 2
            ctx.beginPath()
            ctx.roundRect(bb.x1 - pad, bb.y1 - pad, rectW, bb.h + pad * 2, 4)
            ctx.fillStyle = fill
            ctx.fill()
            ctx.strokeStyle = stroke
            ctx.lineWidth = 1
            ctx.stroke()
        }

        ctx.font = '12px Inter'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'bottom'

        for (const { id } of groupColors) {
            const bb = nodeByGroup[id]
            if (!bb) continue

            const rectW = bb.w + pad * 2

            const name = get('aC' + id, 'name')
            const lines = splitText(name, Math.max(100, bb.w), ctx)
            const maxW = Math.max(...lines.map((l) => ctx.measureText(l).width))
            const textX = bb.x1 - pad + Math.min(0, (rectW - maxW) / 2)
            const textY = bb.y1 - pad - 1

            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
            ctx.fillRect(
                textX - 5,
                textY - 15 * lines.length,
                maxW + 10,
                15 * lines.length
            )

            ctx.fillStyle = 'white'
            fillMultilineTextBot(lines, textX, textY, 15, ctx)
        }
    }

    onMount(() => {
        cy.on('render', render)
        cy.on('resize', resize)

        resize()
        cy.forceRender()

        return () => {
            cy.off('render', render)
            cy.off('resize', resize)
        }
    })
</script>

<canvas bind:this={canvasDiv}></canvas>

<style>
    canvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }
</style>
