<script lang="ts">
    import Graph from 'graphology'
    import Sigma from 'sigma'
    import { onMount } from 'svelte'
    import type { Data } from '../data'

    export let data: Data

    let innerWidth = 0
    let innerHeight = 0

    let container: HTMLElement

    onMount(async () => {
        type NodeProps = Omit<Data['nodes'][number], 'type'> & {
            x: number
            y: number
            type: any
            _type: Data['nodes'][number]['type']
        }
        type EdgeProps = Omit<Data['edges'][number], 'type'> & {
            type: any
            _type: Data['edges'][number]['type']
        }

        const graph = new Graph<NodeProps, EdgeProps>()
        data.nodes.forEach((node) =>
            graph.addNode(node.id, {
                ...node,
                _type: node.type,
                x: Math.random() * innerWidth,
                y: Math.random() * innerHeight,
                type: undefined,
            })
        )
        data.edges.forEach((edge) =>
            graph.addEdge(edge.from, edge.to, {
                ...edge,
                _type: edge.type,
                type: 'arrow',
            })
        )
        const renderer = new Sigma(graph, container, {
            minCameraRatio: 0.1,
            maxCameraRatio: 10,
        })
    })
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div bind:this={container} class="container" />

<style>
    .container {
        width: 100%;
        height: 100%;
    }
</style>
