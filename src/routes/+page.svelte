<script lang="ts">
  import { supabase } from '$lib/supabase/client';
  import UserIcon from '$lib/icons/UserIcon.svelte';
  import LockIcon from '$lib/icons/LockIcon.svelte';
  import { goto } from '$app/navigation';
  import { dialogStore } from '$lib/stores/dialog-store.svelte';
  import LoginFailedDialog from '$lib/components/dialogs/LoginFailedDialog.svelte';

  let isLoading = $state(false);
  let email = $state('');
  let password = $state('');

  async function login(e: SubmitEvent) {
    e.preventDefault();

    isLoading = true;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      dialogStore.show(LoginFailedDialog, {}, { closeOnCorner: true });
    } else {
      await goto('/dashboard');
    }
    isLoading = false;
  }
</script>

<div class="flex h-screen items-center justify-center">
  <form onsubmit={login}>
    <fieldset class="fieldset w-xs gap-5 rounded-box">
      <label class="input">
        <UserIcon className="h-5" />
        <input type="email" id="email" name="email" bind:value={email} placeholder="信箱" />
      </label>
      <label class="input">
        <LockIcon className="h-5" />
        <input
          type="password"
          id="password"
          name="password"
          bind:value={password}
          placeholder="密碼"
        />
      </label>
      <button type="submit" class="btn btn-outline btn-primary">
        {#if isLoading}
          <span class="loading loading-spinner">登入中</span>
        {:else}
          登入
        {/if}
      </button>
    </fieldset>
  </form>
</div>
