<script lang="ts">
  let { totalPages, currentPage = $bindable(1), maximumPageTabs = 10 } = $props();
  let pageItems = $derived.by(() => {
    const currentGroup = Math.floor(currentPage / maximumPageTabs);
    const startPage = currentGroup * maximumPageTabs + 1;
    const endPage = Math.min(startPage + maximumPageTabs - 1, totalPages);
    const items = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return items;
  });

  function prevPage() {
    if (currentPage > 1) {
      currentPage -= 1;
    }
  }

  function nextPage() {
    if (currentPage < totalPages) {
      currentPage += 1;
    }
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
    }
  }
</script>

<div class="join">
  <button class="btn join-item" onclick={prevPage}>上一頁</button>
  {#each pageItems as pageItem}
    <button
      class:btn-active={currentPage === pageItem}
      class="btn join-item"
      onclick={() => goToPage(pageItem)}
    >
      {pageItem}
    </button>
  {/each}
  <button class="btn join-item" onclick={nextPage}>下一頁</button>
</div>
