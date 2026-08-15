<script lang="ts">
  import { Clock, Activity, AlertCircle, Heart } from 'lucide-svelte';
  import { formatDuration, formatInterval, type RollingStats } from '../types';

  interface Props {
    stats: RollingStats;
    totalCount: number;
    dimMode: boolean;
    onOpenGuide: () => void;
  }

  let { stats, totalCount, dimMode, onOpenGuide }: Props = $props();
</script>

<div class="w-full max-w-xl mx-auto px-4 mt-6">
  {#if stats.is511RuleMet}
    <div class="mb-4 p-4 rounded-2xl border shadow-sm flex items-start gap-3 transition-all animate-gentle-pulse {dimMode ? 'bg-rose-950/80 border-rose-800/80 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-900'}">
      <div class="p-2 rounded-xl {dimMode ? 'bg-rose-900/80 text-rose-300' : 'bg-rose-100/80 text-rose-600'} shrink-0">
        <AlertCircle class="w-5 h-5" />
      </div>
      <div class="flex-1 text-left">
        <h4 class="font-semibold text-sm sm:text-base">5-1-1 Pattern Detected</h4>
        <p class="text-xs sm:text-sm {dimMode ? 'text-rose-300/90' : 'text-rose-700/90'} mt-0.5">
          Your contractions have been ~5 mins apart, lasting ~1 min over the past hour. You may want to contact your midwife or doctor!
        </p>
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-3 gap-3 backdrop-blur-md p-4 rounded-3xl border shadow-xs transition-colors {dimMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white/70 border-[#EBE1D8]'}">
    <!-- Frequency / Interval -->
    <div class="flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-colors {dimMode ? 'bg-stone-800/80' : 'bg-[#FAF7F2]/80'}">
      <div class="flex items-center gap-1.5 text-stone-500 mb-1">
        <Clock class="w-3.5 h-3.5 text-[#52796F]" />
        <span class="text-[11px] font-medium tracking-wide uppercase">Frequency</span>
      </div>
      <span class="text-xl sm:text-2xl font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">
        {stats.avgIntervalSeconds > 0 ? formatInterval(stats.avgIntervalSeconds) : '—'}
      </span>
      <span class="text-[10px] text-stone-400 mt-0.5">avg apart</span>
    </div>

    <!-- Duration -->
    <div class="flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-colors {dimMode ? 'bg-stone-800/80' : 'bg-[#FAF7F2]/80'}">
      <div class="flex items-center gap-1.5 text-stone-500 mb-1">
        <Activity class="w-3.5 h-3.5 text-[#E07A5F]" />
        <span class="text-[11px] font-medium tracking-wide uppercase">Duration</span>
      </div>
      <span class="text-xl sm:text-2xl font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">
        {stats.avgDurationSeconds > 0 ? formatDuration(stats.avgDurationSeconds) : '—'}
      </span>
      <span class="text-[10px] text-stone-400 mt-0.5">avg length</span>
    </div>

    <!-- Count -->
    <div class="flex flex-col items-center justify-center p-3 rounded-2xl text-center transition-colors {dimMode ? 'bg-stone-800/80' : 'bg-[#FAF7F2]/80'}">
      <div class="flex items-center gap-1.5 text-stone-500 mb-1">
        <Heart class="w-3.5 h-3.5 text-rose-400" />
        <span class="text-[11px] font-medium tracking-wide uppercase">Last Hour</span>
      </div>
      <span class="text-xl sm:text-2xl font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">
        {stats.countLastHour}
      </span>
      <span class="text-[10px] text-stone-400 mt-0.5">
        ({totalCount} total)
      </span>
    </div>
  </div>

  <div class="mt-2 text-right">
    <button
      onclick={onOpenGuide}
      class="text-xs font-medium {dimMode ? 'text-stone-400 hover:text-[#E07A5F]' : 'text-stone-500 hover:text-[#E07A5F]'} underline underline-offset-4 transition-colors cursor-pointer"
    >
      Learn about the 5-1-1 guideline &rarr;
    </button>
  </div>
</div>
