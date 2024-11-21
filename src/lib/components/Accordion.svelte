<script lang="ts">
    import ChevronDown from 'lucide-svelte/icons/chevron-down'
    import ChevronUp from 'lucide-svelte/icons/chevron-up'

    import { type Snippet } from 'svelte'
    import type { HTMLButtonAttributes } from 'svelte/elements'

    const {
        forceOpen,
        title,
        children,
        ...props
    }: Omit<Partial<HTMLButtonAttributes>, 'title' | 'children'> & {
        title: Snippet
        children: Snippet
        forceOpen?: boolean
    } = $props()
    let _open = $state(false)
    let open = $derived(_open || forceOpen)
    // $effect(() => {
    //     const temp = open
    //     if (temp !== undefined) untrack(() => (_open = temp))
    // })

    const onPress = (e: MouseEvent) => {
        _open = !_open
    }
</script>

<button onclick={onPress} {...props}>
    {@render title()}
    {#if open}
        <ChevronUp class="icon" />
    {:else}
        <ChevronDown class="icon" />
    {/if}
</button>
{#if open}
    <div class="content">
        {@render children()}
    </div>
{/if}

<style>
    button {
        width: 100%;
        text-align: inherit;
        font: inherit;
        position: relative;
        padding-right: 24px;
        &:not(:last-child) {
            margin-bottom: 6px;
        }
    }

    :global(.icon) {
        position: absolute;
        top: 0;
        bottom: 0;
        right: 8px;
        margin: auto;
        font-size: 1.3em;
    }
</style>
