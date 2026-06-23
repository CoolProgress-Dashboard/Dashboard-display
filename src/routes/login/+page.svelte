<script lang="ts">
  import { enhance } from '$app/forms';

  export let form: { error?: string; success?: string } | undefined;

  let email = '';
  let password = '';
  let showForgot = false;
</script>

<section class="auth">
  <h1>Sign in</h1>
  <p>Use your email and password, or request a magic link.</p>
  <form method="POST" action="?/sign-in" use:enhance>
    <label>
      Email
      <input name="email" type="email" bind:value={email} placeholder="you@company.com" />
    </label>
    <label>
      <span class="label-row">
        Password
        <button type="button" class="link-btn" on:click={() => showForgot = !showForgot}>
          Forgot password?
        </button>
      </span>
      <input name="password" type="password" bind:value={password} placeholder="••••••••" />
    </label>
    <button type="submit" disabled={!email || !password}>Sign in</button>
  </form>

  {#if showForgot}
    <form method="POST" action="?/forgot-password" use:enhance>
      <p class="forgot-hint">Enter your email and we will send you a reset link.</p>
      <label>
        Email
        <input name="email" type="email" bind:value={email} placeholder="you@company.com" />
      </label>
      <button class="ghost" type="submit" disabled={!email}>Send reset link</button>
    </form>
  {:else}
    <form method="POST" action="?/magic-link" use:enhance>
      <label>
        Email
        <input name="email" type="email" bind:value={email} placeholder="you@company.com" />
      </label>
      <button class="ghost" type="submit" disabled={!email}>Send magic link</button>
    </form>
  {/if}

  <p class="hint">
    Need an account? <a href="/register">Create one</a>
  </p>
  {#if form?.error}
    <p class="message error">{form.error}</p>
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
  form + form {
    margin-top: 1rem;
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
  .ghost {
    margin-top: 0.75rem;
    background: transparent;
    color: #1b1c1f;
    border: 1px solid #1b1c1f;
  }
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .hint {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #6b6254;
  }
  .hint a {
    color: #1b1c1f;
    text-decoration: none;
    font-weight: 600;
  }
  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .link-btn {
    background: none;
    border: none;
    padding: 0;
    width: auto;
    font-size: 0.82rem;
    font-weight: 600;
    color: #6b6254;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .link-btn:hover { color: #1b1c1f; }
  .forgot-hint {
    margin: 0.5rem 0 0;
    font-size: 0.88rem;
    color: #6b6254;
  }
  .message {
    margin-top: 1rem;
    font-size: 0.9rem;
  }
  .message.error { color: #b91c1c; }
  .message.success { color: #15803d; }
</style>
