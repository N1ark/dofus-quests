<script lang="ts">
    import { getRawCompleted, setRawCompleted } from '../../state.svelte'
    import Column from './Column.svelte'
    import Container from './Container.svelte'
    import Row from './Row.svelte'

    const { close }: { close?: () => any } = $props()

    const data = getRawCompleted()
    let backup: string = $state('')

    const addToClipboard = () => {
        navigator.clipboard.writeText(data)
    }

    const importBackup = () => {
        try {
            setRawCompleted(backup)
            close?.()
        } catch (e) {
            console.error(e)
            alert('Invalid data')
        }
    }
</script>

<Container classes="modal">
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
            <button onclick={addToClipboard}>Copy to clipboard</button>
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
        position: absolute;
        inset: 64px;
        z-index: 100;
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
        height: 200px;
        resize: none;
        box-sizing: border-box;
        font-family: monospace;
    }

    h2,
    h3 {
        margin-bottom: 0;
    }
</style>
