<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Volume2, VolumeX, RotateCcw, Share2, Waves } from 'lucide-svelte';
  import TimerHero from './lib/TimerHero.svelte';
  import QuickSummary from './lib/QuickSummary.svelte';
  import ContractionList from './lib/ContractionList.svelte';
  import GuidelinesModal from './lib/GuidelinesModal.svelte';
  import { calculateStats, type Contraction } from './types';
  import { audio } from './lib/audio';

  const STORAGE_KEY = 'swell_contractions';
  const ACTIVE_KEY = 'swell_active_timer';
  const SOUND_KEY = 'swell_sound_pref';

  // State initialization from localStorage
  function getStoredContractions(): Contraction[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function getStoredActiveTime(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_KEY);
      return data ? Number(data) : null;
    } catch {
      return null;
    }
  }

  function getStoredSoundPref(): boolean {
    if (typeof window === 'undefined') return true;
    try {
      const data = localStorage.getItem(SOUND_KEY);
      return data !== null ? data === 'true' : true;
    } catch {
      return true;
    }
  }

  // Core state (persisted across refreshes)
  let contractions = $state<Contraction[]>(getStoredContractions());
  let activeStartTime = $state<number | null>(getStoredActiveTime());
  const isActive = $derived(activeStartTime !== null);
  let currentDuration = $state<number>(0);
  let timeSinceLast = $state<number | null>(null);
  
  // App UI state
  let showGuidelines = $state<boolean>(false);
  let soundOn = $state<boolean>(getStoredSoundPref());
  let showCopiedToast = $state<boolean>(false);
  let showResetModal = $state<boolean>(false);

  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let intervalTimer: ReturnType<typeof setInterval> | null = null;

  // Sync state to localStorage whenever it changes
  $effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contractions));
    } catch {
      // ignore storage errors
    }
  });

  $effect(() => {
    try {
      if (activeStartTime !== null) {
        localStorage.setItem(ACTIVE_KEY, String(activeStartTime));
      } else {
        localStorage.removeItem(ACTIVE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  });

  $effect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundOn));
      audio.soundEnabled = soundOn;
    } catch {
      // ignore storage errors
    }
  });

  // Derived rolling statistics
  const stats = $derived(calculateStats(contractions));

  // Ticking duration for active contraction
  function startTicker() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      if (activeStartTime) {
        currentDuration = Math.max(0, Math.floor((Date.now() - activeStartTime) / 1000));
      }
    }, 250);
  }

  function stopTicker() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Ticking time since previous contraction started
  function startIntervalTicker() {
    if (intervalTimer) clearInterval(intervalTimer);
    updateIntervalDisplay();
    intervalTimer = setInterval(() => {
      updateIntervalDisplay();
    }, 1000);
  }

  function updateIntervalDisplay() {
    if (contractions.length > 0) {
      const lastStart = contractions[0].startTime;
      timeSinceLast = Math.max(0, Math.floor((Date.now() - lastStart) / 1000));
    } else {
      timeSinceLast = null;
    }
  }

  // Primary Action: Single button start / stop toggle
  function handleToggle() {
    const now = Date.now();

    if (!isActive) {
      // START contraction
      activeStartTime = now;
      currentDuration = 0;
      startTicker();

      audio.playStartChime();
      audio.vibrate(50);
    } else {
      // STOP contraction
      if (!activeStartTime) return;
      
      const endTime = now;
      const durationSeconds = Math.max(1, Math.round((endTime - activeStartTime) / 1000));
      
      // Calculate interval from previous contraction's start time
      let intervalSeconds: number | undefined = undefined;
      if (contractions.length > 0) {
        intervalSeconds = Math.max(0, Math.round((activeStartTime - contractions[0].startTime) / 1000));
      }

      const newContraction: Contraction = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        startTime: activeStartTime,
        endTime,
        durationSeconds,
        intervalSeconds,
      };

      // Newest first
      contractions = [newContraction, ...contractions];

      activeStartTime = null;
      currentDuration = 0;
      stopTicker();
      updateIntervalDisplay();

      audio.playEndChime();
      audio.vibrate([40, 60, 40]);
    }
  }

  // Cancel running timer (accidental tap)
  function handleCancel() {
    activeStartTime = null;
    currentDuration = 0;
    stopTicker();
  }

  // Delete an individual logged item
  function handleDelete(id: string) {
    const index = contractions.findIndex(c => c.id === id);
    if (index === -1) return;

    const updated = contractions.filter(c => c.id !== id);
    
    // Recalculate interval for the subsequent item if needed
    if (index < updated.length) {
      const nextItem = updated[index];
      const prevItem = updated[index + 1];
      if (prevItem) {
        nextItem.intervalSeconds = Math.max(0, Math.round((nextItem.startTime - prevItem.startTime) / 1000));
      } else {
        nextItem.intervalSeconds = undefined;
      }
    }

    contractions = [...updated];
    updateIntervalDisplay();
  }

  function handleUpdateIntensity(id: string, intensity: 'mild' | 'moderate' | 'strong') {
    contractions = contractions.map(c => c.id === id ? { ...c, intensity } : c);
  }

  function handleUpdateNotes(id: string, notes: string) {
    contractions = contractions.map(c => c.id === id ? { ...c, notes } : c);
  }

  // Explicit user confirmation to clear session
  function confirmReset() {
    handleCancel();
    contractions = [];
    timeSinceLast = null;
    showResetModal = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
    } catch {
      // ignore
    }
  }

  function toggleSound() {
    soundOn = !soundOn;
  }

  function copySummary() {
    if (contractions.length === 0) return;
    
    const lines = [
      `Swell Contraction Log (${new Date().toLocaleDateString()})`,
      `Total Logged: ${contractions.length}`,
      `Last Hour: ${stats.countLastHour} contractions | Avg Dur: ${stats.avgDurationSeconds}s | Avg Int: ${Math.round(stats.avgIntervalSeconds / 60)}m`,
      '',
      ...contractions.map((c, i) => {
        const time = new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const intStr = c.intervalSeconds ? `Every ${Math.round(c.intervalSeconds / 60)}m` : 'First';
        const notesStr = c.notes ? ` (${c.notes})` : '';
        return `#${contractions.length - i}: ${time} - ${c.durationSeconds}s duration - ${intStr}${notesStr}`;
      })
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    showCopiedToast = true;
    setTimeout(() => {
      showCopiedToast = false;
    }, 2500);
  }

  onMount(() => {
    audio.soundEnabled = soundOn;
    if (activeStartTime) {
      currentDuration = Math.max(0, Math.floor((Date.now() - activeStartTime) / 1000));
      startTicker();
    }
    startIntervalTicker();
  });

  onDestroy(() => {
    stopTicker();
    if (intervalTimer) clearInterval(intervalTimer);
  });
</script>

<div class="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#3D3A37] selection:bg-rose-100">
  <!-- Header / Navigation Bar -->
  <header class="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-2xl bg-[#E07A5F] flex items-center justify-center text-white shadow-xs">
        <Waves class="w-4 h-4" />
      </div>
      <div>
        <h1 class="text-lg font-semibold tracking-tight text-stone-800 leading-none">Swell</h1>
        <span class="text-[10px] text-stone-400 font-medium tracking-wide uppercase">Contraction Timer</span>
      </div>
    </div>

    <!-- Action icons -->
    <div class="flex items-center gap-1.5">
      <!-- Sound toggle -->
      <button
        onclick={toggleSound}
        class="p-2 rounded-2xl bg-white/70 border border-stone-200/80 text-stone-600 hover:text-stone-900 transition-colors"
        title={soundOn ? 'Mute soothing chimes' : 'Enable chimes'}
        aria-label="Toggle chime audio"
      >
        {#if soundOn}
          <Volume2 class="w-4 h-4 text-[#52796F]" />
        {:else}
          <VolumeX class="w-4 h-4 text-stone-400" />
        {/if}
      </button>

      <!-- Share / Copy Log -->
      {#if contractions.length > 0}
        <button
          onclick={copySummary}
          class="p-2 rounded-2xl bg-white/70 border border-stone-200/80 text-stone-600 hover:text-stone-900 transition-colors"
          title="Copy log to share with midwife/doctor"
          aria-label="Copy summary"
        >
          <Share2 class="w-4 h-4" />
        </button>
      {/if}

      <!-- Reset session -->
      {#if contractions.length > 0 || isActive}
        <button
          onclick={() => showResetModal = true}
          class="p-2 rounded-2xl bg-white/70 border border-stone-200/80 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Reset session"
          aria-label="Reset session"
        >
          <RotateCcw class="w-4 h-4" />
        </button>
      {/if}
    </div>
  </header>

  <!-- Main Timer & Log Content -->
  <main class="flex-1 flex flex-col items-center justify-center">
    <!-- Big Tap Hero -->
    <TimerHero
      {isActive}
      durationSeconds={currentDuration}
      intervalSeconds={timeSinceLast}
      onToggle={handleToggle}
      onCancel={handleCancel}
    />

    <!-- Rolling Stats Card -->
    <QuickSummary
      {stats}
      totalCount={contractions.length}
      onOpenGuide={() => showGuidelines = true}
    />

    <!-- Contraction History List -->
    <ContractionList
      {contractions}
      onDelete={handleDelete}
      onUpdateIntensity={handleUpdateIntensity}
      onUpdateNotes={handleUpdateNotes}
    />
  </main>

  <!-- Gentle Footer -->
  <footer class="w-full text-center py-6 text-xs text-stone-400 border-t border-[#EBE1D8]/60 bg-[#FAF7F2]">
    <div class="flex items-center justify-center gap-1.5">
      <span>Designed with care for your labor journey</span>
      <span>•</span>
      <button onclick={() => showGuidelines = true} class="hover:text-stone-600 underline">
        Labor Guide
      </button>
    </div>
  </footer>

  <!-- Guidelines Modal -->
  <GuidelinesModal
    open={showGuidelines}
    onclose={() => showGuidelines = false}
  />

  <!-- Explicit Clear Confirmation Modal -->
  {#if showResetModal}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => { if (e.target === e.currentTarget) showResetModal = false; }}
      onkeydown={(e) => { if (e.key === 'Escape') showResetModal = false; }}
    >
      <div class="bg-[#FAF7F2] max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-[#EBE1D8] text-[#3D3A37] text-center">
        <h3 class="text-lg font-semibold text-stone-800">Clear Current Session?</h3>
        <p class="text-xs sm:text-sm text-stone-600 mt-2">
          This will permanently delete all {contractions.length} recorded surges. This action cannot be undone.
        </p>
        <div class="mt-6 flex items-center justify-end gap-2.5">
          <button
            onclick={() => showResetModal = false}
            class="flex-1 py-2.5 px-4 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-medium hover:bg-stone-100 transition-colors"
          >
            Keep Data
          </button>
          <button
            onclick={confirmReset}
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-medium hover:bg-rose-600 transition-colors shadow-xs"
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast Notification -->
  {#if showCopiedToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm animate-bounce">
      Log copied to clipboard to send your doctor or partner!
    </div>
  {/if}
</div>
