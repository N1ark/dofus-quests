<!-- svelte-ignore a11y_no_static_element_interactions -->
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
            const [x, y, width, height, visible] = stored.split(',').map(Number)
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
    }: {
        id: string
        name?: Translatable
        nameSecondary?: Translatable
        children: Snippet
        classes?: string
    } = $props()

    let dimensions = $state(getWindowInfo(id))
    let fullyHidden = $state(!dimensions.visible)
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

    const onMove = (e: MouseEvent) => {
        const startX = e.clientX
        const startY = e.clientY
        const startLeft = dimensions.x
        const startTop = dimensions.y

        const onMouseMove = (e: MouseEvent) => {
            dimensions.x = startLeft + e.clientX - startX
            dimensions.y = Math.max(0, startTop + e.clientY - startY)
        }

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
        }

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
    }

    const onResize =
        (dim: 'left' | 'right' | 'bottom' | 'bottomleft' | 'bottomright') =>
        (e: MouseEvent) => {
            e.preventDefault()
            const startX = e.clientX
            const startY = e.clientY
            const og = { ...dimensions }

            const onMouseMove = (e: MouseEvent) => {
                const left = () => {
                    dimensions.width = Math.max(
                        MIN_WIDTH,
                        og.width - (e.clientX - startX)
                    )
                    dimensions.x = og.x + og.width - dimensions.width
                }
                const right = () => {
                    dimensions.width = Math.max(
                        MIN_WIDTH,
                        og.width + (e.clientX - startX)
                    )
                }
                const bottom = () => {
                    dimensions.height = Math.max(
                        MIN_HEIGHT,
                        og.height + (e.clientY - startY)
                    )
                }

                switch (dim) {
                    case 'left':
                        left()
                        break
                    case 'right':
                        right()
                        break
                    case 'bottom':
                        bottom()
                        break
                    case 'bottomleft':
                        left()
                        bottom()
                        break
                    case 'bottomright':
                        right()
                        bottom()
                        break
                }
            }

            const onMouseUp = () => {
                window.removeEventListener('mousemove', onMouseMove)
                window.removeEventListener('mouseup', onMouseUp)
            }

            window.addEventListener('mousemove', onMouseMove)
            window.addEventListener('mouseup', onMouseUp)
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

    const onClose = (e: MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setWindowVisibility(id, false)
    }
</script>

<div
    class={(classes ?? '') + ' container'}
    class:visible={dimensions.visible}
    class:fully-hidden={fullyHidden}
    style="top: {dimensions.y}px; left: {dimensions.x}px; width: {dimensions.width}px; height: {dimensions.height}px"
    style:z-index={zIndex + 3}
    onmousedown={() => pushWindowToFront(id)}
>
    <div class="topbar" onmousedown={onMove}>
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
            onmousedown={(e) => e.stopImmediatePropagation()}
            onmouseup={onClose}
        >
            <Close />
        </button>
    </div>
    <div class="resizer left" onmousedown={onResize('left')}></div>
    <div class="resizer right" onmousedown={onResize('right')}></div>
    <div class="resizer bottom" onmousedown={onResize('bottom')}></div>
    <div class="resizer bottomleft" onmousedown={onResize('bottomleft')}></div>
    <div
        class="resizer bottomright"
        onmousedown={onResize('bottomright')}
    ></div>
    <div class="content" {id}>
        {@render children()}
    </div>
</div>

<style>
    .container {
        z-index: 2;
        background-color: #181818e0;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        backdrop-filter: blur(2px);
        box-sizing: border-box;
        position: absolute;
        padding-top: 20px;
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
        height: 20px;
        pointer-events: all;
        cursor: move;
        background-color: #090909;
        z-index: 2;
        border-top-left-radius: 4px;
        border-top-right-radius: 4px;
        border-bottom: 1px solid rgba(128, 128, 128, 0.3);
        user-select: none;
        padding: 4px 0 4px 4px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > span {
            font-size: 10px;
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
            height: 19px;
            width: 20px;
            padding: 2px 0px 0 0;
            margin: 0 0 0 8px;
            border-radius: 0;
            border: none;
            border-left: 1px solid rgba(128, 128, 128, 0.3);
            background: none;
            color: #fff;
            line-height: 1;
            opacity: 1;
            transition: color 0.1s;
            cursor: pointer;
            &:hover {
                color: rgba(255, 255, 255, 0.5);
            }
        }
    }

    .resizer {
        position: absolute;
        width: 8px;
        height: 8px;
        pointer-events: all;
        /* border: 1px solid red; */
        box-sizing: content-box;
        &.left {
            top: 0;
            left: -6px;
            height: 100%;
            cursor: ew-resize;
            z-index: 1;
        }
        &.right {
            top: 0;
            right: -6px;
            height: 100%;
            cursor: ew-resize;
            z-index: 1;
        }
        &.bottom {
            bottom: -6px;
            left: 0;
            width: 100%;
            cursor: ns-resize;
            z-index: 1;
        }
        &.bottomleft {
            width: 12px;
            height: 12px;
            bottom: -6px;
            left: -6px;
            cursor: nesw-resize;
            z-index: 3;
            border-color: green;
        }
        &.bottomright {
            width: 12px;
            height: 12px;
            bottom: -6px;
            right: -6px;
            cursor: nwse-resize;
            z-index: 3;
            border-color: green;
        }
    }
</style>
