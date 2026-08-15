<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Sparkles, Quote } from 'lucide-svelte';

  interface Props {
    dimMode?: boolean;
  }

  let { dimMode = false }: Props = $props();

  const AFFIRMATIONS = [
    "Each wave brings you one step closer to meeting your baby.",
    "Your body knows how to open and birth with strength.",
    "Inhale calm and relaxation, exhale all tension.",
    "Soft jaw, relaxed shoulders, gentle deep breath.",
    "Surrender to each wave, resting completely in between.",
    "You are safe, supported, and surrounded by love.",
    "Your breath is your anchor through every surge.",
    "Trust the natural rhythm of your body.",
    "One wave at a time. You are doing wonderfully."
  ];

  let currentIndex = $state(0);
  let timer: ReturnType<typeof setInterval> | null = null;
  let isTransitioning = $state(false);
  let isClicked = $state(false);

  function nextAffirmation() {
    isClicked = true;
    isTransitioning = true;
    setTimeout(() => {
      currentIndex = (currentIndex + 1) % AFFIRMATIONS.length;
      isTransitioning = false;
      setTimeout(() => {
        isClicked = false;
      }, 300);
    }, 200);
  }

  onMount(() => {
    timer = setInterval(nextAffirmation, 12000); // cycle every 12 seconds
  });

  onDestroy(() => {
    if (timer) clearInterval(timer);
  });
</script>

<div
  class="w-full max-w-lg mx-auto px-4 sm:px-6 py-2 text-center cursor-pointer select-none group"
  onclick={nextAffirmation}
  role="button"
  tabindex="0"
  aria-label="Click for next birth affirmation"
  onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') nextAffirmation(); }}
>
  <div class="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-widest font-medium {dimMode ? 'text-stone-400' : 'text-stone-500'} mb-1.5 transition-colors">
    <Sparkles class="w-3.5 h-3.5 text-[#E07A5F]" />
    <span>Birth Affirmation</span>
    <span class="text-[10px] lowercase text-stone-400 opacity-60 group-hover:opacity-100 transition-opacity">(tap to change)</span>
  </div>

  <div 
    aria-live="polite" 
    aria-atomic="true" 
    class="relative px-6 py-2 transition-transform duration-300 {isClicked ? 'scale-105' : 'scale-100'}"
  >
    <!-- Decorative Opening Quote -->
    <Quote class="w-4 h-4 absolute left-1 top-0 rotate-180 {dimMode ? 'text-[#E07A5F]/60' : 'text-[#E07A5F]/40'} pointer-events-none" />
    
    <p class="text-sm sm:text-base md:text-lg font-serif italic text-[#E07A5F] {dimMode ? 'brightness-110' : ''} font-medium leading-relaxed transition-all duration-300 min-h-[3rem] flex items-center justify-center {isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}">
      “{AFFIRMATIONS[currentIndex]}”
    </p>

    <!-- Decorative Closing Quote -->
    <Quote class="w-4 h-4 absolute right-1 bottom-0 {dimMode ? 'text-[#E07A5F]/60' : 'text-[#E07A5F]/40'} pointer-events-none" />
  </div>
</div>
