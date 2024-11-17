<script lang="ts">
    import { data } from '../data'
    import { get } from '../localisation.svelte'
    import { completed, showCompleted } from '../state.svelte'
    import { normalize } from '../util'
    import Progress, { progressText } from './Progress.svelte'
    import Text from './Text.svelte'
    import Window from './Window.svelte'

    const { mode }: { mode: 'quest' | 'achievement' } = $props()

    const categories = $derived(
        (mode === 'quest'
            ? data.questCategories
            : data.achievementCategories
        ).sort((a, b) => a.order - b.order)
    )
    const elements = $derived(
        mode === 'quest'
            ? data.nodes
                  .filter((node) => node.type === mode)
                  .sort((a, b) => +a.id.slice(1) - +b.id.slice(1))
            : data.nodes
                  .filter((node) => node.type === mode)
                  .sort((a, b) => a.order - b.order)
    )
    const title = $derived(mode === 'quest' ? 'quests' : 'achievements')

    let ownCompleted = $state(new Set<string>())
    let ownShowCompleted = $state(false)
    let search = $state('')
    const searchNormalized = $derived(normalize(search))

    completed.subscribe(({ completed }) => {
        ownCompleted = new Set(completed)
    })
    showCompleted.subscribe((value) => {
        ownShowCompleted = value
    })
</script>

<Window
    id={mode + 's'}
    name={title}
    nameSecondary={progressText(
        elements.filter(({ id }) => ownCompleted.has(id)).length,
        elements.length
    )}
>
    <div class="search">
        <input type="text" placeholder="Search" bind:value={search} />
    </div>
    {#each categories as category}
        {@const elems = elements.filter((n) => n.categoryId === category.id)}
        {@const completed = elems.filter(({ id }) => ownCompleted.has(id))}
        {@const displayed = elems
            .filter((node) => ownShowCompleted || !ownCompleted.has(node.id))
            .filter((node) =>
                normalize(get(node.id, 'name')).includes(searchNormalized)
            )}
        {#if displayed.length !== 0}
            <h3 id={`${mode}category-${category.id}`}>
                <Text key={mode[0] + 'C' + category.id} name="name" />
                <Progress total={elems.length} amount={completed.length} />
            </h3>
            <ul class={mode}>
                {#each displayed as elem}
                    <li class:completed={ownCompleted.has(elem.id)}>
                        <a href={`#${elem.id}`}>
                            <Text key={elem.id} name="name" />
                        </a>
                    </li>
                {/each}
            </ul>
        {/if}
    {/each}
</Window>

<style>
    .search {
        display: flex;
        flex-direction: row-reverse;
        position: sticky;
        top: 0;
        z-index: 1;
        margin-right: -4px;
    }
    h3 {
        margin-bottom: 4px;
        scroll-margin-top: 1em;
    }
    ul {
        margin-top: 0;
        padding-inline-start: 1em;

        &.achievement li {
            &::marker {
                color: #e0961f;
            }
            &.completed::marker {
                color: #a0d13d;
            }
        }
        &.quest li {
            &::marker {
                color: #256fd1;
            }
            &.completed::marker {
                color: #3dd17d;
            }
        }
    }
</style>
