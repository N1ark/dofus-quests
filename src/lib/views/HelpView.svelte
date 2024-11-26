<script lang="ts">
    import Text from '../components/Text.svelte'
    import Window from '../components/Window.svelte'
</script>

<Window id="help" name={{ key: 'help' }} maxWidth={500}>
    <Text element="h3" key="help" />
    <Text element="p" key="help-full" raw />
</Window>
