<script lang="ts" module>
    import cytoscape from 'cytoscape'
    // @ts-ignore-next-line
    import elk from 'cytoscape-elk'
    cytoscape.use(elk)

    const groupColors = Object.entries(GROUP_COLORS).map(([id, color]) => {
        const match = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)!
        const r = parseInt(match[1], 16)
        const g = parseInt(match[2], 16)
        const b = parseInt(match[3], 16)
        return {
            id,
            stroke: `rgb(${r}, ${g}, ${b})`,
            fill: `rgba(${r}, ${g}, ${b}, 0.2)`,
        }
    })
</script>

<script lang="ts">
    import {
        type SingularElementArgument as CytoElement,
        type Position,
    } from 'cytoscape'
    import AlignY from 'lucide-svelte/icons/align-center-horizontal'
    import AlignX from 'lucide-svelte/icons/align-center-vertical'
    import Export from 'lucide-svelte/icons/hard-drive-upload'
    import { onMount, untrack } from 'svelte'
    import { GROUP_COLORS, style } from '../cytostyle'
    import { type Data, id, toCyto } from '../data'
    import { get, language } from '../localisation.svelte'
    import { applyPositions } from '../positions'
    import { completed, showCompleted } from '../state.svelte'

    let {
        data,
        faded,
        outlined,
        refresh,
        showGroups,
        usePresetPositions,
    }: {
        data: Pick<Data, 'nodes' | 'edges'>
        faded?: string[]
        outlined?: string[]
        refresh?: any
        showGroups?: boolean
        usePresetPositions?: boolean
    } = $props()

    let containerDiv: HTMLElement
    let canvasDiv: HTMLCanvasElement
    let offscreenCanvas: OffscreenCanvas

    let cyInstance: cytoscape.Core | null = $state(null)
    let ownCompleted: Set<string> = $state(new Set())
    let ownShowCompleted: boolean = $state(false)

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
    })

    const center = () => {
        if (!cyInstance) return
        cyInstance.maxZoom(1.6)
        cyInstance.fit(undefined, 50)
        cyInstance.center()
        cyInstance.maxZoom(3.5)
    }

    const layout = (animated: boolean = false) => {
        if (!cyInstance) return
        let elements = cyInstance.elements()
        if (elements.length === 0) return
        if (!ownShowCompleted) {
            elements = elements.filter((element) => {
                if (element.isNode()) return !ownCompleted.has(element.id())

                const source = element.source()
                const target = element.target()
                return (
                    !ownCompleted.has(source.id()) &&
                    !ownCompleted.has(target.id())
                )
            })
        }
        elements
            .layout({
                name: 'elk',
                // @ts-ignore-next-line
                nodeDimensionsIncludeLabels: true,
                elk: { algorithm: 'layered', 'elk.direction': 'DOWN' },
                ...(animated
                    ? {
                          animate: true,
                          animationDuration: 500,
                          animationEasing: 'ease',
                      }
                    : {}),
            })
            .run()
            .on('layoutstop', animated ? () => {} : center)
    }

    const updateCompleted = () => {
        cyInstance?.nodes().forEach((node) => {
            if (ownCompleted.has(node.id())) {
                node.addClass('finished')
            } else {
                node.removeClass('finished')
            }
        })
    }

    const updateVisible = () => {
        cyInstance?.nodes('.hidden').removeClass('hidden')
        if (!ownShowCompleted) cyInstance?.nodes('.finished').addClass('hidden')
    }

    const updateFaded = () => {
        cyInstance?.elements('.faded').removeClass('faded')
        if (faded)
            cyInstance?.elements().forEach((e) => {
                if (faded.includes(e.id())) {
                    e.addClass('faded')
                }
            })
    }

    const updateOutlined = () => {
        cyInstance?.elements('.outlined').removeClass('outlined')
        if (outlined)
            cyInstance?.elements().forEach((e) => {
                if (outlined.includes(e.id())) {
                    e.addClass('outlined')
                }
            })
    }

    onMount(() => {
        const cytoData = toCyto(data)
        if (usePresetPositions) {
            applyPositions(cytoData)
        }
        cyInstance = cytoscape({
            container: containerDiv,
            elements: cytoData,
            maxZoom: 3.5,
            minZoom: 0.04,
            layout: { name: 'preset' },
            // @ts-ignore-next-line
            style,
        })

        cyInstance.on('tap', 'node', (event) => {
            window.location.hash = event.target.id()
        })
        cyInstance.on('tap', (event) => {
            if (event.target === cyInstance) {
                window.location.hash = ''
            }
        })
        cyInstance.on('resize', center)
        cyInstance.on('cxttap', 'node', (event) => {
            const toCompleted = !ownCompleted.has(event.target.id())
            const nodes: string[] = event.originalEvent.shiftKey
                ? event.target
                      .predecessors('node')
                      .map((n: any) => n.id())
                      .concat(event.target.id())
                : [event.target.id()]
            let newCompleted = new Set(ownCompleted)
            if (toCompleted) nodes.forEach((n) => newCompleted.add(n))
            else nodes.forEach((n) => newCompleted.delete(n))
            completed.update((v) => ({ completed: Array.from(newCompleted) }))
        })
        cyInstance.on('drag', (e) => {
            const { x, y } = e.target.position()
            e.target.position({ x: Math.round(x), y: Math.round(y) })
        })
    })

    language.subscribe((lang) => {
        if (!cyInstance) return
        cyInstance.nodes().forEach((node) => {
            const data = node.data()
            const label = data.label
            const newLabel = get(data.id, 'name')
            if (newLabel && label !== newLabel) {
                node.data({ ...data, name: newLabel })
            }
        })
    })

    // Update completed and visible nodes
    $effect(() => {
        const _unused1 = ownCompleted
        const _unused2 = ownShowCompleted

        updateCompleted()
        updateVisible()
    })

    // Update faded nodes
    $effect(() => {
        const _unused = faded
        updateFaded()
    })

    // Update outlined nodes
    $effect(() => {
        const _unused = outlined
        updateOutlined()
    })

    // Update graph when data changes
    $effect(() => {
        const _unused = data
        if (!cyInstance || usePresetPositions) return

        const nodes = cyInstance.nodes()
        const overlap = nodes.some((e) =>
            data.nodes.some((n) => n.id === (e as CytoElement).id())
        )
        if (!overlap) {
            cyInstance.remove(cyInstance.elements())
            cyInstance.add(toCyto(data))
        } else {
            const edges = cyInstance.edges()
            const nodesRemoveFromCyto = nodes.filter(
                (e) => !data.nodes.some((n) => n.id === e.id())
            )
            const edgesRemoveFromCyto = edges.filter(
                (e) => !data.edges.some((e2) => e.id() === id(e2))
            )
            const nodesAddToCyto = data.nodes.filter(
                (n) => !nodes.some((e) => (e as CytoElement).id() === n.id)
            )
            const edgesAddToCyto = data.edges.filter(
                (e2) => !edges.some((e) => (e as CytoElement).id() === id(e2))
            )
            cyInstance.remove(nodesRemoveFromCyto)
            cyInstance.remove(edgesRemoveFromCyto)
            cyInstance.add(
                toCyto({ nodes: nodesAddToCyto, edges: edgesAddToCyto })
            )
        }
        untrack(() => {
            updateCompleted()
            updateVisible()
            updateFaded()
            updateOutlined()
            layout(overlap)
        })
    })

    // Update graph when refresh changes (animating)
    $effect(() => {
        if (!refresh) return
        if (!cyInstance) return
        untrack(() => {
            layout(true)
        })
    })

    // Update graph when showCompleted changes and not refreshable (animating)
    $effect(() => {
        if (refresh !== undefined) return
        const _unused1 = ownShowCompleted
        const _unused2 = ownCompleted
        if (!cyInstance) return
        untrack(() => {
            updateCompleted()
            updateVisible()
            requestAnimationFrame(() => layout(true))
        })
    })

    onMount(() => {
        if (!showGroups) return
        const canvsaW = canvasDiv.offsetWidth
        const canvasH = canvasDiv.offsetHeight
        let offscreenCanvas = new OffscreenCanvas(canvsaW, canvasH)
        cyInstance?.on('render', () => {
            if (!canvasDiv) return
            const cy = cyInstance!

            let offCtx = offscreenCanvas.getContext('2d')
            const ctx = canvasDiv.getContext('2d')
            if (!ctx || !offCtx) return
            const width = (canvasDiv.width = canvasDiv.offsetWidth)
            const height = (canvasDiv.height = canvasDiv.offsetHeight)
            if (width !== canvsaW || height !== canvasH) {
                offscreenCanvas = new OffscreenCanvas(width, height)
                offCtx = offscreenCanvas.getContext('2d')!
            }

            ctx.clearRect(0, 0, width, height)

            for (const { id, fill, stroke } of groupColors) {
                const nodes = cy.nodes(`[group = ${id}]:visible`)
                if (!nodes) return

                offCtx.beginPath()
                for (const node of nodes) {
                    const pos = node.renderedPosition()
                    const size = Math.min(node.renderedWidth() * 15, 300)
                    if (
                        pos.x + size / 2 < 0 ||
                        pos.x - size / 2 > width ||
                        pos.y + size / 2 < 0 ||
                        pos.y - size / 2 > height
                    )
                        continue
                    offCtx.moveTo(pos.x + size / 2, pos.y)
                    offCtx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2)
                }
                offCtx.strokeStyle = stroke
                offCtx.fillStyle = stroke
                offCtx.lineWidth = 3
                offCtx.stroke()
                var prev = offCtx.globalCompositeOperation
                offCtx.globalCompositeOperation = 'destination-out'
                offCtx.fill()
                offCtx.globalCompositeOperation = prev
                offCtx.fillStyle = fill
                offCtx.fill()

                // copy offscreen canvas to visible canvas
                ctx.drawImage(offscreenCanvas, 0, 0)

                offCtx.clearRect(0, 0, canvsaW, canvasH)
            }
        })
    })

    const exportPos = () => {
        const nodes = cyInstance?.nodes()
        if (!nodes) return
        const positions = nodes.map((node) => {
            const pos = node.position()
            return {
                id: node.id(),
                x: pos.x,
                y: pos.y,
            }
        })
        console.log(JSON.stringify(positions))
    }

    const align = (dim: 'x' | 'y') => () => {
        if (!cyInstance) return
        const otherDim = dim === 'x' ? 'y' : 'x'
        const nodes = cyInstance.nodes(':selected')
        if (nodes.length < 2) return
        const newDim =
            nodes.reduce((acc, node) => acc + node.position()[dim], 0) /
            nodes.length
        nodes.positions((node) => {
            const pos = node.position()
            return {
                [dim]: Math.round(newDim),
                [otherDim]: pos[otherDim],
            } as any as Position
        })
        nodes.unselect()
    }
</script>

<div bind:this={containerDiv} class="container" onresize={center}>
    <canvas class="bg" bind:this={canvasDiv}></canvas>
</div>
<div class:visible={import.meta.env.DEV} class="tools">
    <button onclick={align('x')}><AlignX /></button>
    <button onclick={align('y')}><AlignY /></button>
    <button onclick={exportPos}>
        <Export />
    </button>
</div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: auto;
    }

    .bg {
        position: absolute;
        inset: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
    }

    .tools {
        position: absolute;
        bottom: 16px;
        right: 16px;
        flex-direction: column;
        gap: 8px;
        display: none;

        &.visible {
            display: flex;
            z-index: 1;
        }
    }

    button {
        aspect-ratio: 1;
        line-height: 0;
        font-size: 1.2em;
        border-color: rgba(219, 149, 20, 0.6);
        background-color: #211f1b;
        pointer-events: all;
        z-index: 10;

        &:hover {
            background-color: #4d412c;
        }
    }
</style>
