<script lang="ts">
    import type { ComponentProps, Snippet } from 'svelte'

    import Window from './Window.svelte'

    const {
        top,
        bottom,
        ...rest
    }: {
        top: Snippet
        bottom: Snippet
    } & Omit<ComponentProps<typeof Window>, 'children'> = $props()
</script>

<Window {...rest}
    ><div class="content">
        <div class="top">
            {@render top()}
            <div class="pad"></div>
        </div>
        <div class="bottom">
            {@render bottom()}
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

    .top {
        box-sizing: border-box;
        height: 100%;
        overflow-y: auto;
        flex-shrink: 10;
        padding: 0 12px 28px 12px;
        scrollbar-gutter: stable;
    }

    .bottom {
        position: sticky;
        bottom: 0;
        z-index: 1;
        border-top: 1px solid rgba(128, 128, 128, 0.3);
        padding: 8px 12px 0 12px;
        flex-shrink: 0;
        height: fit-content;
        transition: height 0.2s;
    }
</style>
