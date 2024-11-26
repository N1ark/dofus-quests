<script lang="ts">
    import twemoji from '@twemoji/api'
    import { type Icon as IconType } from 'lucide-svelte'
    import { type Component } from 'svelte'
    import Text from './Text.svelte'

    const {
        Icon,
        classes,
        onclick,
        ondblclick,
        href,
        title,
        leftSided,
        disabled,
        selected,
    }: {
        Icon: typeof IconType | Component | string | { src: string }
        classes?: string
        href?: string
        onclick?: () => any | Promise<any>
        ondblclick?: () => any | Promise<any>
        title?: string
        leftSided?: boolean
        disabled?: boolean
        selected?: boolean
    } = $props()

    let lastclick = 0
    const clickHandler = () => {
        const now = Date.now()
        if (now - lastclick < 400) ondblclick?.()
        else onclick?.()
        lastclick = now
    }
</script>

{#snippet content()}
    {#if typeof Icon === 'string'}
        {@html twemoji.parse(Icon)}
    {:else if 'src' in Icon}
        <img src={Icon.src} alt="" draggable="false" />
    {:else}
        <Icon />
    {/if}
    {#if title}
        <span><Text key={title} /></span>
    {/if}
{/snippet}

{#if href}
    <a
        class={(classes ?? '') + ' button'}
        class:selected
        class:left={leftSided}
        {href}
        {title}
        target="_blank"
        rel="noopener noreferrer"
    >
        {@render content()}
    </a>
{:else}
    <button
        class={(classes ?? '') + ' button'}
        class:selected
        class:left={leftSided}
        onclick={ondblclick ? clickHandler : onclick}
        {disabled}
    >
        {@render content()}
    </button>
{/if}

<style>
    button,
    a {
        width: 33px;
        height: 33px;
        box-sizing: border-box;
        pointer-events: auto;
        user-select: none;

        display: block;
        aspect-ratio: 1;
        line-height: 0;
        font-size: 1.2em;
        position: relative;

        &:hover span,
        &:focus span {
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
            max-width: 130px;
            padding: 2px;
        }
        &.left span {
            left: auto;
            right: calc(100% + 8px);
            text-align: right;
        }
    }

    .button {
        :global(img) {
            width: 1em;
            height: 1em;
            object-fit: contain;
        }
    }
</style>
