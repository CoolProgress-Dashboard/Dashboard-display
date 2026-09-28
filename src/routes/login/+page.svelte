<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { error?: string; success?: string } | undefined;
  export let data: { error?: string | null };

  let email = '';
  let password = '';
</script>

<section class="auth">
  <h1>Sign in</h1>
  <p>Use your email and password.</p>
  <form method="POST" action="?/sign-in" use:enhance>
    <label>
      Email
      <input name="email" type="email" bind:value={email} placeholder="you@company.com" />
    </label>
    <label>
      Password
      <input name="password" type="password" bind:value={password} placeholder="••••••••" />
    </label>
    <button type="submit" disabled={!email || !password}>Sign in</button>
  </form>

  {#if form?.error}
    <p class="message error">{form.error}</p>
  {:else if data?.error}
    <p class="message error">{data.error}</p>
  {:else if form?.success}
    <p class="message success">{form.success}</p>
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
  .message.success { color: #15803d; }
</style>
