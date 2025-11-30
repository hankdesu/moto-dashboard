<script lang="ts">
  import { onMount } from 'svelte';
  import { dialogStore } from '$lib/stores/dialog-store.svelte';
  import X from '$lib/icons/X.svelte';

  let modal: HTMLDialogElement;

  onMount(() => {
    dialogStore.setDialog(modal);
  });
</script>

<dialog class="modal" bind:this={modal} onclose={() => dialogStore.hide()}>
  <div class="modal-box flex justify-between">
    {#if dialogStore.component}
      <dialogStore.component {...dialogStore.props} />
    {/if}
    {#if dialogStore.options.closeOnCorner}
      <X className="w-6 h-6 cursor-pointer" onclick={() => dialogStore.hide()} />
    {/if}
  </div>
  {#if dialogStore.options.closeOnBackdrop}
    <form method="dialog" class="modal-backdrop">
      <button>Close</button>
    </form>
  {/if}
</dialog>
