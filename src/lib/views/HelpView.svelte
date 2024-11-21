<script lang="ts">
    import Text from '../components/Text.svelte'
    import Window from '../components/Window.svelte'
</script>

<Window id="help" name={{ key: 'help' }}>
    <h3><Text key="help" /></h3>
    <p><Text key="help-full" raw /></p>
</Window>
