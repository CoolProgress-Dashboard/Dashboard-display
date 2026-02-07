<script lang="ts">
  export let currentView: string = 'overview';
  export let onViewChange: (view: string) => void = () => {};
  export let onScopeChange: (scope: string) => void = () => {};
  export let scopeDisabled: boolean = false;
  export let activeScope: string = 'ac';
</script>

<aside class="sidebar-left">
  <div class="sidebar-logo">
    <div class="logo-mark">
      <i class="fa-solid fa-temperature-arrow-down"></i>
    </div>
    <div class="logo-text">COOL<span>PROGRESS</span></div>
  </div>

  <div class="sidebar-filters">
    <label class="filter-label" for="country-filter">Country Selected</label>
    <select id="country-filter" class="filter-select">
      <option value="">All Countries</option>
    </select>

    <label class="filter-label scope-label" class:disabled={scopeDisabled}>Appliance Scope</label>
    <div class="scope-toggle" class:disabled={scopeDisabled}>
      <button
        class="scope-btn"
        class:active={activeScope === 'ac'}
        data-scope="ac"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('ac')}
      >ACs</button>
      <button
        class="scope-btn"
        class:active={activeScope === 'fridge'}
        data-scope="fridge"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('fridge')}
      >Fridges</button>
      <button
        class="scope-btn"
        class:active={activeScope === 'fan'}
        data-scope="fan"
        type="button"
        disabled={scopeDisabled}
        on:click={() => onScopeChange('fan')}
      >Fans</button>
    </div>
  </div>

  <div class="nav-section">
    <h3>Navigation Pillars</h3>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'overview'}
      data-view="overview"
      type="button"
      on:click={() => onViewChange('overview')}
    >
      <span class="nav-icon"><i class="fa-solid fa-house"></i></span>
      <span>Strategic Summary</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'emissions'}
      data-view="emissions"
      type="button"
      on:click={() => onViewChange('emissions')}
    >
      <span class="nav-icon"><i class="fa-solid fa-smog"></i></span>
      <span>1. Emissions</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'meps'}
      data-view="meps"
      type="button"
      on:click={() => onViewChange('meps')}
    >
      <span class="nav-icon"><i class="fa-solid fa-bolt"></i></span>
      <span>2. Product Efficiency</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'kigali'}
      data-view="kigali"
      type="button"
      on:click={() => onViewChange('kigali')}
    >
      <span class="nav-icon"><i class="fa-solid fa-flask"></i></span>
      <span>3. Refrigerant Transition</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'access'}
      data-view="access"
      type="button"
      on:click={() => onViewChange('access')}
    >
      <span class="nav-icon"><i class="fa-solid fa-people-roof"></i></span>
      <span>4. Access &amp; Vulnerability</span>
    </button>
    <button
      class="nav-btn nav-item"
      class:active={currentView === 'policy'}
      data-view="policy"
      type="button"
      on:click={() => onViewChange('policy')}
    >
      <span class="nav-icon"><i class="fa-solid fa-scale-balanced"></i></span>
      <span>5. Policy Framework</span>
    </button>
  </div>

  <div class="nav-section nav-section-partners">
    <button
      class="nav-btn nav-item nav-item-partners"
      class:active={currentView === 'partners'}
      data-view="partners"
      type="button"
      on:click={() => onViewChange('partners')}
    >
      <span class="nav-icon"><i class="fa-solid fa-handshake"></i></span>
      <span>Partner Ecosystem</span>
    </button>
  </div>
</aside>
