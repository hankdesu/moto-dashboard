<script lang="ts">
  import Sidebar from "$lib/components/Sidebar.svelte";

  let { children } = $props();
</script>

<div class="flex h-screen">
  <Sidebar />
  {@render children?.()}
</div>
