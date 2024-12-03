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
    let importedIds: string = $state('')
    let data = $state(getRawCompleted())

    $effect(() => {
        // remove all non-numeric + comma + space characters
        importedIds = importedIds.replace(/[^0-9, ]/g, '')
    })

    type Action =
        | 'imported'
        | 'exported'
        | 'imported-quest-ids'
        | 'imported-achievement-ids'
    let actioned = $state<Action | null>(null)

    completed.subscribe(() => (data = getRawCompleted()))

    const updateAction = (action: Action) => {
        actioned = action
        setTimeout(() => (actioned === action ? (actioned = null) : null), 2000)
    }

    const addToClipboard = () => {
        navigator.clipboard.writeText(data)
        updateAction('exported')
    }

    const importBackup = () => {
        try {
            setRawCompleted(backup)
            updateAction('imported')
        } catch (e) {
            console.error(e)
            alert('Invalid data')
        }
    }

    const importIds = (type: 'quest' | 'achievement') => {
        const prefix = type === 'quest' ? 'q' : 'a'
        const ids = importedIds
            .split(',')
            .map((id) => parseInt(id.trim()))
            .filter((id) => !isNaN(id))
            .map((id) => prefix + id)
        completed.update(({ completed }) => ({
            completed: [...new Set([...completed, ...ids])],
        }))
        updateAction(`imported-${type}-ids`)
    }
</script>

<Window id="backup" name={{ key: 'backup' }} maxWidth={800}>
    <div class="row">
        <Column>
            <Text element="h3" key="export" />
            <Text element="p" key="export-info" />
            <textarea
                readonly
                value={data}
                onclick={(e) => e.currentTarget.select()}
                spellcheck="false"
            ></textarea>
            <button onclick={addToClipboard}>
                <Text key={actioned === 'exported' ? 'copied' : 'copy'} />
            </button>
        </Column>
        <Column>
            <Text element="h3" key="import" />
            <Text element="p" key="import-info" />
            <textarea bind:value={backup} spellcheck="false"></textarea>
            <button onclick={importBackup}>
                <Text key={actioned === 'imported' ? 'imported' : 'import'} />
            </button>
        </Column>
        <Column>
            <Text element="h3" key="import-ids" />
            <Text element="p" key="import-ids-info" />
            <textarea
                bind:value={importedIds}
                spellcheck="false"
                placeholder="816,817,910,128,1403,1405"
            ></textarea>
            <div class="import-ids">
                <button onclick={() => importIds('quest')}>
                    <Text
                        key={actioned === 'imported-quest-ids'
                            ? 'imported'
                            : 'import-quest-ids'}
                    />
                </button>
                <button onclick={() => importIds('achievement')}>
                    <Text
                        key={actioned === 'imported-achievement-ids'
                            ? 'imported'
                            : 'import-achievement-ids'}
                    />
                </button>
            </div>
        </Column>
    </div>
</Window>

<style>
    .row {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 6px;
        align-items: stretch;
        justify-content: space-evenly;

        & > :global(*) {
            max-width: 400px;
            min-width: 250px;
            flex: 1;
            height: unset;
            & > :global(p) {
                flex-grow: 1;
                flex-shrink: 0;
            }
        }

        & :global(h3) {
            margin: 0.5em 0 0 0;
        }
    }

    .import-ids {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
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
</style>
