<script lang="ts">
    import Column from '../components/Column.svelte'
    import { setFilter } from '../components/GraphView.svelte'
    import RangeSelect from '../components/RangeSelect.svelte'
    import Window from '../components/Window.svelte'

    let range = $state.raw<[number, number]>([0, 200])

    $effect(() => {
        if (range[0] === 0 && range[1] === 200) {
            setFilter('level-filter', null)
        } else {
            setFilter('level-filter', (n) =>
                n.type === 'quest'
                    ? n.levels[0] <= range[1] && n.levels[1] >= range[0]
                    : range[0] <= n.level && n.level <= range[1]
            )
        }
    })
</script>

<Window
    id="level-filter"
    name={{ key: 'level-filter' }}
    minHeight={90}
    minWidth={150}
    maxHeight={150}
    maxWidth={300}
>
    <Column classes="col">
        <div>
            {range[0] === range[1] ? range[0] : `${range[0]} - ${range[1]}`}
        </div>
        <RangeSelect
            min={0}
            max={200}
            stepSize={10}
            {range}
            onchange={(e) => (range = e)}
            classes="range"
        />
    </Column>
</Window>

<style>
    :global(.col) {
        align-items: center;
        justify-content: center;
    }
    :global(.range) {
        width: 100%;
    }
    div {
        width: 100%;
        font-weight: 500;
        text-align: center;
        margin-top: 0.3em;
    }
</style>
