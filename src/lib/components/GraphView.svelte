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
            id: +id,
            stroke: `rgb(${r}, ${g}, ${b})`,
            fill: `rgba(${r}, ${g}, ${b}, 0.2)`,
        }
    })
</script>

<script lang="ts">
    import {
        type BoundingBox12,
        type BoundingBoxWH,
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
    import { applyPositions, positions as basePositions } from '../positions'
    import {
        completed,
        getPreferredPositions,
        setPreferredPositions,
        showCompleted,
    } from '../state.svelte'
    import { fillMultilineTextBot, splitText } from '../util'
    import { selectNode } from './SelectedQuestView.svelte'

    let {
        data,
        faded,
        outlined,
        refresh,
        showGroups,
        usePresetPositions,
        debugAllowed,
    }: {
        data: Pick<Data, 'nodes' | 'edges'>
        faded?: string[]
        outlined?: string[]
        refresh?: any
        showGroups?: boolean
        usePresetPositions?: boolean
        debugAllowed?: boolean
    } = $props()

    let containerDiv: HTMLElement
    let canvasDiv: HTMLCanvasElement

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
                ...(usePresetPositions
                    ? {
                          name: 'preset',
                          positions: basePositions,
                      }
                    : {
                          name: 'elk',
                          // @ts-ignore-next-line
                          nodeDimensionsIncludeLabels: true,
                          elk: {
                              algorithm: 'layered',
                              'elk.direction': 'DOWN',
                          },
                      }),
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

        if (usePresetPositions) {
            setPreferredPositions(basePositions)
        }
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
            const pos = getPreferredPositions()
            applyPositions(cytoData, pos)
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
            selectNode(event.target.id())
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

            savePreferredPosition()
        })
    })

    const saveFn = () => {
        const newPos = toPositions()
        setPreferredPositions(newPos)
    }
    let timeout: number
    const savePreferredPosition = () => {
        clearTimeout(timeout)
        timeout = setTimeout(saveFn, 500)
    }

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
            cyInstance?.elements().unselect()
            updateCompleted()
            updateVisible()
            updateFaded()
            updateOutlined()
            layout(overlap)
        })
    })

    // Reset graph positions when refresh changes (animating)
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

    $effect(() => {
        if (!showGroups) {
            cyInstance!.forceRender()
            return
        }

        if (!cyInstance) return
        let canvasW = canvasDiv.offsetWidth * window.devicePixelRatio
        let canvasH = canvasDiv.offsetHeight * window.devicePixelRatio

        cyInstance?.on('render', () => {
            if (!canvasDiv) return
            const cy = cyInstance!

            const ctx = canvasDiv.getContext('2d')

            if (!showGroups) {
                ctx?.clearRect(0, 0, canvasW, canvasH)
                cyInstance?.off('render')
                return
            }

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
            const nodeByGroup: Record<string, BoundingBox12 & BoundingBoxWH> =
                {}
            const nodesAll = cy.nodes()
            for (const { id, fill, stroke } of groupColors) {
                const nodes = nodesAll.filter(
                    (n) => n.data('group') === id && n.visible()
                )
                if (!nodes || nodes.length === 0) continue

                // Rectangle mode
                const bb = nodes.renderedBoundingBox()
                nodeByGroup[id] = bb
                const rectW = bb.w + pad * 2
                ctx.beginPath()
                ctx.roundRect(
                    bb.x1 - pad,
                    bb.y1 - pad,
                    rectW,
                    bb.h + pad * 2,
                    4
                )
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
                const maxW = Math.max(
                    ...lines.map((l) => ctx.measureText(l).width)
                )
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
        })
        cyInstance!.forceRender()
    })

    const toPositions = (): Record<string, Position> => {
        const nodes = cyInstance?.nodes()
        if (!nodes) return {}
        const positions = nodes.reduce(
            (pos, node) => {
                pos[node.id()] = node.position()
                return pos
            },
            {} as Record<string, Position>
        )
        return positions
    }
    const exportPos = () => console.log(toPositions())

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
{#if debugAllowed}
    <div class:visible={import.meta.env.DEV} class="tools">
        <button onclick={align('x')}><AlignX /></button>
        <button onclick={align('y')}><AlignY /></button>
        <button onclick={exportPos}>
            <Export />
        </button>
    </div>
{/if}

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
