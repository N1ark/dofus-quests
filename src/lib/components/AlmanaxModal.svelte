<script lang="ts">
    import { onMount } from 'svelte'
    import { data } from '../data'
    import { get } from '../localisation.svelte'
    import { completed } from '../state.svelte'
    import { normalize } from '../util'
    import { progressText } from './Progress.svelte'
    import Text from './Text.svelte'
    import Window from './Window.svelte'

    let visible = $state(false)
    let today = $state(new Date())
    let almanax = $derived(
        data.almanax.find(
            ({ month, day }) =>
                month === today.getMonth() + 1 && day === today.getDate()
        )!
    )
    let searchText = $state('')
    const searchNormalized = $derived(normalize(searchText))
    let ownAlmanax: Set<string> = $state(new Set())

    completed.subscribe(({ completed }) => {
        ownAlmanax = new Set(completed)
    })

    const toggleDay = (key: string) => {
        if (ownAlmanax.has(key)) ownAlmanax.delete(key)
        else ownAlmanax.add(key)

        completed.update((state) => ({
            ...state,
            completed: Array.from(ownAlmanax),
        }))
    }

    onMount(() => {
        const monthToday = new Date().getMonth()
        const month = document.getElementById(`month-${monthToday}`)
        if (month) month.scrollIntoView()
    })
</script>

<Window
    id="almanax"
    name={{ key: 'almanax' }}
    nameSecondary={progressText(
        data.almanax.filter(({ id }) => ownAlmanax.has(id)).length,
        366
    )}
>
    <div class="content">
        <div class="months">
            <div class="search">
                <input
                    type="text"
                    placeholder="Search"
                    bind:value={searchText}
                />
            </div>
            {#each [...new Array(12)] as _, i}
                {@const date = new Date(2024, i, 1)}
                {@const nDays =
                    new Date(
                        date.getFullYear(),
                        date.getMonth() + 1,
                        0
                    ).getDate() -
                    date.getDate() +
                    1}
                <div class="month">
                    <h3 id={`month-${i}`}>
                        {date.toLocaleString('default', { month: 'long' })}
                    </h3>
                    <div class="days">
                        {#each [...new Array(nDays)] as _, j}
                            {@const day = new Date(
                                date.getFullYear(),
                                date.getMonth(),
                                j + 1
                            )
                                .toLocaleDateString('en-US')
                                .slice(0, -5)}
                            {@const alma = data.almanax.find(
                                ({ day, month }) =>
                                    day === j + 1 &&
                                    month === date.getMonth() + 1
                            )!}
                            <button
                                class="day"
                                class:completed={ownAlmanax.has(alma.id)}
                                class:notSearched={searchText.trim() &&
                                    !normalize((alma.id, 'name')).includes(
                                        searchNormalized
                                    ) &&
                                    !normalize(get(alma.id, 'item')).includes(
                                        searchNormalized
                                    ) &&
                                    !normalize(
                                        get(alma.id, 'effectName')
                                    ).includes(searchNormalized)}
                                class:current={today.getDate() === j + 1 &&
                                    today.getMonth() === date.getMonth()}
                                onmouseenter={() =>
                                    (today = new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        j + 1
                                    ))}
                                onclick={() => toggleDay(alma.id)}
                            >
                                <span>
                                    {j + 1}
                                </span>
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
        <div class="info">
            <div>
                <div class="date">{today.toLocaleDateString()}</div>
                <h3>
                    <Text key={almanax.id} name="name" />
                </h3>
                <div class="item">
                    <img src={almanax.itemImg} alt={''} />
                    <div>
                        {almanax.itemQuantity} × <Text
                            key={almanax.id}
                            name="item"
                        />
                    </div>
                </div>
            </div>
            <div>
                <h3><Text key={almanax.id} name="effectName" /></h3>
                <p><Text key={almanax.id} name="effectDesc" raw /></p>
            </div>
        </div>
    </div>
</Window>

<style>
    .content {
        height: 100%;
        min-height: 100px;
        display: flex;
        flex-direction: column;
        margin: -4px -12px 0 -12px;
    }

    .search {
        display: flex;
        flex-direction: row-reverse;
        position: sticky;
        top: 4px;
        z-index: 1;
        margin-right: 0px;
        width: 100%;
    }

    .months {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 8px;
        height: 100%;
        overflow-y: auto;
        flex-shrink: 10;
        padding: 0 8px 28px 8px;
        justify-content: space-evenly;
        align-content: flex-start;
        scrollbar-gutter: stable;

        & .month {
            max-width: 230px;
            & h3 {
                margin-bottom: 4px;
            }
        }
    }

    .days {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;

        & .day {
            --color: #256fd1;
            position: relative;
            box-sizing: border-box;
            padding: 4px;
            border-radius: 99px;
            width: 26px;
            height: 26px;
            font-size: 0.8em;
            line-height: 0;
            text-align: center;
            vertical-align: middle;
            font-weight: bold;
            background-color: var(--color);
            border: 2px solid var(--color);
            color: white;
            opacity: 1;
            transition: opacity 0.1s;
            &.notSearched {
                opacity: 0.3;
            }
            &:hover {
                opacity: 0.8;
            }
            &.completed {
                --color: #3dd17d;
            }
            &.current {
                color: var(--color);
                background-color: white;
            }
            & > span {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }

    .info {
        display: flex;
        flex-direction: row;
        gap: 8px;
        position: sticky;
        bottom: 0;
        z-index: 1;
        min-height: 100px;
        border-top: 1px solid rgba(128, 128, 128, 0.3);
        padding: 8px 12px 0 12px;
        flex-shrink: 0;
        height: fit-content;
        transition: height 0.2s;

        & > div {
            overflow: hidden;
            &:first-child {
                width: 35%;
                padding-right: 8px;
            }
            &:last-child {
                width: 65%;
            }
        }

        & h3 {
            margin-top: 0;
            margin-bottom: 4px;
        }

        & p {
            margin-top: 0;
            margin-bottom: 0;
        }
    }
    .date {
        margin-bottom: 0;
        font-size: 0.7em;
        font-weight: bold;
    }
    .item {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 0.5em;
        & img {
            width: 48px;
            height: 48px;
        }
    }
</style>
