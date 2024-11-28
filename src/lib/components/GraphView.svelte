<script lang="ts" module>
    import cytoscape from 'cytoscape'
    // @ts-ignore-next-line
    import elk from 'cytoscape-elk'
    cytoscape.use(elk)
</script>

<script lang="ts">
    import AlignY from 'lucide-svelte/icons/align-center-horizontal'
    import AlignX from 'lucide-svelte/icons/align-center-vertical'
    import Export from 'lucide-svelte/icons/hard-drive-upload'
    import PencilRuler from 'lucide-svelte/icons/pencil-ruler'

    import {
        type SingularElementArgument as CytoElement,
        type Position,
    } from 'cytoscape'
    import { onMount, untrack } from 'svelte'
    import { get as getOfStore } from 'svelte/store'

    import { style } from '../data/cytostyle'
    import { type Data, id, toCyto } from '../data/data'
    import {
        applyPositions,
        positions as basePositions,
    } from '../data/positions'
    import { completed, positions, showCompleted } from '../data/state.svelte'
    import { get, language } from '../locale/localisation.svelte'
    import { selectNode } from '../views/SelectedQuestView.svelte'
    import Button from './Button.svelte'
    import GraphGroupsView from './GraphGroupsView.svelte'

    let {
        data,
        nodeClasses,
        refresh,
        showGroups,
        usePresetPositions,
        debugAllowed,
    }: {
        data: Pick<Data, 'nodes' | 'edges'>
        nodeClasses?: Partial<Record<string, string[]>>
        refresh?: any
        showGroups?: boolean
        usePresetPositions?: boolean
        debugAllowed?: boolean
    } = $props()

    let containerDiv: HTMLElement

    let cyInstance: cytoscape.Core | null = $state(null)
    let ownCompleted: Set<string> = $state(new Set())
    let ownShowCompleted: boolean = $state(false)

    let ignoreNextPositionUpdate: boolean = true

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
    })

    const center = () => {
        if (!cyInstance) return
        console.log('Centering')
        cyInstance.maxZoom(1.6)
        cyInstance.fit(undefined, 50)
        cyInstance.center()
        cyInstance.maxZoom(3.5)
    }

    const layout = ({ animated = false }: { animated?: boolean }) => {
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
        let nodePositions: Record<string, cytoscape.Position> = {}
        if (usePresetPositions) {
            nodePositions = getOfStore(positions)
            nodePositions = Object.fromEntries(
                Object.entries(nodePositions).filter(([id, pos]) => {
                    const elem = elements.getElementById(id)
                    if (!elem) return false
                    if (!elem.visible()) return true
                    const currPos = elem.position()
                    return elem && (pos.x !== currPos.x || pos.y !== currPos.y)
                })
            )
            console.log(
                `Moving ${Object.keys(nodePositions).length} preset nodes`
            )
        }
        const layout = elements
            .layout({
                ...(usePresetPositions
                    ? {
                          name: 'preset',
                          positions: nodePositions,
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

        if (!animated) {
            layout.one('layoutstop', () => cyInstance!.one('resize', center))
        }

        console.log('Did layout - animated?', animated)
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

    let oldClasses: string[] = []

    const applyClasses = () => {
        oldClasses.forEach((c) => {
            if (!nodeClasses || !(c in nodeClasses)) applyClass(c, [])
        })
        oldClasses = nodeClasses ? Object.keys(nodeClasses) : []
        if (!nodeClasses) return

        const applyClass = (clazz: string, ids?: string[]) => {
            cyInstance?.elements().forEach((e) => {
                if (ids && ids.includes(e.id())) e.addClass(clazz)
                else e.removeClass(clazz)
            })
        }
        Object.entries(nodeClasses).forEach(([clazz, ids]) => {
            applyClass(clazz, ids)
        })
    }

    onMount(() => {
        const cytoData = toCyto(data)
        if (usePresetPositions) {
            const pos = getOfStore(positions)
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

        requestAnimationFrame(center)

        cyInstance.on('tap', 'node', (event) => {
            selectNode(event.target.id())
        })
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
        ignoreNextPositionUpdate = true
        positions.set(newPos)
    }
    let timeout: number
    const savePreferredPosition = () => {
        clearTimeout(timeout)
        timeout = setTimeout(saveFn, 500)
    }

    language.subscribe(() => {
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

    positions.subscribe(() => {
        if (!usePresetPositions) return
        if (ignoreNextPositionUpdate) {
            ignoreNextPositionUpdate = false
            return
        }
        layout({ animated: true })
    })

    // Update completed and visible nodes
    $effect(() => {
        const _unused1 = ownCompleted
        const _unused2 = ownShowCompleted

        updateCompleted()
        updateVisible()
    })

    // Update node classes
    $effect(() => {
        const _unuded = nodeClasses
        applyClasses()
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
            applyClasses()
            layout({ animated: overlap })
        })
    })

    // Reset graph positions when refresh changes (animating)
    $effect(() => {
        if (!refresh) return
        if (!cyInstance) return
        untrack(() => {
            ignoreNextPositionUpdate = true
            positions.set({ ...basePositions })
            layout({ animated: true })
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
            requestAnimationFrame(() => layout({ animated: true }))
        })
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
    const exportPos = () => console.log(JSON.stringify(toPositions()))

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

    const autolayout = () => {
        if (!cyInstance) return
        const nodes = cyInstance.elements(':selected')
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

<div bind:this={containerDiv} class="container" onresize={center}>
    {#if showGroups && cyInstance}
        <GraphGroupsView cy={cyInstance} />
    {/if}
</div>
{#if debugAllowed}
    <div class:visible={import.meta.env.DEV} class="tools">
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
{/if}

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: auto;
    }

    .tools {
        position: absolute;
        bottom: 16px;
        right: 16px;
        flex-direction: column;
        gap: 8px;
        display: none;
        z-index: 10;

        &.visible {
            display: flex;
            z-index: 1;
        }

        & :global(.debug) {
            border-color: rgba(219, 149, 20, 0.6) !important;
            background-color: #211f1b !important;
            &:hover {
                background-color: #4d412c !important;
            }
        }
    }
</style>
