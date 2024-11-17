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
    console.log(Icon, typeof Icon)
</script>

{#snippet content()}
    {#if typeof Icon === 'string'}
        {Icon}
    {:else if 'src' in Icon}
        <img src={Icon.src} alt={title} />
    {:else}
        <Icon />
    {/if}
    {#if title}
        <span><Text key={title} /></span>
    {/if}
{/snippet}

{#if href}
    <a class={classes} {href} {title} target="_blank" rel="noopener noreferrer">
        {@render content()}
    </a>
{:else}
    <button class={classes} onclick={clickHandler} {title} {disabled}>
        {@render content()}
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

    img {
        width: 1em;
        height: 1em;
        object-fit: contain;
    }
</style>
