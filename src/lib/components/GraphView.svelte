<script lang="ts" module>
    import {
        data as baseData,
        type Achievement,
        type Quest,
    } from '../data/data'

    const fullDataMap: Record<string, Quest | Achievement> = Object.fromEntries(
        baseData.nodes.map((node) => [node.id, node])
    )

    import cytoscape from 'cytoscape'
    // @ts-ignore-next-line
    import elk from 'cytoscape-elk'
    cytoscape.use(elk)

    type Filter = [string, (node: Quest | Achievement) => boolean]
    const nodeFilters: Filter[] = []
    const filterChangeListeners: ((filters: Filter[]) => void)[] = []

    export const setFilter = (
        id: string,
        predicate?:
            | null
            | string[]
            | Set<string>
            | ((node: Quest | Achievement) => boolean)
    ) => {
        // console.log('Updating filter', id, predicate)
        const matchIndex = nodeFilters.findIndex(
            ([filterId]) => filterId === id
        )
        if (!predicate && matchIndex !== -1) {
            nodeFilters.splice(matchIndex, 1)
        } else if (predicate) {
            if (Array.isArray(predicate)) {
                const ids = new Set(predicate)
                predicate = (node) => ids.has(node.id)
            } else if (predicate instanceof Set) {
                const ids = predicate
                predicate = (node) => ids.has(node.id)
            }

            if (matchIndex !== -1) {
                nodeFilters[matchIndex] = [id, predicate]
            } else {
                nodeFilters.push([id, predicate])
            }
        } else {
            // no predicate, not in list anyways -> no change
            return
        }
        filterChangeListeners.forEach((listener) => listener(nodeFilters))
    }

    const subscribeToFilterChanges = (
        listener: (filters: Filter[]) => void
    ) => {
        filterChangeListeners.push(listener)
        return () => {
            const index = filterChangeListeners.indexOf(listener)
            if (index !== -1) {
                filterChangeListeners.splice(index, 1)
            }
        }
    }
</script>

<script lang="ts">
    import {
        type SingularElementArgument as CytoElement,
        type Position,
    } from 'cytoscape'
    import { onMount, untrack } from 'svelte'
    import { get as getOfStore } from 'svelte/store'

    import { style } from '../data/cytostyle'
    import { id, toCyto, type Data } from '../data/data'
    import {
        applyPositions,
        positions as basePositions,
    } from '../data/positions'
    import { completed, positions } from '../data/state.svelte'
    import { get, language } from '../locale/localisation.svelte'
    import { selectNode } from '../views/SelectedQuestView.svelte'
    import GraphGroupsView from './GraphGroupsView.svelte'
    import GraphViewDebug from './GraphViewDebug.svelte'

    let {
        data,
        nodeClasses = {},
        refresh,
        refreshPositionsFromStorage,
        showGroups,
        usePresetPositions,
        debugAllowed,
    }: {
        data: Pick<Data, 'nodes' | 'edges'>
        nodeClasses?: Partial<Record<string, string[] | Set<string>>>
        refresh?: any
        refreshPositionsFromStorage?: any
        showGroups?: boolean
        usePresetPositions?: boolean
        debugAllowed?: boolean
    } = $props()

    $effect(() => console.log('-------------- reloaded --------------'))
    const log = import.meta.env.DEV ? console.warn : () => {}

    let containerDiv: HTMLElement

    let cyInstance: cytoscape.Core | null = $state.raw(null)

    let ownCompleted: Set<string> = $state.raw(new Set())
    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })

    const center = () => {
        if (!cyInstance) return
        log('Centering')
        cyInstance.maxZoom(1.6)
        cyInstance.fit(undefined, 50)
        cyInstance.center()
        cyInstance.maxZoom(3.5)
    }

    const layout = ({ animated = false }: { animated?: boolean }) => {
        if (!cyInstance) return

        let elements = cyInstance.filter((e) =>
            usePresetPositions ? e.isNode() : true
        )
        if (elements.length === 0) return

        const layout = elements
            .layout({
                ...(usePresetPositions
                    ? {
                          name: 'preset',
                          positions: getOfStore(positions),
                      }
                    : {
                          name: 'elk',
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

        log(`Did layout on ${elements.size()} - animated?`, animated)
    }

    const applyVisibility = () => {
        if (!cyInstance) return
        const now = performance.now()

        const visibilityCache: Partial<Record<string, boolean>> = {}
        const isVisible = (id: string) =>
            (visibilityCache[id] ??= nodeFilters.every(([, filter]) =>
                filter(fullDataMap[id])
            ))

        cyInstance.batch(() => {
            const elements = cyInstance!.nodes()
            elements.forEach((element: cytoscape.SingularElementArgument) => {
                if (isVisible(element.id())) element.removeClass('hidden')
                else element.addClass('hidden')
            })
        })

        log('Applied visibility', performance.now() - now)
    }

    let oldClasses: typeof nodeClasses = {}
    const applyClasses = () => {
        if (!cyInstance) return

        const now = performance.now()

        const nodes = cyInstance.nodes()
        const applyClassArr = (clazz: string, ids: string[]) => {
            nodes.forEach((e): any =>
                ids.includes(e.id()) ? e.addClass(clazz) : e.removeClass(clazz)
            )
        }
        const applyClassSet = (clazz: string, ids: Set<string>) => {
            nodes.forEach((e): any =>
                ids.has(e.id()) ? e.addClass(clazz) : e.removeClass(clazz)
            )
        }

        cyInstance.batch(() => {
            // Clear old classes if not present anymore
            Object.entries(oldClasses).forEach(([c, keys]) => {
                if (!(c in nodeClasses)) nodes.removeClass(c)
            })
            oldClasses = nodeClasses

            // Apply new classes
            Object.entries(nodeClasses).forEach(([clazz, ids]) =>
                ids
                    ? Array.isArray(ids)
                        ? applyClassArr(clazz, ids)
                        : applyClassSet(clazz, ids)
                    : nodes.removeClass(clazz)
            )
        })
        log('Applied classes', performance.now() - now)
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

        applyVisibility()

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

        if (usePresetPositions) {
            cyInstance.on('drag', (e) => {
                const { x, y } = e.target.position()
                e.target.position({ x: Math.round(x), y: Math.round(y) })

                savePreferredPosition()
            })
        }
    })

    const saveFn = () => {
        const newPos = toPositions()
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

    // Update visible nodes
    onMount(() =>
        subscribeToFilterChanges(() => {
            applyVisibility()
            if (!usePresetPositions)
                requestAnimationFrame(() => layout({ animated: true }))
        })
    )

    // Update node classes
    $effect(() => {
        const _unuded = nodeClasses
        untrack(applyClasses)
    })

    // Update graph when data changes
    $effect(() => {
        const _unused = data
        untrack(() => {
            if (!cyInstance || usePresetPositions) return

            const nodeSet = new Set(data.nodes.map((n) => n.id))
            const edgeSet = new Set(data.edges.map(id))
            const nodes = cyInstance.nodes()
            const overlap = nodes.some((e) =>
                nodeSet.has((e as CytoElement).id())
            )
            if (!overlap) {
                cyInstance.elements().remove()
                cyInstance.add(toCyto(data))
            } else {
                const edges = cyInstance.edges()
                const nodesRemoveFromCyto = nodes.filter(
                    (e) => !nodeSet.has(e.id())
                )
                const edgesRemoveFromCyto = edges.filter(
                    (e) => !edgeSet.has(e.id())
                )
                const nodesAddToCyto = data.nodes.filter(
                    (n) => nodes.getElementById(n.id).length === 0
                )
                const edgesAddToCyto = data.edges.filter(
                    (e) => edges.getElementById(id(e)).length === 0
                )
                nodesRemoveFromCyto.remove()
                edgesRemoveFromCyto.remove()
                cyInstance.add(
                    toCyto({ nodes: nodesAddToCyto, edges: edgesAddToCyto })
                )
            }
            cyInstance?.elements().unselect()
            applyClasses()
            applyVisibility()
            layout({ animated: overlap })
        })
    })

    // Reset graph positions when refresh changes (animating)
    $effect(() => {
        if (!refresh) return
        if (!cyInstance) return
        untrack(() => {
            positions.set({ ...basePositions })
            layout({ animated: true })
        })
    })

    // Update graph with new stored positions
    $effect(() => {
        if (refreshPositionsFromStorage)
            untrack(() => {
                layout({ animated: true })
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
</script>

<div bind:this={containerDiv} class="container" onresize={center}>
    {#if showGroups && cyInstance}
        <GraphGroupsView cy={cyInstance} />
    {/if}
</div>
{#if debugAllowed && import.meta.env.DEV && cyInstance}
    <GraphViewDebug cy={cyInstance} />
{/if}

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: auto;
    }
</style>
