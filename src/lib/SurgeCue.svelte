<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Wind } from 'lucide-svelte';

  interface Props {
    isActive: boolean;
    dimMode: boolean;
  }

  let { isActive, dimMode }: Props = $props();

  const COACHING_CUES = [
    "Soft jaw • Relax shoulders • Deep belly breath",
    "Inhale calm into belly • Slow long exhale",
    "Breathe down through the wave • Unclench hands",
    "Open mouth • Flutter lips • Release tension"
  ];

  let currentIndex = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  $effect(() => {
    if (isActive) {
      currentIndex = 0;
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        currentIndex = (currentIndex + 1) % COACHING_CUES.length;
      }, 7000);
    } else {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

{#if isActive}
  <div role="status" aria-live="polite" class="mt-4 px-4 py-2 rounded-2xl border flex items-center gap-2 transition-all animate-fadeIn {dimMode ? 'bg-stone-900/90 border-stone-800 text-stone-200' : 'bg-white/90 border-[#EBE1D8] text-stone-800'} shadow-xs">
    <Wind class="w-4 h-4 text-[#E07A5F] shrink-0" />
    <p class="text-xs sm:text-sm font-medium tracking-wide">
      {COACHING_CUES[currentIndex]}
    </p>
  </div>
{/if}
