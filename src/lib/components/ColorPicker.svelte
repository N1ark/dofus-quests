<script lang="ts">
    import type { FormEventHandler } from 'svelte/elements'
    import { hslToRgb } from '../util'

    const {
        color,
        onchange,
        classes,
    }: {
        color?: string
        classes?: string
        onchange?: (color: string) => void
    } = $props()

    const _color = $derived(color || '#FE368A')

    const hexRegex = /^#?[0-9a-f]{3}([0-9a-f]{3})?$/i
    const isValid = $derived(!color || hexRegex.test(color))

    const colorClick = (e: MouseEvent) => {
        const percent =
            e.offsetX / (e.currentTarget as HTMLDivElement).clientWidth
        const rgb = hslToRgb(percent, 1, 0.5)
        onchange?.(
            '#' +
                rgb[0].toString(16).padStart(2, '0') +
                rgb[1].toString(16).padStart(2, '0') +
                rgb[2].toString(16).padStart(2, '0')
        )
    }

    const onmousedown = (e: MouseEvent) => {
        const target = e.currentTarget! as HTMLDivElement

        const move = (e: PointerEvent) => {
            const percent =
                e.offsetX / (e.currentTarget as HTMLDivElement).clientWidth
            const rgb = hslToRgb(percent, 1, 0.5)
            onchange?.(
                '#' +
                    rgb[0].toString(16).padStart(2, '0') +
                    rgb[1].toString(16).padStart(2, '0') +
                    rgb[2].toString(16).padStart(2, '0')
            )
        }
        const up = (e: PointerEvent) => {
            target.removeEventListener('pointermove', move)
            target.removeEventListener('pointerup', up)
        }

        target.addEventListener('pointermove', move)
        target.addEventListener('pointerup', up)
    }

    const oninput: FormEventHandler<HTMLInputElement> = (e) => {
        const input = e.currentTarget
        const val = input.value
        if (!val.startsWith('#')) input.value = '#' + val
        if (hexRegex.test(input.value)) {
            onchange?.(input.value)
            input.classList.add('valid')
        } else {
            input.classList.remove('valid')
        }
    }
</script>

<div class={'colorpicker ' + (classes ?? '')}>
    <div class="current" style:background-color={_color}></div>
    <input
        type="text"
        placeholder="#FE368A"
        maxlength="7"
        value={color}
        {oninput}
        class:valid={isValid}
    />
    <div class="palette" onclick={colorClick} {onmousedown} role="none"></div>
</div>

<style>
    .colorpicker {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow: hidden;

        background-color: #181818;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);

        & > .current {
            flex-grow: 0;
            flex-shrink: 0;
            width: 24px;
        }

        & > input {
            border-radius: 0;
            border-top: none;
            border-bottom: none;
            box-shadow: none;
            width: 5em;
            font-family: monospace;
            &:not(.valid) {
                background-color: #581111;
            }
        }

        & > .palette {
            background: linear-gradient(in hsl longer hue 90deg, red 0 0);
            cursor: crosshair;
            flex-grow: 1;
        }
    }
</style>
