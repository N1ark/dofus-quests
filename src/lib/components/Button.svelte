<script lang="ts">
    import Text from './Text.svelte'

    const {
        Icon,
        classes,
        onclick,
        href,
        title,
    }: {
        Icon: any
        classes?: string
        href?: string
        onclick?: () => any | Promise<any>
        title?: string
    } = $props()
    let disabled = $state(false)

    const clickHandler = () => {
        if (onclick) {
            const ret = onclick()
            if (ret instanceof Promise) {
                ret.catch(console.error).finally(() => {
                    disabled = false
                })
            } else {
                disabled = false
            }
        }
    }
</script>

{#if href}
    <a class={classes} {href} {title} target="_blank" rel="noopener noreferrer">
        <Icon />
        {#if title}
            <span><Text key={title} /></span>
        {/if}
    </a>
{:else}
    <button class={classes} onclick={clickHandler} {title} {disabled}>
        {#if typeof Icon === 'string'}
            {Icon}
        {:else}
            <Icon />
        {/if}
        {#if title}
            <span><Text key={title} /></span>
        {/if}
    </button>
{/if}

<style>
    button,
    a {
        background-color: #181818;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        padding: 6px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
        color: white;
        transition: background-color 0.1s;
        cursor: pointer;
        pointer-events: auto;
        user-select: none;

        display: block;
        aspect-ratio: 1;
        line-height: 0;
        font-size: 1.2em;
        position: relative;

        &:hover {
            background-color: #333;
        }

        &:hover span {
            opacity: 1;
        }

        span {
            position: absolute;
            bottom: -3px;
            left: calc(100% + 8px);
            font-size: 0.8em;
            opacity: 0;
            transition: opacity 0.1s;
            pointer-events: none;
            user-select: none;
            line-height: 1;
            background-color: #070809;
            text-align: left;
            width: max-content;
            max-width: 100px;
            padding: 2px;
        }
    }
</style>
