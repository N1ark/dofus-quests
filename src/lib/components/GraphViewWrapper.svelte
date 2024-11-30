<script lang="ts">
    import { untrack, type ComponentProps } from 'svelte'
    import { completed, showCompleted } from '../data/state.svelte'
    import GraphView, { setFilter } from './GraphView.svelte'

    const {
        nodeClasses: baseNodeClasses = {},
        ...rest
    }: ComponentProps<typeof GraphView> = $props()

    let ownCompleted = $state.raw(new Set<string>())
    let ownShowCompleted = $state(true)
    let nodeClasses = $state(baseNodeClasses)

    completed.subscribe(({ completed }) => (ownCompleted = new Set(completed)))
    showCompleted.subscribe((value) => (ownShowCompleted = value))

    $effect(() => {
        nodeClasses = {
            ...baseNodeClasses,
            finished: ownCompleted,
        }
    })
    $effect(() => {
        const _unused1 = ownShowCompleted,
            _unused2 = ownCompleted
        untrack(() => {
            setFilter(
                'show-completed',
                ownShowCompleted ? null : (n) => !ownCompleted.has(n.id)
            )
        })
    })
</script>

<GraphView {nodeClasses} {...rest} />
