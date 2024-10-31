<script lang="ts">
	import GraphView from './lib/components/GraphView.svelte';
	import { data } from './lib/data';
</script>

<main>
	<GraphView {data} />
</main>

<style>
    main {
        width: 100vw;
        height: 100vh;
    }
</style>
