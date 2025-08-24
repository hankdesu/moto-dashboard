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
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
</svg>
