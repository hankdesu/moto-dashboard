<script lang="ts">
  let { className = 'w-6 h-6', ...restProps } = $props();
</script>

<svg
  class={className}
  fill="none"
  viewBox="0 0 24 24"
  stroke-width="1.5"
  stroke="currentColor"
  {...restProps}
>
  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
</svg>
