<script lang="ts">
    import Column from '../components/Column.svelte'
    import Row from '../components/Row.svelte'
    import Text from '../components/Text.svelte'
    import Window from '../components/Window.svelte'
    import {
        completed,
        getRawCompleted,
        setRawCompleted,
    } from '../data/state.svelte'

    let backup: string = $state('')
    let copied = $state(false)
    let data = $state(getRawCompleted())

    completed.subscribe(() => (data = getRawCompleted()))

    const addToClipboard = () => {
        navigator.clipboard.writeText(data)
        copied = true
        setTimeout(() => (copied = false), 2000)
    }

    const importBackup = () => {
        try {
            setRawCompleted(backup)
        } catch (e) {
            console.error(e)
            alert('Invalid data')
        }
    }
</script>

<Window id="backup" name={{ key: 'backup' }}>
    <Row>
        <Column classes="modal-col">
            <h3><Text key="export" /></h3>
            <p><Text key="export-info" /></p>
            <textarea
                readonly
                value={data}
                onclick={(e) => e.currentTarget.select()}
                spellcheck="false"
            ></textarea>
            <button onclick={addToClipboard}>
                <Text key={copied ? 'copied' : 'copy'} />
            </button>
        </Column>
        <Column classes="modal-col">
            <h3><Text key="import" /></h3>
            <p><Text key="import-info" /></p>
            <textarea bind:value={backup} spellcheck="false"></textarea>
            <button onclick={importBackup}>
                <Text key="import" />
            </button>
        </Column>
    </Row>
</Window>

<style>
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

    h3 {
        margin-bottom: 0;
    }
</style>
