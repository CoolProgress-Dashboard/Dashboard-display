<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { error?: string } | undefined;

  let password = '';
  let confirm = '';
</script>

<section class="auth">
  <h1>Set new password</h1>
  <p>Choose a new password for your account.</p>

  <form method="POST" use:enhance>
    <label>
      New password
      <input name="password" type="password" bind:value={password} placeholder="••••••••" />
    </label>
    <label>
      Confirm password
      <input name="confirm" type="password" bind:value={confirm} placeholder="••••••••" />
    </label>
    <button type="submit" disabled={!password || !confirm}>Update password</button>
  </form>

  {#if form?.error}
    <p class="message error">{form.error}</p>
  {/if}
</section>

<style>
  .auth {
    max-width: 420px;
    margin: 4rem auto;
    background: #fff;
    padding: 2rem;
    border-radius: 18px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  }
  label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 1.5rem 0;
  }
  input {
    padding: 0.75rem 1rem;
    border-radius: 12px;
    border: 1px solid #d9d2c5;
    font-size: 1rem;
  }
  button {
    width: 100%;
    padding: 0.85rem 1rem;
    border: none;
    border-radius: 12px;
    background: #1b1c1f;
    color: #f7f5f2;
    font-weight: 600;
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .message {
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  .message.error { color: #b91c1c; }
</style>
