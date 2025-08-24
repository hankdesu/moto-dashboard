<script lang="ts">
  const menuItems = [{ label: '車籍資料', page: '/dashboard' }];
</script>

<ul class="menu h-screen w-56 menu-lg rounded-box bg-base-200">
  {#each menuItems as item}
    <li><a href={item.page}>{item.label}</a></li>
  {/each}
</ul>
