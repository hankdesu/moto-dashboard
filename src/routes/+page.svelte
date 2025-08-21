<script>
  import UserIcon from '$lib/icons/UserIcon.svelte';
  import LockIcon from '$lib/icons/LockIcon.svelte';

</script>

<div class="flex h-screen items-center justify-center">
  <fieldset class="fieldset w-xs gap-5 rounded-box">
    <label class="input">
      <UserIcon className="h-5" />
      <input type="text" id="account" name="account" placeholder="帳號" />
    </label>

    <label class="input">
      <LockIcon className="h-5" />
      <input type="password" id="password" name="password" placeholder="密碼" />
    </label>

    <button class="btn btn-outline btn-primary">登入</button>
  </fieldset>
</div>
