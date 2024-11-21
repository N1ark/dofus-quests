<script lang="ts" module>
    import { get, language } from '../locale/localisation.svelte'

    language.subscribe((lang) => {
        const elements = document.querySelectorAll('[data-translate]')
        elements.forEach((element) => {
            const key = element.getAttribute('data-translate')!
            const raw = element.getAttribute('data-raw') === 'true'
            if (raw) element.innerHTML = get(key)
            else element.textContent = get(key)
        })
    })
</script>

<script lang="ts">
    const {
        key,
        name,
        raw = false,
    }: {
        key: string
        name?: string
        raw?: boolean
    } = $props()
    const fullKey = $derived(name ? `${key}.${name}` : key)
    let element = $state<HTMLElement | null>(null)
    $effect(() => {
        if (!element) return
        if (raw) element.innerHTML = get(fullKey)
        else element.textContent = get(fullKey)
    })
</script>

<span data-translate={fullKey} data-raw={raw} bind:this={element}></span>
