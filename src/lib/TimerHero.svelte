<script lang="ts">
  import { Play, Square, X } from 'lucide-svelte';
  import { formatDuration } from '../types';

  interface Props {
    isActive: boolean;
    durationSeconds: number;
    intervalSeconds: number | null;
    dimMode: boolean;
    onToggle: () => void;
    onCancel: () => void;
  }

  let { isActive, durationSeconds, intervalSeconds, dimMode, onToggle, onCancel }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-6 sm:py-8">
  <!-- Time since last contraction badge (when not actively contracting) -->
  {#if !isActive && intervalSeconds !== null}
    <div class="mb-6 px-4 py-1.5 rounded-full {dimMode ? 'bg-stone-800/90 text-stone-300 border border-stone-700/60' : 'bg-stone-200/60 text-stone-600'} text-xs font-medium tracking-wide flex items-center gap-1.5 transition-all">
      <span class="w-2 h-2 rounded-full bg-[#52796F] animate-pulse"></span>
      Time since last wave: <span class="font-semibold {dimMode ? 'text-[#FAF7F2]' : 'text-stone-800'}">{formatDuration(intervalSeconds)}</span>
    </div>
  {:else if !isActive}
    <div class="mb-6 px-4 py-1.5 rounded-full bg-transparent {dimMode ? 'text-stone-500' : 'text-stone-400'} text-xs font-medium tracking-wide">
      Ready when you are
    </div>
  {:else}
    <div class="mb-6 px-4 py-1.5 rounded-full {dimMode ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60' : 'bg-rose-100/80 text-[#E07A5F]'} text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all animate-gentle-pulse">
      <span class="w-2 h-2 rounded-full bg-[#E07A5F] animate-ping"></span>
      Surge in progress — Breathe gently
    </div>
  {/if}

  <!-- Main Contraction Button -->
  <div class="relative flex items-center justify-center">
    <!-- Breathing ripple effect when active -->
    {#if isActive}
      <div class="absolute inset-0 rounded-full bg-[#E07A5F]/20 animate-ripple pointer-events-none"></div>
      <div class="absolute -inset-4 rounded-full bg-[#E07A5F]/15 animate-breathe pointer-events-none"></div>
    {/if}

    <button
      onclick={onToggle}
      class="relative z-10 w-64 h-64 sm:w-72 sm:h-72 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 shadow-xl select-none active:scale-95 focus:outline-none {isActive 
        ? 'bg-gradient-to-b from-[#E07A5F] to-[#D05B43] text-white shadow-rose-900/40' 
        : dimMode 
          ? 'bg-[#262320] text-stone-100 border-4 border-stone-800 hover:border-stone-700 shadow-black/40' 
          : 'bg-white text-stone-800 border-4 border-[#F5EFEB] hover:border-[#EBE1D8] shadow-stone-300/40'}"
      aria-label={isActive ? 'Stop Contraction' : 'Start Contraction'}
    >
      {#if isActive}
        <!-- Active contraction state -->
        <div class="flex flex-col items-center justify-center space-y-2">
          <Square class="w-8 h-8 fill-current text-white/90 drop-shadow-xs" />
          <div class="text-4xl sm:text-5xl font-mono font-bold tracking-tight">
            {formatDuration(durationSeconds)}
          </div>
          <span class="text-xs uppercase tracking-widest text-white/80 font-medium">
            Tap when wave ends
          </span>
        </div>
      {:else}
        <!-- Inactive / ready state -->
        <div class="flex flex-col items-center justify-center space-y-2.5">
          <div class="w-14 h-14 rounded-full {dimMode ? 'bg-[#3A2E2B] text-[#E07A5F]' : 'bg-[#FCE8E6] text-[#E07A5F]'} flex items-center justify-center mb-1 transition-colors">
            <Play class="w-6 h-6 fill-current translate-x-0.5" />
          </div>
          <span class="text-xl sm:text-2xl font-semibold tracking-tight {dimMode ? 'text-stone-100' : 'text-stone-800'}">
            Start Surge
          </span>
          <span class="text-xs {dimMode ? 'text-stone-400' : 'text-stone-400'} font-normal px-6 text-center">
            Tap when contraction begins
          </span>
        </div>
      {/if}
    </button>
  </div>

  <!-- Cancel Active Timer Button -->
  {#if isActive}
    <div class="mt-6 flex items-center gap-2">
      <button
        onclick={onCancel}
        class="text-xs {dimMode ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' : 'text-stone-400 hover:text-stone-600 hover:bg-stone-200/50'} px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 cursor-pointer"
      >
        <X class="w-3.5 h-3.5" />
        Discard accidental tap
      </button>
    </div>
  {/if}
</div>
