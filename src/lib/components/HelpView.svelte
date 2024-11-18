<script lang="ts">
    import Text from './Text.svelte'
    import Window from './Window.svelte'
</script>

<Window id="help" name={{ key: 'help' }}>
    <h3><Text key="help" /></h3>
    <p><Text key="help-full" raw /></p>
</Window>
