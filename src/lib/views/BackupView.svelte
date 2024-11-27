<script lang="ts">
    import Column from '../components/Column.svelte'
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

<Window id="backup" name={{ key: 'backup' }} maxWidth={800}>
    <div class="grid">
        <Text element="h3" key="export" />
        <Text element="h3" key="import" />
        <Text element="p" key="export-info" />
        <Text element="p" key="import-info" />
        <Column>
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
        <Column>
            <textarea bind:value={backup} spellcheck="false"></textarea>
            <button onclick={importBackup}>
                <Text key="import" />
            </button>
        </Column>
    </div>
</Window>

<style>
    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;

        & :global(h3) {
            margin-bottom: 0;
        }
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
</style>
