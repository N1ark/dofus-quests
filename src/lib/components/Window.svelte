<!-- svelte-ignore state_referenced_locally -->
<script lang="ts" module>
    const MIN_WIDTH = 350
    const MIN_HEIGHT = 250

    // Ordering, for z-index
    const windowOrder: string[] =
        localStorage.getItem('windowOrder')?.split(',') ?? []

    const listeners: [string, (order: number) => void][] = []
    const save = () => {
        localStorage.setItem('windowOrder', windowOrder.join(','))
    }
    const subscribeWindowOrder = (
        id: string,
        callback: (order: number) => void
    ) => {
        listeners.push([id, callback])
    }
    export const pushWindowToFront = (id: string) => {
        const index = windowOrder.indexOf(id)
        if (index === -1) windowOrder.push(id)
        else {
            windowOrder.splice(index, 1)
            windowOrder.push(id)
        }
        listeners.forEach(([id, callback]) => {
            callback(windowOrder.indexOf(id))
        })
        save()
    }
    const popWindow = (id: string) => {
        const index = windowOrder.indexOf(id)
        if (index !== -1) windowOrder.splice(index, 1)
        listeners.forEach(([id, callback]) => {
            callback(windowOrder.indexOf(id))
        })
        save()
    }

    // Storing window positions and visibility
    type WindowInfo = {
        x: number
        y: number
        width: number
        height: number
        visible: boolean
    }

    const getWindowInfo = (id: string): WindowInfo => {
        const stored = localStorage.getItem('window.' + id)
        try {
            if (!stored)
                throw new Error('No stored window info for window ' + id)
            const [x, y, width, height, visible] = stored
                .split(',')
                .map(Number)
                .map(Math.round)
            if (
                isNaN(x) ||
                isNaN(y) ||
                isNaN(width) ||
                isNaN(height) ||
                isNaN(visible) ||
                width < MIN_WIDTH ||
                height < MIN_HEIGHT ||
                width > 2000 ||
                height > 2000
            )
                throw new Error('Invalid window info')
            return { x, y, width, height, visible: !!visible }
        } catch (e) {
            return {
                x: 64,
                y: 64,
                width: window.innerWidth - 128,
                height: window.innerHeight - 128,
                visible: false,
            }
        }
    }

    const setWindowInfo = (id: string, info: WindowInfo) => {
        const str = `${info.x},${info.y},${info.width},${info.height},${info.visible ? 1 : 0}`
        localStorage.setItem('window.' + id, str)
    }

    const resetSubscribers: [string, () => void][] = []

    export const resetWindowPosition = (id: string) => {
        console.log('Resetting window position', id)
        resetSubscribers
            .filter(([windowId]) => windowId === id)
            .forEach(([, callback]) => callback())
    }

    const subscribeToWindowReset = (id: string, callback: () => void) => {
        resetSubscribers.push([id, callback])
    }

    const windowListeners: [string, (visible: boolean) => void][] = []

    export const subscribeToWindowVisibility = (
        id: string,
        callback: (visible: boolean) => void
    ) => {
        windowListeners.push([id, callback])
    }

    export const setWindowVisibility = (id: string, visible: boolean) => {
        const info = getWindowInfo(id)
        if (info.visible === visible) return
        info.visible = visible
        setWindowInfo(id, info)
        windowListeners
            .filter(([windowId]) => windowId === id)
            .forEach(([, callback]) => callback(visible))
    }

    export const swapWindowVisibility = (id: string) => {
        const info = getWindowInfo(id)
        setWindowVisibility(id, !info.visible)
    }
</script>

<script lang="ts">
    import Close from 'lucide-svelte/icons/x'
    import type { Snippet } from 'svelte'
    import { clamp } from '../util'
    import Text from './Text.svelte'

    type Translatable =
        | string
        | {
              key: string
              name?: string
          }

    const {
        id,
        name,
        nameSecondary,
        children,
        classes,
        maxWidth = 2000,
        maxHeight = 2000,
    }: {
        id: string
        name?: Translatable
        nameSecondary?: Translatable
        children: Snippet
        classes?: string
        maxWidth?: number
        maxHeight?: number
    } = $props()

    let dimensions = $state(
        (() => {
            const info = getWindowInfo(id)
            info.width = clamp(info.width, MIN_WIDTH, maxWidth)
            info.height = clamp(info.height, MIN_HEIGHT, maxHeight)
            return info
        })()
    )
    let fullyHidden = $state(!dimensions.visible)
    let animating = $state(false)
    let zIndex = $state(windowOrder.indexOf(id))

    $effect(() => {
        subscribeToWindowVisibility(id, (visible) => {
            if (visible === dimensions.visible) return
            if (visible) {
                fullyHidden = false
                requestAnimationFrame(() => (dimensions.visible = true)) // allows for transition
            } else {
                dimensions.visible = visible
            }
        })
        subscribeWindowOrder(id, (order) => {
            zIndex = order
        })
        subscribeToWindowReset(id, () => {
            dimensions = {
                x: 64,
                y: 64,
                width: clamp(window.innerWidth - 128, MIN_WIDTH, maxWidth),
                height: clamp(window.innerHeight - 128, MIN_HEIGHT, maxHeight),
                visible: true,
            }
        })
    })

    let saveTimeout: number
    let hiddenTimeout: number
    let firstTick = true
    $effect(() => {
        const _unused = { ...dimensions }
        if (firstTick) {
            firstTick = false
            return
        }
        if (!dimensions.visible) {
            popWindow(id)
            hiddenTimeout = setTimeout(() => (fullyHidden = true), 200)
        } else {
            pushWindowToFront(id)
            clearTimeout(hiddenTimeout)
            fullyHidden = false
        }

        saveTimeout = setTimeout(() => setWindowInfo(id, dimensions), 100)
        return () => clearTimeout(saveTimeout)
    })

    let lastClickTopBar = 0
    const onMove = (e: PointerEvent) => {
        const now = Date.now()
        if (now - lastClickTopBar < 400) {
            animating = true
            requestAnimationFrame(() => {
                resetWindowPosition(id)
                setTimeout(() => (animating = false), 100)
            })
            return
        }
        lastClickTopBar = now

        const startX = e.clientX
        const startY = e.clientY
        const startLeft = dimensions.x
        const startTop = dimensions.y

        const onPointerMove = (e: PointerEvent) => {
            dimensions.x = startLeft + e.clientX - startX
            dimensions.y = Math.max(0, startTop + e.clientY - startY)
        }

        const onPointerUp = () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
            dimensions.x = Math.round(dimensions.x)
            dimensions.y = Math.round(dimensions.y)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)
    }

    const resize =
        (x: 'l' | 'r' | null, y: 'b' | 't' | null) => (e: PointerEvent) => {
            e.preventDefault()
            const startX = e.clientX
            const startY = e.clientY
            const og = { ...dimensions }

            const onPointerMove = (e: PointerEvent) => {
                const left = () => {
                    dimensions.width = Math.round(
                        clamp(
                            og.width - (e.clientX - startX),
                            MIN_WIDTH,
                            maxWidth
                        )
                    )
                    dimensions.x = og.x + og.width - dimensions.width
                }
                const right = () => {
                    dimensions.width = Math.round(
                        clamp(
                            og.width + (e.clientX - startX),
                            MIN_WIDTH,
                            maxWidth
                        )
                    )
                }
                const bottom = () => {
                    dimensions.height = Math.round(
                        clamp(
                            og.height + (e.clientY - startY),
                            MIN_HEIGHT,
                            maxHeight
                        )
                    )
                }
                const top = () => {
                    dimensions.height = Math.round(
                        clamp(
                            og.height - (e.clientY - startY),
                            MIN_HEIGHT,
                            maxHeight
                        )
                    )
                    dimensions.y = og.y + og.height - dimensions.height
                }

                if (x === 'l') left()
                else if (x === 'r') right()

                if (y === 't') top()
                else if (y === 'b') bottom()
            }

            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove)
                window.removeEventListener('pointerup', onPointerUp)
            }

            window.addEventListener('pointermove', onPointerMove)
            window.addEventListener('pointerup', onPointerUp)
        }

    $effect(() => {
        const handler = (e: KeyboardEvent) => {
            if (
                e.key === 'Escape' &&
                windowOrder[windowOrder.length - 1] === id
            ) {
                setWindowVisibility(id, false)
                e.preventDefault()
                e.stopImmediatePropagation()
            }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    })

    const onClose = (e: PointerEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setWindowVisibility(id, false)
    }
</script>

<div
    class={(classes ?? '') + ' container'}
    class:visible={dimensions.visible}
    class:fully-hidden={fullyHidden}
    class:animating
    style="top: {dimensions.y}px; left: {dimensions.x}px; width: {dimensions.width}px; height: {dimensions.height}px"
    style:z-index={zIndex + 3}
    onpointerdown={() => pushWindowToFront(id)}
>
    <div class="topbar" onpointerdown={onMove}>
        {#if name}
            <span class="primary">
                {#if typeof name === 'string'}
                    {name}
                {:else}
                    <Text {...name} />
                {/if}
            </span>
        {/if}
        {#if nameSecondary}
            <span class="secondary">
                {#if typeof nameSecondary === 'string'}
                    {nameSecondary}
                {:else}
                    <Text {...nameSecondary} />
                {/if}
            </span>
        {/if}
        <button
            class="close"
            onpointerdown={(e) => e.stopImmediatePropagation()}
            onpointerup={onClose}
        >
            <Close />
        </button>
    </div>

    <div class="resizer left" onpointerdown={resize('l', null)}></div>
    <div class="resizer right" onpointerdown={resize('r', null)}></div>
    <div class="resizer bottom" onpointerdown={resize(null, 'b')}></div>
    <div class="resizer top" onpointerdown={resize(null, 't')}></div>
    <div class="resizer left bottom" onpointerdown={resize('l', 'b')}></div>
    <div class="resizer right bottom" onpointerdown={resize('r', 'b')}></div>
    <div class="resizer left top" onpointerdown={resize('l', 't')}></div>
    <div class="resizer right top" onpointerdown={resize('r', 't')}></div>

    <div class="content" {id}>
        {@render children()}
    </div>
    {#if import.meta.env.DEV}
        <div class="debug">
            {[
                id,
                dimensions.x,
                dimensions.y,
                dimensions.width,
                dimensions.height,
            ].join(' - ')}
        </div>
    {/if}
</div>

<style>
    .container {
        z-index: 2;
        background-color: #181818e8;
        border: 1px solid #2d2d2d;
        border-radius: 4px;
        backdrop-filter: blur(2px);
        box-sizing: border-box;
        position: absolute;
        padding-top: 30px;
        max-width: 100%;
        max-height: 100%;
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);

        opacity: 0;
        pointer-events: none;
        user-select: none;
        transform: translateY(-6px);

        transition:
            opacity 0.1s,
            transform 0.1s;

        &.visible {
            opacity: 1;
            pointer-events: all;
            user-select: auto;
            transform: translateY(0);
        }

        &.fully-hidden {
            display: none;
        }

        &.animating {
            transition:
                left 0.1s,
                top 0.1s,
                width 0.1s,
                height 0.1s,
                opacity 0.1s,
                transform 0.1s;
        }
    }

    .content {
        position: relative;
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
        /* scrollbar-gutter: stable; */
        pointer-events: auto;
        padding: 4px 12px 12px 12px;
    }

    .topbar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 30px;
        pointer-events: all;
        cursor: move;
        background-color: #090909;
        z-index: 2;
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
        border-bottom: 1px solid #2d2d2d;
        user-select: none;
        padding: 4px 0 4px 12px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;
        overflow: hidden;

        & > span {
            font-size: 12px;
            font-weight: 700;
            color: #ddd;
            font-variant: frac;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            &.primary {
                flex-grow: 10;
                flex-shrink: 0;
                margin-right: 6px;
            }

            &.secondary {
                margin-left: auto;
                opacity: 0.5;
                font-weight: 500;
                flex-shrink: 10;
                flex-grow: 1;
                text-align: right;
            }
        }

        & .close {
            box-sizing: border-box;
            height: 30px;
            width: 30px;
            padding: 2px 0px 0 0;
            margin: 0 0 0 12px;
            border-radius: 0;
            border: none;
            border-left: 1px solid #2d2d2d;
            background: none;
            color: #fff;
            font-size: 20px;
            line-height: 1;
            opacity: 1;
            transition: background-color 0.1s;
            cursor: pointer;
            &:hover,
            &:target {
                background-color: #333;
            }
        }
    }

    .resizer {
        position: absolute;
        height: 100%;
        width: 100%;
        pointer-events: all;
        box-sizing: content-box;
        z-index: 1;

        &.left,
        &.right {
            width: 8px;
            cursor: ew-resize;
            top: 0;
        }

        &.top,
        &.bottom {
            height: 8px;
            cursor: ns-resize;
        }

        &.left {
            left: -6px;
            &.top {
                cursor: nwse-resize;
            }
            &.bottom {
                cursor: nesw-resize;
            }
        }
        &.right {
            right: -6px;
            &.top {
                cursor: nesw-resize;
            }
            &.bottom {
                cursor: nwse-resize;
            }
        }
        &.bottom {
            top: unset;
            bottom: -6px;
        }
        &.top {
            top: -6px;
        }
    }

    .debug {
        position: absolute;
        bottom: 100%;
        left: 0;
        font-family: monospace;
        opacity: 0.8;
        font-size: 0.8em;
    }
</style>
