<script lang="ts" module>
    import { get, language } from '../locale/localisation.svelte'

    language.subscribe(() => {
        let elements = document.querySelectorAll('[data-translate]')
        elements.forEach((element) => {
            const key = element.getAttribute('data-translate')!
            const raw = element.getAttribute('data-raw') === 'true'
            if (raw) element.innerHTML = get(key)
            else element.textContent = get(key)
        })

        elements = document.querySelectorAll('[data-placeholder]')
        elements.forEach((element) => {
            const key = element.getAttribute('data-placeholder')!
            element.setAttribute('placeholder', get(key))
        })
    })

    const target = document.querySelector('#app')!
    const observer = new MutationObserver(() => {
        const elements = document.querySelectorAll('[data-placeholder]')
        elements.forEach((element) => {
            const key = element.getAttribute('data-placeholder')!
            element.setAttribute('placeholder', get(key))
        })
    })
    observer.observe(target, { childList: true, subtree: true })
</script>

<script lang="ts">
    import type { SvelteHTMLElements } from 'svelte/elements'

    const {
        element = 'span',
        key,
        name,
        raw = false,
        classes,
    }: {
        element?: keyof SvelteHTMLElements
        key: string
        name?: string
        raw?: boolean
        classes?: string
    } = $props()
    const fullKey = $derived(name ? `${key}.${name}` : key)
    let elementRef = $state<HTMLElement | null>(null)
    $effect(() => {
        if (!elementRef) return
        if (raw) elementRef.innerHTML = get(fullKey)
        else elementRef.textContent = get(fullKey)
    })
</script>

<svelte:element
    this={element}
    data-translate={fullKey}
    data-raw={raw || undefined}
    bind:this={elementRef}
    class={classes}
/>
