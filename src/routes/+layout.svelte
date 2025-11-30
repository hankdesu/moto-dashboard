<script lang="ts">
  import Dialog from '$lib/components/Dialog.svelte';
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head></svelte:head>

{@render children?.()}
<Dialog />
