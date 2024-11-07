<script lang="ts" module>
    import cytoscape from 'cytoscape'
    // @ts-ignore-next-line
    import elk from 'cytoscape-elk'
    cytoscape.use(elk)
</script>

<script lang="ts">
    import { type SingularElementArgument as CytoElement } from 'cytoscape'
    import { onMount, untrack } from 'svelte'
    import { completed, showCompleted } from '../../state.svelte'
    import { style } from '../cytostyle'
    import { type Data, id, toCyto } from '../data'

    let {
        data,
        faded,
        outlined,
        refresh,
    }: {
        data: Pick<Data, 'nodes' | 'edges'>
        faded?: string[]
        outlined?: string[]
        refresh?: any
    } = $props()

    let containerDiv: HTMLElement

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
        cyInstance = cytoscape({
            container: containerDiv,
            // @ts-ignore-next-line
            style,
            elements: toCyto(data),
            maxZoom: 3.5,
            minZoom: 0.04,
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
        if (!cyInstance) return

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
</script>

<div bind:this={containerDiv} class="container" onresize={center}></div>

<style>
    .container {
        width: 100%;
        height: 100%;
        pointer-events: auto;
    }
</style>
