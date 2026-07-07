<script lang="ts">
  import { page } from '$app/stores';
  import { supabaseBrowser } from '$lib/supabase/client';

  // Pre-fill current pillar from URL (e.g. /dashboard/emissions → "emissions")
  $: referringPillar = $page.url.searchParams.get('from') ?? 'not specified';

  // Form state
  let q1Rating = '';
  let q1Comment = '';
  let q2Rating = '';
  let q2Comment = '';
  let q3Missing = '';
  let q4Incorrect = '';
  let q5UsefulFor = '';
  let otherComments = '';
  let userEmail = '';
  let userName = '';

  let submitting = false;
  let submitted = false;
  let errorMsg = '';

  async function handleSubmit() {
    submitting = true;
    errorMsg = '';

    const { error } = await (supabaseBrowser as any).from('feedback').insert({
      user_name: userName || null,
      user_email: userEmail || null,
      current_pillar: referringPillar,
      q1_rating: q1Rating || null,
      q1_comment: q1Comment || null,
      q2_rating: q2Rating || null,
      q2_comment: q2Comment || null,
      q3_missing: q3Missing || null,
      q4_incorrect: q4Incorrect || null,
      q5_useful_for: q5UsefulFor || null,
      other_comments: otherComments || null,
    });

    submitting = false;

    if (error) {
      errorMsg = 'Something went wrong. Please try again.';
      console.error('Feedback submit error:', error);
    } else {
      submitted = true;
    }
  }

  $: hasContent =
    q1Rating || q2Rating || q3Missing || q4Incorrect || q5UsefulFor || otherComments;
</script>

<div class="feedback-page">
  <div class="feedback-card">

    <!-- Header -->
    <div class="fb-header">
      <div class="fb-icon">
        <i class="fa-solid fa-comment-dots"></i>
      </div>
      <div>
        <h1 class="fb-title">Share Your Feedback</h1>
        <p class="fb-subtitle">
          Help us improve CoolProgress — your input shapes what gets built next.
        </p>
      </div>
    </div>

    {#if submitted}
      <!-- Success state -->
      <div class="fb-success">
        <div class="fb-success-icon">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <h2>Thank you!</h2>
        <p>Your feedback has been recorded. We read every submission.</p>
        <a href="/dashboard/overview" class="btn-primary">
          <i class="fa-solid fa-arrow-left"></i>
          Back to dashboard
        </a>
      </div>

    {:else}
      <form on:submit|preventDefault={handleSubmit}>

        <!-- Identity row: name + email -->
        <div class="fb-identity-row">
          <div class="fb-field">
            <label for="fb-name">
              <i class="fa-solid fa-user"></i>
              Your name <span class="optional">(optional)</span>
            </label>
            <input
              id="fb-name"
              type="text"
              placeholder="Jane Smith"
              bind:value={userName}
            />
          </div>
          <div class="fb-field">
            <label for="fb-email">
              <i class="fa-solid fa-envelope"></i>
              Your email <span class="optional">(optional)</span>
            </label>
            <input
              id="fb-email"
              type="email"
              placeholder="you@organisation.org"
              bind:value={userEmail}
            />
          </div>
        </div>

        <div class="fb-divider"></div>

        <!-- Q1 -->
        <div class="fb-question">
          <div class="q-label">
            <span class="q-num">1</span>
            Does the dashboard give you a useful overview of where the cooling transition stands globally?
          </div>
          <div class="radio-group">
            {#each ['Yes', 'Partially', 'No'] as opt}
              <label class="radio-pill" class:selected={q1Rating === opt}>
                <input type="radio" name="q1" value={opt} bind:group={q1Rating} hidden />
                {opt}
              </label>
            {/each}
          </div>
          {#if q1Rating}
            <textarea
              placeholder="Tell us more… (optional)"
              rows="3"
              bind:value={q1Comment}
            ></textarea>
          {/if}
        </div>

        <!-- Q2 -->
        <div class="fb-question">
          <div class="q-label">
            <span class="q-num">2</span>
            Does it accurately represent and reference the work being done by partners in your area?
          </div>
          <div class="radio-group">
            {#each ['Yes', 'Partially', 'No'] as opt}
              <label class="radio-pill" class:selected={q2Rating === opt}>
                <input type="radio" name="q2" value={opt} bind:group={q2Rating} hidden />
                {opt}
              </label>
            {/each}
          </div>
          {#if q2Rating}
            <textarea
              placeholder="Which partners or regions feel under-represented? (optional)"
              rows="3"
              bind:value={q2Comment}
            ></textarea>
          {/if}
        </div>

        <!-- Q3 -->
        <div class="fb-question">
          <div class="q-label">
            <span class="q-num">3</span>
            Is anything important missing from the picture — a theme, region, or data dimension?
          </div>
          <textarea
            placeholder="e.g. district cooling, specific country data, passive cooling…"
            rows="4"
            bind:value={q3Missing}
          ></textarea>
        </div>

        <!-- Q4 -->
        <div class="fb-question">
          <div class="q-label">
            <span class="q-num">4</span>
            Do you spot any data points or framing that look incorrect or out of date?
          </div>
          <textarea
            placeholder="Please be as specific as possible — section, chart, or number…"
            rows="4"
            bind:value={q4Incorrect}
          ></textarea>
        </div>

        <!-- Q5 -->
        <div class="fb-question">
          <div class="q-label">
            <span class="q-num">5</span>
            What would make this most useful for your work — or for communicating progress to decision-makers?
          </div>
          <textarea
            placeholder="e.g. export options, deeper country drilldowns, policy comparison tables…"
            rows="4"
            bind:value={q5UsefulFor}
          ></textarea>
        </div>

        <!-- Other comments -->
        <div class="fb-question fb-question-other">
          <div class="q-label">
            <span class="q-num q-num-other"><i class="fa-solid fa-ellipsis"></i></span>
            Other comments
          </div>
          <textarea
            placeholder="Anything else you'd like to share…"
            rows="4"
            bind:value={otherComments}
          ></textarea>
        </div>

        {#if errorMsg}
          <p class="fb-error"><i class="fa-solid fa-triangle-exclamation"></i> {errorMsg}</p>
        {/if}

        <div class="fb-actions">
          <a href="/dashboard/overview" class="btn-ghost">Cancel</a>
          <button
            type="submit"
            class="btn-primary"
            disabled={submitting || !hasContent}
          >
            {#if submitting}
              <i class="fa-solid fa-spinner fa-spin"></i> Sending…
            {:else}
              <i class="fa-solid fa-paper-plane"></i> Submit feedback
            {/if}
          </button>
        </div>

      </form>
    {/if}

  </div>
</div>

<style>
  .feedback-page {
    padding: 2rem 2.5rem;
    max-width: 780px;
    margin: 0 auto;
  }

  /* Card */
  .feedback-card {
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
    padding: 2.5rem;
  }

  /* Header */
  .fb-header {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    margin-bottom: 2rem;
  }

  .fb-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: #3D6B6B18;
    color: #3D6B6B;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .fb-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 0.25rem;
  }

  .fb-subtitle {
    font-size: 0.875rem;
    color: #64748b;
    line-height: 1.5;
  }

  /* Identity row: name + email side by side */
  .fb-identity-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .fb-field label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #475569;
    margin-bottom: 0.5rem;
  }

  .fb-field label i {
    color: #3D6B6B;
    font-size: 0.75rem;
  }

  .optional {
    font-weight: 400;
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .fb-field input {
    width: 100%;
    padding: 0.65rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    transition: border-color 0.15s;
    font-family: inherit;
  }

  .fb-field input:focus {
    outline: none;
    border-color: #3D6B6B;
    box-shadow: 0 0 0 3px #3D6B6B18;
  }

  .fb-divider {
    height: 1px;
    background: #f1f5f9;
    margin-bottom: 1.75rem;
  }

  /* Questions */
  .fb-question {
    margin-bottom: 1.75rem;
    padding-bottom: 1.75rem;
    border-bottom: 1px solid #f1f5f9;
  }

  .fb-question:last-of-type {
    border-bottom: none;
  }

  .q-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    font-size: 0.9rem;
    font-weight: 600;
    color: #1e293b;
    line-height: 1.5;
    margin-bottom: 0.875rem;
  }

  .q-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: #3D6B6B;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    border-radius: 6px;
    flex-shrink: 0;
    margin-top: 0.05rem;
  }

  .q-num-other {
    background: #94a3b8;
    font-size: 0.65rem;
  }

  /* Radio pills */
  .radio-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.875rem;
    flex-wrap: wrap;
  }

  .radio-pill {
    padding: 0.4rem 1rem;
    border: 1.5px solid #e2e8f0;
    border-radius: 99px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s ease;
    user-select: none;
  }

  .radio-pill:hover {
    border-color: #3D6B6B;
    color: #3D6B6B;
  }

  .radio-pill.selected {
    background: #3D6B6B;
    border-color: #3D6B6B;
    color: #fff;
  }

  /* Textareas */
  textarea {
    width: 100%;
    padding: 0.75rem 0.875rem;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    color: #0f172a;
    resize: vertical;
    line-height: 1.6;
    font-family: inherit;
    transition: border-color 0.15s;
    background: #fafbfc;
  }

  textarea:focus {
    outline: none;
    border-color: #3D6B6B;
    box-shadow: 0 0 0 3px #3D6B6B18;
    background: #fff;
  }

  textarea::placeholder {
    color: #c0cad8;
  }

  /* Other comments */
  .fb-question-other .q-label {
    color: #475569;
  }

  /* Error */
  .fb-error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
  }

  /* Actions */
  .fb-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }

  .btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.5rem;
    background: #3D6B6B;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: background 0.15s;
    font-family: inherit;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2D5252;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 1.25rem;
    background: transparent;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.15s;
    font-family: inherit;
  }

  .btn-ghost:hover {
    border-color: #94a3b8;
    color: #334155;
  }

  /* Success state */
  .fb-success {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 3rem 1rem;
    gap: 1rem;
  }

  .fb-success-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #3D6B6B18;
    color: #3D6B6B;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
  }

  .fb-success h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #0f172a;
  }

  .fb-success p {
    font-size: 0.95rem;
    color: #64748b;
    max-width: 340px;
  }
</style>
