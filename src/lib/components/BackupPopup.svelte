<script lang="ts">
    import { onMount } from 'svelte'
    import { getRawCompleted, setRawCompleted } from '../../state.svelte'
    import Column from './Column.svelte'
    import Container from './Container.svelte'
    import Row from './Row.svelte'

    let backup: string = $state('')
    let copied = $state(false)
    let visible = $state(false)
    const data = $derived(visible ? getRawCompleted() : '')

    const addToClipboard = () => {
        navigator.clipboard.writeText(data)
        copied = true
    }

    const importBackup = () => {
        try {
            setRawCompleted(backup)
            window.location.hash = ''
        } catch (e) {
            console.error(e)
            alert('Invalid data')
        }
    }

    onMount(() => {
        const hashCheck = () => {
            const hash = window.location.hash.slice(1)
            visible = hash === 'backup'
            if (!visible) {
                backup = ''
                copied = false
            }
        }

        hashCheck()

        window.addEventListener('hashchange', hashCheck)
        return () => window.removeEventListener('hashchange', hashCheck)
    })
</script>

<Container classes={`modal ${visible ? '' : 'hidden'}`}>
    <h2>Backup</h2>
    <Row>
        <Column classes="modal-col">
            <h3>Export</h3>
            <p>Store this somewhere to import it later.</p>
            <textarea
                readonly
                value={data}
                onclick={(e) => e.currentTarget.select()}
                spellcheck="false"
            ></textarea>
            <button onclick={addToClipboard}
                >{copied ? 'Copied!' : 'Copy to clipboard'}</button
            >
        </Column>
        <Column classes="modal-col">
            <h3>Import</h3>
            <p>Paste your backed up data to import it.</p>
            <textarea bind:value={backup} spellcheck="false"></textarea>
            <button onclick={importBackup}>Import</button>
        </Column>
    </Row>
</Container>

<style>
    :global(.modal) {
        width: 100%;
        pointer-events: auto;
        &:global(.hidden) {
            display: none;
        }
    }
    :global(.modal-col) {
        width: 50%;
    }

    textarea {
        background-color: #282828;
        border: 1px solid rgba(128, 128, 128, 0.4);
        border-radius: 4px;
        padding: 12px;
        color: white;

        width: 100%;
        height: 300px;
        resize: none;
        box-sizing: border-box;
        font-family: monospace;
    }

    h2,
    h3 {
        margin-bottom: 0;
    }
</style>
