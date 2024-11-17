<script lang="ts">
    import { onMount } from 'svelte'
    import type { Data } from '../data'
    import { data, id, onlyPredecessors } from '../data'
    import GraphView from './GraphView.svelte'
    import QuestInfo from './QuestInfo.svelte'
    import Window from './Window.svelte'

    let { classes }: { classes?: string } = $props()

    let node: Data['nodes'][number] | null = $state(null)
    let currData: Pick<Data, 'nodes' | 'edges'> = $state({
        nodes: [],
        edges: [],
    })
    let childElements: string[] = $state([])
    let targetNode = $state<string>()

    onMount(() => {
        const hashCheck = () => {
            const hash = window.location.hash.slice(1)
            const tempNode = !hash
                ? null
                : (data.nodes.find((node) => node.id === hash) ?? null)
            if (tempNode) {
                node = tempNode
                currData = onlyPredecessors(data, node.id)
                const rawExtraEdges = data.edges.filter(
                    ({ from }) => from === tempNode.id
                )
                const extraNodes = data.nodes
                    .filter(({ id }) =>
                        rawExtraEdges.some(({ to }) => to === id)
                    )
                    .filter(
                        ({ id }) => !currData.nodes.some((n) => n.id === id)
                    ) // remove predecessors
                const extraEdges = rawExtraEdges.filter(({ to }) =>
                    extraNodes.some(({ id }) => id === to)
                )
                currData = {
                    nodes: [...currData.nodes, ...extraNodes],
                    edges: [...currData.edges, ...extraEdges],
                }
                childElements = [...extraNodes, ...extraEdges].map(id)
                targetNode = tempNode.id
            } else {
                if (node === null) return
                node = null
                currData = { nodes: [], edges: [] }
            }
        }

        hashCheck()

        window.addEventListener('hashchange', hashCheck)
        return () => window.removeEventListener('hashchange', hashCheck)
    })
</script>

<Window id="selected-quest">
    <div class="back">
        <GraphView
            data={currData}
            faded={childElements}
            outlined={targetNode ? [targetNode] : undefined}
        />
    </div>
    {#if node !== null}
        <QuestInfo {node} />
    {/if}
</Window>

<style>
    .back {
        position: absolute;
        inset: 0;
        z-index: -1;
    }

    :global(.selectedQuestView) {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
    }
</style>
