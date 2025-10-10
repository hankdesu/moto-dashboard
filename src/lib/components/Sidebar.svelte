<script lang="ts">
  import ThemeController from "./ThemeController.svelte";

  const menuItems = [{ label: '車籍資料', page: '/dashboard' }];
</script>

<ul class="menu h-screen w-56 menu-lg rounded-box bg-base-200 gap-2.5">
  <li class="flex items-end">
    <ThemeController />
  </li>
  {#each menuItems as item}
    <li><a href={item.page}>{item.label}</a></li>
  {/each}
</ul>
