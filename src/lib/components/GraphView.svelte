<script lang="ts" module>
    import cytoscape from 'cytoscape'
    // @ts-ignore-next-line
    import elk from 'cytoscape-elk'
    cytoscape.use(elk)
</script>

<script lang="ts">
    import { onMount, untrack } from 'svelte'
    import { completed, showCompleted } from '../../state.svelte'
    import { style } from '../cytostyle'
    import { type Data, toCyto } from '../data'

    let {
        data,
        refresh,
    }: { data: Pick<Data, 'nodes' | 'edges'>; refresh?: any } = $props()

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

    $effect(() => {
        const _unused1 = ownCompleted
        const _unused2 = ownShowCompleted

        updateCompleted()
        updateVisible()
    })

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
            if (toCompleted) nodes.forEach(newCompleted.add)
            else nodes.forEach(newCompleted.delete)
            completed.update((v) => ({ completed: Array.from(newCompleted) }))
        })
    })

    $effect(() => {
        const _unused = data
        if (!cyInstance) return
        cyInstance.remove(cyInstance.elements())
        cyInstance.add(toCyto(data))
        untrack(() => {
            updateCompleted()
            updateVisible()
            layout()
        })
    })

    $effect(() => {
        if (!refresh) return
        if (!cyInstance) return
        untrack(() => {
            layout(true)
        })
    })

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
