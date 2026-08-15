<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Wind } from 'lucide-svelte';

  interface Props {
    isActive: boolean;
  }

  let { isActive }: Props = $props();

  let phase = $state<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  let cycleTimer: ReturnType<typeof setInterval> | null = null;
  let secondsInCycle = $state(0);

  // 4s Inhale, 2s Hold, 4s Exhale, 2s Rest (12s cycle - gentle calming surge breathing)
  function updateBreathPhase(sec: number) {
    const mod = sec % 12;
    if (mod < 4) {
      phase = 'Inhale';
    } else if (mod < 6) {
      phase = 'Hold';
    } else if (mod < 10) {
      phase = 'Exhale';
    } else {
      phase = 'Rest';
    }
  }

  $effect(() => {
    if (isActive) {
      secondsInCycle = 0;
      updateBreathPhase(0);
      if (cycleTimer) clearInterval(cycleTimer);
      cycleTimer = setInterval(() => {
        secondsInCycle += 1;
        updateBreathPhase(secondsInCycle);
      }, 1000);
    } else {
      if (cycleTimer) {
        clearInterval(cycleTimer);
        cycleTimer = null;
      }
      secondsInCycle = 0;
    }
  });

  onDestroy(() => {
    if (cycleTimer) clearInterval(cycleTimer);
  });
</script>

{#if isActive}
  <div class="flex items-center justify-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-white/60 dark:bg-stone-800/60 border border-stone-200/80 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 shadow-xs transition-all">
    <Wind class="w-3.5 h-3.5 text-[#E07A5F] {phase === 'Inhale' ? 'animate-pulse' : ''}" />
    <span class="text-xs font-medium tracking-wide">
      Breathing rhythm: <span class="font-semibold text-[#E07A5F]">{phase}</span>
      <span class="text-[10px] text-stone-400 dark:text-stone-500 ml-1">
        {#if phase === 'Inhale'}
          (fill your belly)
        {:else if phase === 'Hold'}
          (soft jaw)
        {:else if phase === 'Exhale'}
          (slow release)
        {:else}
          (relax shoulders)
        {/if}
      </span>
    </span>
  </div>
{/if}
