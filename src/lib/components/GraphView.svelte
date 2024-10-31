<script lang="ts">
    import cytoscape from 'cytoscape'
    // @ts-ignore
    import cytoscapeElk from 'cytoscape-elk'
    import { onMount, setContext } from 'svelte'
    import { style } from '../cytostyle'
    import type { Data } from '../data'

    export let data: Data

    let innerWidth = 0
    let innerHeight = 0
    let container: HTMLElement

    setContext('graphSharedState', {
        getCyInstance: () => cyInstance,
    })
    let cyInstance: cytoscape.Core | null = null

    onMount(async () => {
        cytoscape.use(cytoscapeElk)
        cyInstance = cytoscape({
            container: container,
            // @ts-ignore
            style,
            elements: {
                nodes: data.nodes.map(
                    ({ id, name, type, description, requirements }) => ({
                        data: { id, name, type, description, requirements },
                    })
                ),
                edges: data.edges.map(({ from, to, type }) => ({
                    data: { source: from, target: to, type: type },
                })),
            },
        })

        cyInstance
            .layout({
                name: 'elk',
                // @ts-ignore
                nodeDimensionsIncludeLabels: true,
                elk: {
                    algorithm: 'layered',
                    'elk.direction': 'DOWN',
                },
            })
            .run()
    })
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div bind:this={container} class="container"></div>

<style>
    .container {
        width: 100%;
        height: 100%;
    }
</style>
