<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<script lang="ts">
    import { clamp } from '../util'

    const {
        min,
        max,
        minRange = 0,
        stepSize = 1,
        range,
        onchange,
        classes,
    }: {
        min: number
        max: number
        minRange?: number
        stepSize?: number
        range: [number, number]
        onchange?: (range: [number, number]) => void
        classes?: string
    } = $props()

    let barDiv: HTMLDivElement | null = null

    const dragNode = (side: 0 | 1) => {
        const move = (e: PointerEvent) => {
            if (!barDiv) return
            e.preventDefault()
            const rect = barDiv.getBoundingClientRect()
            const newX = clamp((e.clientX - rect.left) / rect.width, 0, 1)
            const val =
                Math.round(min + ((max - min) * newX) / stepSize) * stepSize
            const adapted =
                side === 0
                    ? Math.min(val, range[1] - minRange)
                    : Math.max(val, range[0] + minRange)
            const newRange: [number, number] = [...range]
            newRange[side] = adapted
            onchange?.(newRange)
        }
        const up = () => {
            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
        }

        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
    }

    const dragBar = (e: PointerEvent) => {
        if (!barDiv) return
        e.preventDefault()
        const left = range[0]
        const width = range[1] - range[0]
        const x = e.clientX
        let moved = false

        const move = (e: PointerEvent) => {
            moved = moved || e.movementX + e.movementY > 1
            if (!barDiv) return
            const offset = e.clientX - x
            const offsetVal =
                Math.round(
                    ((offset / barDiv.clientWidth) * (max - min)) / stepSize
                ) * stepSize
            const newLeft = clamp(left + offsetVal, min, max - width)
            const newRange: [number, number] = [newLeft, newLeft + width]
            onchange?.(newRange)
        }
        const up = () => {
            if (!moved) clickBack(e)

            window.removeEventListener('pointermove', move)
            window.removeEventListener('pointerup', up)
        }
        window.addEventListener('pointermove', move)
        window.addEventListener('pointerup', up)
    }

    const clickBack = (e: MouseEvent | PointerEvent) => {
        if (!barDiv) return
        e.preventDefault()
        const rect = barDiv.getBoundingClientRect()
        const val = clamp((e.clientX - rect.left) / rect.width, 0, 1)
        const adapted =
            Math.round(min + ((max - min) * val) / stepSize) * stepSize
        const closest =
            adapted <= range[0]
                ? 0
                : adapted >= range[1]
                  ? 1
                  : Math.abs(adapted - range[0]) < Math.abs(adapted - range[1])
                    ? 0
                    : 1
        dragNode(closest)
    }
</script>

<div
    class={'range-select ' + (classes ?? '')}
    bind:this={barDiv}
    style:--off1={`${((range[0] - min) / (max - min)) * 100}%`}
    style:--off2={`${((range[1] - min) / (max - min)) * 100}%`}
>
    <div class="back" onpointerdown={clickBack}></div>
    <div class="selection" onpointerdown={dragBar}></div>
    <div class="node left" onpointerdown={() => dragNode(0)}></div>
    <div class="node right" onpointerdown={() => dragNode(1)}></div>
</div>

<style>
    .range-select {
        --color: #a9d94b;
        --node-size: 15px;
        --bar-height: 6px;

        position: relative;
        height: 30px;
        min-width: 30px;
        max-width: 200px;

        & .node {
            position: absolute;
            top: calc(50% - var(--node-size) / 2);
            width: var(--node-size);
            height: var(--node-size);
            margin: -4px;
            padding: 4px;
            z-index: 1;
            cursor: pointer;

            &.left {
                left: calc(var(--off1) - var(--node-size) / 2);
            }
            &.right {
                left: calc(var(--off2) - var(--node-size) / 2);
            }

            &::before {
                content: '';
                display: block;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: var(--color);
                box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                transition: background 0.1s;
            }
            &:hover::before {
                background: color-mix(in hsl, var(--color), black 25%);
            }
        }

        & .back,
        & .selection {
            position: absolute;
            top: calc(50% - var(--bar-height) / 2);
            height: var(--bar-height);
            margin: -6px 0;
            padding: 6px 0;

            &::before {
                box-sizing: border-box;
                content: '';
                display: block;
                width: 100%;
                height: 100%;
                transition: background 0.1s;
            }
        }

        & .back {
            left: 0;
            right: 0;
            cursor: pointer;

            &::before {
                border: 1px solid rgba(128, 128, 128, 0.4);
                border-radius: calc(var(--bar-height) / 2);
                background: #282828;
            }
        }

        & .selection {
            left: var(--off1);
            width: calc(var(--off2) - var(--off1));
            cursor: ew-resize;
            &::before {
                background: var(--color);
            }
            &:hover::before {
                background: color-mix(in hsl, var(--color), black 25%);
            }
        }
    }
</style>
