<script lang="ts">
    import { onMount } from 'svelte'
    import { completed } from '../../state.svelte'
    import { data } from '../data'
    import Container from './Container.svelte'
    import Progress from './Progress.svelte'

    let currentHeight = $state(0)
    let largestHeight = $state(0)
    $effect(() => {
        if (currentHeight > largestHeight) {
            largestHeight = currentHeight
        }
    })

    let visible = $state(false)
    let today = $state(new Date())
    let almanax = $derived(
        data.almanax.find(
            ({ month, day }) =>
                month === today.getMonth() + 1 && day === today.getDate()
        )!
    )
    let searchText = $state('')
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
        const hashCheck = () =>
            (visible = window.location.hash.slice(1) === 'almanax')
        hashCheck()
        window.addEventListener('hashchange', hashCheck)
        return () => window.removeEventListener('hashchange', hashCheck)
    })
</script>

<Container classes={`almanax-modal ${visible ? '' : 'hidden'}`}>
    <div class="title">
        <h2>
            Almanax <Progress
                total={366}
                amount={data.almanax.filter(({ questId }) =>
                    ownAlmanax.has(questId)
                ).length}
            />
        </h2>
        <input type="text" placeholder="Search" bind:value={searchText} />
    </div>

    <div
        class="header"
        bind:clientHeight={currentHeight}
        style="min-height: {largestHeight}px"
    >
        <div class="col">
            <div class="date">{today.toLocaleDateString()}</div>
            <h3>
                {almanax.questName}
            </h3>
            <div class="item">
                <img src={almanax.itemImg} alt={almanax.itemName} />
                <div>
                    {almanax.itemQuantity} × {almanax.itemName}
                </div>
            </div>
        </div>
        <div class="col">
            <h3>{almanax.effectName}</h3>
            <p>{@html almanax.effectDesc}</p>
        </div>
    </div>
    <div class="months">
        {#each [...new Array(12)] as _, i}
            {@const date = new Date(2024, i, 1)}
            {@const nDays =
                new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() -
                date.getDate() +
                1}
            <div class="month">
                <h3>{date.toLocaleString('default', { month: 'long' })}</h3>
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
                                day === j + 1 && month === date.getMonth() + 1
                        )!}
                        <button
                            class="day"
                            class:completed={ownAlmanax.has(alma.questId)}
                            class:notSearched={searchText.trim() &&
                                !alma.questName
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase()) &&
                                !alma.itemName
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase()) &&
                                !alma.effectName
                                    .toLowerCase()
                                    .includes(searchText.toLowerCase())}
                            class:current={today.getDate() === j + 1 &&
                                today.getMonth() === date.getMonth()}
                            onmouseenter={() =>
                                (today = new Date(
                                    date.getFullYear(),
                                    date.getMonth(),
                                    j + 1
                                ))}
                            onclick={() => toggleDay(alma.questId)}
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
</Container>

<style>
    :global(.almanax-modal) {
        width: 100%;
        height: 100%;
        pointer-events: all;
        overflow-y: auto !important;
        &:global(.hidden) {
            display: none;
        }
    }

    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header {
        display: flex;
        flex-direction: row;
        gap: 8px;
        position: sticky;
        top: 0;
        z-index: 1;
        background: linear-gradient(
            to bottom,
            rgba(24, 24, 24, 0) 0%,
            rgba(24, 24, 24, 1) 7%,
            rgba(24, 24, 24, 1) 7%,
            rgba(24, 24, 24, 1) 93%,
            rgba(24, 24, 24, 0) 100%
        );
    }

    .months {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        margin-bottom: 32px;
        gap: 8px;

        & .month {
            max-width: 250px;
            & h3 {
                margin-bottom: 4px;
            }
        }
    }

    .days {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;

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
            border: 3px solid var(--color);
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

    .col {
        width: 50%;
    }
    .date {
        margin-bottom: 0;
        font-size: 0.7em;
        font-weight: bold;
    }
    .date + h3 {
        margin-top: 0;
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
