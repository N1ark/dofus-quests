<script lang="ts">
    type Position = { x: number; y: number }
    type NodeProps = Omit<Data['nodes'][number], 'type'> & {
        type: any
        label: string
        color: string
        _type: Data['nodes'][number]['type']
    } & Position
    type EdgeProps = Omit<Data['edges'][number], 'type'> & {
        type: any
        color: string
        _type: Data['edges'][number]['type']
    }

    import Graph from 'graphology'
    import Sigma from 'sigma'
    import ELK from 'elkjs'
    import type { ElkNode } from 'elkjs'
    import { onMount } from 'svelte'
    import { nodeColors, edgeColors } from '../data'
    import type { Data } from '../data'

    export let data: Data

    const graph = new Graph<NodeProps, EdgeProps>()
    data.nodes.forEach((node) =>
        graph.addNode(node.id, {
            ...node,
            label: node.name,
            _type: node.type,
            type: undefined,
            color: nodeColors[node.type],
            x: 0,
            y: 0,
        })
    )
    data.edges.forEach((edge) =>
        graph.addEdge(edge.from, edge.to, {
            ...edge,
            _type: edge.type,
            type: 'arrow',
            color: edgeColors[edge.type],
        })
    )

    const doLayout = (
        nodes: { id: string; name: string }[],
        edges: { from: string; to: string }[]
    ) => {
        const elk = new ELK()

        const elkGraph: ElkNode = {
            id: 'root',
            children: [
                {
                    id: 'graph',
                    layoutOptions: {
                        'elk.algorithm': 'layered',
                        'elk.direction': 'UP',
                    },
                    children: nodes.map(({ id, name }) => ({
                        id,
                        width: 15,
                        height: 1,
                        labels: [{ text: name }],
                        properties: {
                            'elk.nodeLabels.placement':
                                'OUTSIDE V_CENTER H_RIGHT',
                        },
                    })),
                    edges: edges.map((edge) => ({
                        id: `${edge.from}-${edge.to}`,
                        sources: [edge.from],
                        targets: [edge.to],
                    })),
                },
            ],
        }

        elk.layout(elkGraph)
            .then((elkGraph) => {
                elkGraph.children![0].children!.forEach((node) => {
                    const n = graph.getNodeAttributes(node.id)
                    graph.mergeNodeAttributes(n.id, {
                        x: node.x,
                        y: node.y,
                    })
                })
            })
            .catch(console.error)
    }

    let innerWidth = 0
    let innerHeight = 0
    let container: HTMLElement

    onMount(async () => {
        const renderer = new Sigma(graph, container, {
            minCameraRatio: 0.01,
            maxCameraRatio: 1.5,
            labelSize: 12,
            labelColor: {
                color: '#ffffff',
            },
        })
        doLayout(
            data.nodes.map(({ id, name }) => ({ id, name })),
            data.edges.map(({ from, to }) => ({ from, to }))
        )
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
