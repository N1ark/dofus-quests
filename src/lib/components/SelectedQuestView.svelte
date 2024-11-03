<script lang="ts">
    import { onMount } from 'svelte'
    import type { Data } from '../data'
    import { data, onlyPredecessors } from '../data'
    import { classNames } from '../util'
    import Container from './Container.svelte'
    import GraphView from './GraphView.svelte'
    import QuestInfo from './QuestInfo.svelte'

    let { classes }: { classes?: string } = $props()

    let node: Data['nodes'][number] | null = $state(null)
    let predecessors: Pick<Data, 'nodes' | 'edges'> = $state({
        nodes: [],
        edges: [],
    })

    onMount(() => {
        const hashCheck = () => {
            const hash = window.location.hash.slice(1)
            const tempNode = !hash
                ? null
                : (data.nodes.find((node) => node.id === hash) ?? null)
            if (tempNode) {
                node = tempNode
                predecessors = onlyPredecessors(data, node.id)
            } else {
                if (node === null) return
                node = null
                predecessors = { nodes: [], edges: [] }
            }
        }

        hashCheck()

        window.addEventListener('hashchange', hashCheck)
        return () => window.removeEventListener('hashchange', hashCheck)
    })
</script>

<Container
    classes={classNames(!node && 'hidden', 'selectedQuestView', classes)}
>
    <div class="back">
        <GraphView data={predecessors} />
    </div>
    {#if node !== null}
        <QuestInfo {node} />
    {/if}
</Container>

<style>
    :global(.hidden) {
        display: none;
        pointer-events: none;
    }

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
