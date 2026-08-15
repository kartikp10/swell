<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Volume2, VolumeX, RotateCcw, Share2, Waves, Moon, Sun, Download } from 'lucide-svelte';
  import TimerHero from './lib/TimerHero.svelte';
  import QuickSummary from './lib/QuickSummary.svelte';
  import ContractionList from './lib/ContractionList.svelte';
  import GuidelinesModal from './lib/GuidelinesModal.svelte';
  import WaterBreakCard from './lib/WaterBreakCard.svelte';
  import BirthAffirmations from './lib/BirthAffirmations.svelte';
  import { calculateStats, parseStoredContractions, generateCSVReport, type Contraction, type Intensity, type WaterBreakEvent } from './types';
  import { audio } from './lib/audio';

  const STORAGE_KEY = 'swell_contractions';
  const ACTIVE_KEY = 'swell_active_timer';
  const SOUND_KEY = 'swell_sound_pref';
  const DIM_KEY = 'swell_dim_pref';
  const WATER_KEY = 'swell_water_break';

  // Safe State initialization from localStorage
  function getStoredContractions(): Contraction[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parseStoredContractions(parsed);
    } catch {
      return [];
    }
  }

  function getStoredWaterBreak(): WaterBreakEvent | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(WATER_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && parsed && typeof parsed.timestamp === 'number') {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  function getStoredActiveTime(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(ACTIVE_KEY);
      if (!data) return null;
      const num = Number(data);
      if (Number.isFinite(num) && num > 0 && num <= Date.now()) {
        if (Date.now() - num < 30 * 60 * 1000) {
          return num;
        }
      }
      return null;
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

  function getStoredDimPref(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const data = localStorage.getItem(DIM_KEY);
      return data === 'true';
    } catch {
      return false;
    }
  }

  // Core state (persisted across refreshes)
  let contractions = $state<Contraction[]>(getStoredContractions());
  let waterBreak = $state<WaterBreakEvent | null>(getStoredWaterBreak());
  let activeStartTime = $state<number | null>(getStoredActiveTime());
  const isActive = $derived(activeStartTime !== null);
  let currentDuration = $state<number>(0);
  let timeSinceLast = $state<number | null>(null);
  
  // App UI state
  let showGuidelines = $state<boolean>(false);
  let soundOn = $state<boolean>(getStoredSoundPref());
  let dimMode = $state<boolean>(getStoredDimPref());
  let showCopiedToast = $state<boolean>(false);
  let toastMessage = $state<string>('');
  let showResetModal = $state<boolean>(false);

  let timerInterval: ReturnType<typeof setInterval> | null = null;
  let intervalTimer: ReturnType<typeof setInterval> | null = null;
  let wakeLockSentinel: WakeLockSentinel | null = null;

  // Sync state to localStorage safely whenever it changes
  $effect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contractions));
    } catch {
      // ignore
    }
  });

  $effect(() => {
    try {
      if (waterBreak) {
        localStorage.setItem(WATER_KEY, JSON.stringify(waterBreak));
      } else {
        localStorage.removeItem(WATER_KEY);
      }
    } catch {
      // ignore
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
      // ignore
    }
  });

  $effect(() => {
    try {
      localStorage.setItem(SOUND_KEY, String(soundOn));
      audio.soundEnabled = soundOn;
    } catch {
      // ignore
    }
  });

  $effect(() => {
    try {
      localStorage.setItem(DIM_KEY, String(dimMode));
      if (typeof document !== 'undefined') {
        if (dimMode) {
          document.body.classList.add('dim-mode');
        } else {
          document.body.classList.remove('dim-mode');
        }
      }
    } catch {
      // ignore
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

  // Request screen wake lock so display doesn't sleep while timing
  async function requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !wakeLockSentinel) {
      try {
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', () => {
          wakeLockSentinel = null;
        });
      } catch {
        // WakeLock request rejected or unsupported
      }
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
      requestWakeLock();
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

      const id = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const newContraction: Contraction = {
        id,
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

  function handleUpdateIntensity(id: string, intensity: Intensity) {
    contractions = contractions.map(c => c.id === id ? { ...c, intensity } : c);
  }

  function handleUpdateNotes(id: string, notes: string) {
    contractions = contractions.map(c => c.id === id ? { ...c, notes } : c);
  }

  // Explicit user confirmation to clear session
  function confirmReset() {
    handleCancel();
    contractions = [];
    waterBreak = null;
    timeSinceLast = null;
    showResetModal = false;
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACTIVE_KEY);
      localStorage.removeItem(WATER_KEY);
    } catch {
      // ignore
    }
  }

  function toggleSound() {
    soundOn = !soundOn;
  }

  function toggleDim() {
    dimMode = !dimMode;
  }

  function triggerToast(msg: string) {
    toastMessage = msg;
    showCopiedToast = true;
    setTimeout(() => {
      showCopiedToast = false;
    }, 2500);
  }

  async function copySummary() {
    if (contractions.length === 0 && !waterBreak) return;
    
    const lines = [
      `Swell Contraction Log (${new Date().toLocaleDateString()})`,
      waterBreak ? `Water Break: ${new Date(waterBreak.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} (${waterBreak.color})` : '',
      `Total Contractions Logged: ${contractions.length}`,
      `Last Hour: ${stats.countLastHour} contractions | Avg Dur: ${stats.avgDurationSeconds}s | Avg Int: ${Math.round(stats.avgIntervalSeconds / 60)}m`,
      '',
      ...contractions.map((c, i) => {
        const time = new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const intStr = c.intervalSeconds ? `Every ${Math.round(c.intervalSeconds / 60)}m` : 'First';
        const notesStr = c.notes ? ` (${c.notes})` : '';
        const intensityStr = c.intensity ? ` [${c.intensity}]` : '';
        return `#${contractions.length - i}: ${time} - ${c.durationSeconds}s duration - ${intStr}${intensityStr}${notesStr}`;
      })
    ].filter(Boolean);

    const textToCopy = lines.join('\n');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      triggerToast('Log copied to clipboard!');
    } catch {
      // fallback
    }
  }

  function downloadCSV() {
    if (contractions.length === 0 && !waterBreak) return;
    const csvContent = generateCSVReport(contractions, waterBreak);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `swell-contractions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast('Report downloaded!');
  }

  onMount(() => {
    audio.soundEnabled = soundOn;
    if (dimMode && typeof document !== 'undefined') {
      document.body.classList.add('dim-mode');
    }
    if (activeStartTime) {
      currentDuration = Math.max(0, Math.floor((Date.now() - activeStartTime) / 1000));
      startTicker();
    }
    startIntervalTicker();
  });

  onDestroy(() => {
    stopTicker();
    if (intervalTimer) clearInterval(intervalTimer);
    if (wakeLockSentinel) {
      try {
        wakeLockSentinel.release();
      } catch {
        // ignore
      }
    }
  });
</script>

<div class="min-h-screen flex flex-col justify-between transition-colors duration-400 {dimMode ? 'bg-[#1A1817] text-[#E6DFD5]' : 'bg-[#FAF7F2] text-[#3D3A37]'} selection:bg-rose-100">
  <!-- Header / Navigation Bar -->
  <header class="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-2xl bg-[#E07A5F] flex items-center justify-center text-white shadow-xs">
        <Waves class="w-4 h-4" />
      </div>
      <div>
        <h1 class="text-lg font-semibold tracking-tight {dimMode ? 'text-[#FAF7F2]' : 'text-stone-800'} leading-none">Swell</h1>
        <span class="text-[10px] {dimMode ? 'text-stone-300' : 'text-stone-400'} font-medium tracking-wide uppercase">Contraction Timer</span>
      </div>
    </div>

    <!-- Action icons -->
    <div class="flex items-center gap-1.5">
      <!-- Dim / Candlelight Mode Toggle -->
      <button
        onclick={toggleDim}
        class="min-w-[44px] min-h-[44px] p-2 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-stone-700' : 'bg-white/70 border-stone-200/80 text-stone-600 hover:text-stone-900'}"
        title={dimMode ? 'Switch to daylight theme' : 'Switch to candlelight night mode'}
        aria-label="Toggle dim mode"
      >
        {#if dimMode}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </button>

      <!-- Sound toggle -->
      <button
        onclick={toggleSound}
        class="min-w-[44px] min-h-[44px] p-2 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white/70 border-stone-200/80 text-stone-600 hover:text-stone-900'}"
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
      {#if contractions.length > 0 || waterBreak}
        <button
          onclick={copySummary}
          class="min-w-[44px] min-h-[44px] p-2 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white/70 border-stone-200/80 text-stone-600 hover:text-stone-900'}"
          title="Copy log to share with midwife/doctor"
          aria-label="Copy summary"
        >
          <Share2 class="w-4 h-4" />
        </button>

        <button
          onclick={downloadCSV}
          class="min-w-[44px] min-h-[44px] p-2 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700' : 'bg-white/70 border-stone-200/80 text-stone-600 hover:text-stone-900'}"
          title="Download CSV spreadsheet report"
          aria-label="Download CSV"
        >
          <Download class="w-4 h-4" />
        </button>
      {/if}

      <!-- Reset session -->
      {#if contractions.length > 0 || isActive || waterBreak}
        <button
          onclick={() => showResetModal = true}
          class="min-w-[44px] min-h-[44px] p-2 rounded-2xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'bg-stone-800 border-stone-700 text-stone-400 hover:text-rose-400' : 'bg-white/70 border-stone-200/80 text-stone-400 hover:text-rose-600 hover:bg-rose-50'}"
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
      {dimMode}
      onToggle={handleToggle}
      onCancel={handleCancel}
    />

    <!-- Birth Affirmations -->
    {#if !isActive}
      <BirthAffirmations {dimMode} />
    {/if}

    <!-- Rolling Stats Card -->
    <QuickSummary
      {stats}
      totalCount={contractions.length}
      {dimMode}
      onOpenGuide={() => showGuidelines = true}
    />

    <!-- Water Breaking Tracker -->
    <WaterBreakCard
      event={waterBreak}
      {dimMode}
      onSave={(val) => waterBreak = val}
    />

    <!-- Contraction History List -->
    <ContractionList
      {contractions}
      {dimMode}
      onDelete={handleDelete}
      onUpdateIntensity={handleUpdateIntensity}
      onUpdateNotes={handleUpdateNotes}
    />
  </main>

  <!-- Gentle Footer -->
  <footer class="w-full text-center py-6 text-xs {dimMode ? 'text-stone-500 border-stone-800 bg-[#1A1817]' : 'text-stone-400 border-[#EBE1D8]/60 bg-[#FAF7F2]'} border-t">
    <div class="flex items-center justify-center gap-1.5">
      <span>Designed with care for your labor journey</span>
      <span>•</span>
      <button onclick={() => showGuidelines = true} class="hover:underline cursor-pointer">
        Labor Guide
      </button>
    </div>
  </footer>

  <!-- Guidelines Modal -->
  <GuidelinesModal
    open={showGuidelines}
    {dimMode}
    onclose={() => showGuidelines = false}
  />

  <!-- Explicit Clear Confirmation Modal -->
  {#if showResetModal}
    <div 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      onclick={(e) => { if (e.target === e.currentTarget) showResetModal = false; }}
      onkeydown={(e) => { if (e.key === 'Escape') showResetModal = false; }}
    >
      <div class="{dimMode ? 'bg-stone-900 border-stone-800 text-[#E6DFD5]' : 'bg-[#FAF7F2] border-[#EBE1D8] text-[#3D3A37]'} max-w-sm w-full rounded-3xl p-6 shadow-2xl border text-center">
        <h3 class="text-lg font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">Clear Current Session?</h3>
        <p class="text-xs sm:text-sm {dimMode ? 'text-stone-400' : 'text-stone-600'} mt-2">
          This will permanently delete all recorded surges and notes. This action cannot be undone.
        </p>
        <div class="mt-6 flex items-center justify-end gap-2.5">
          <button
            onclick={() => showResetModal = false}
            class="flex-1 py-2.5 px-4 rounded-xl border {dimMode ? 'border-stone-700 text-stone-300 hover:bg-stone-800' : 'border-stone-300 text-stone-700 hover:bg-stone-100'} text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            Keep Data
          </button>
          <button
            onclick={confirmReset}
            class="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white text-xs sm:text-sm font-medium hover:bg-rose-600 transition-colors shadow-xs cursor-pointer"
          >
            Yes, Clear All
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Toast Notification -->
  {#if showCopiedToast}
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs px-4 py-2.5 rounded-full shadow-lg backdrop-blur-sm">
      {toastMessage}
    </div>
  {/if}
</div>
