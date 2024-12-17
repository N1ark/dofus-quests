<script lang="ts" module>
    type Type = 'quest' | 'achievement'
    type Callback = (mode: Type, id: number) => void
    const listeners: Callback[] = []

    const subscribeToSelect = (callback: Callback) => {
        listeners.push(callback)
    }
    export const selectCategory = (mode: Type, id: number) => {
        listeners.forEach((callback) => callback(mode, id))
    }
</script>

<script lang="ts">
    import { onMount } from 'svelte'

    import Accordion from '../components/Accordion.svelte'
    import Progress, { progressText } from '../components/Progress.svelte'
    import Text from '../components/Text.svelte'
    import Window, {
        pushWindowToFront,
        setWindowVisibility,
    } from '../components/Window.svelte'
    import {
        data,
        type AchievementCategory,
        type QuestCategory,
    } from '../data/data'
    import { completed, showCompleted } from '../data/state.svelte'
    import { get } from '../locale/localisation.svelte'
    import { normalize } from '../util'
    import { selectNode } from './SelectedQuestView.svelte'

    const { mode }: { mode: Type } = $props()

    const categories = $derived<(QuestCategory | AchievementCategory)[]>(
        mode === 'quest'
            ? data.questCategories.sort((a, b) => a.order - b.order)
            : data.achievementCategories
                  .filter((a) => a.parentId !== -1)
                  .sort((a, b) =>
                      a.parentId === b.parentId
                          ? a.order - b.order
                          : a.parentId - b.parentId
                  )
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
    onMount(() => {
        subscribeToSelect((targetMode, id) => {
            if (targetMode === mode) {
                setWindowVisibility(mode + 's', true)
                pushWindowToFront(mode + 's')

                requestAnimationFrame(() => {
                    const elemid = `${mode}category-${id}`
                    const element = document.getElementById(elemid)
                    const container = document.getElementById(mode + 's')
                    if (element && container) {
                        container.scrollTo({
                            top: element.offsetTop - container.offsetTop,
                            behavior: 'smooth',
                        })
                    }
                })
            }
        })
    })
</script>

<Window
    id={mode + 's'}
    name={{ key: title }}
    nameSecondary={progressText(
        elements.filter(({ id }) => ownCompleted.has(id)).length,
        elements.length
    )}
    maxWidth={500}
>
    <div class="search">
        <input type="text" data-placeholder="search" bind:value={search} />
    </div>
    {#each categories as category, i}
        {@const elems = elements.filter((n) => n.categoryId === category.id)}
        {@const completed = elems.filter(({ id }) => ownCompleted.has(id))}
        {@const displayed = elems
            .filter((node) => ownShowCompleted || !ownCompleted.has(node.id))
            .filter(
                (node) =>
                    node.id === search ||
                    normalize(get(node.id, 'name')).includes(searchNormalized)
            )}
        {#if mode === 'achievement' && i > 0 && (category as AchievementCategory).parentId !== (categories[i - 1] as AchievementCategory).parentId}
            <div class="separator"></div>
        {/if}
        {#if displayed.length !== 0}
            {#snippet title()}
                <h3>
                    <Text key={mode[0] + 'C' + category.id} name="name" />
                    <Progress total={elems.length} amount={completed.length} />
                    {#if import.meta.env.DEV}
                        <span class="debug">{category.id}</span>
                    {/if}
                </h3>
            {/snippet}
            <Accordion
                {title}
                id={`${mode}category-${category.id}`}
                forceOpen={search !== '' ? true : undefined}
            >
                <ul class={mode}>
                    {#each displayed as elem}
                        <li class:completed={ownCompleted.has(elem.id)}>
                            <button
                                class="link"
                                onclick={() => selectNode(elem.id)}
                            >
                                <Text key={elem.id} name="name" />
                            </button>
                        </li>
                    {/each}
                </ul>
            </Accordion>
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
        margin-right: 0;
        margin-bottom: 1em;
    }
    h3 {
        margin: 0;
        scroll-margin-top: 1em;
        font-size: 1em;
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
    .separator {
        margin: 12px 0 18px 0;
        height: 1px;
        background-color: rgba(128, 128, 128, 0.4);
    }
</style>
