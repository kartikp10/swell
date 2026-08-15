<script lang="ts">
  import { Sparkles, HeartPulse, ShieldAlert, X } from 'lucide-svelte';

  interface Props {
    open: boolean;
    dimMode: boolean;
    onclose: () => void;
  }

  let { open = false, dimMode, onclose }: Props = $props();
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
    onkeydown={(e) => { if (e.key === 'Escape') onclose(); }}
  >
    <div class="{dimMode ? 'bg-stone-900 border-stone-800 text-[#E6DFD5]' : 'bg-[#FAF7F2] border-[#EBE1D8] text-[#3D3A37]'} max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-[#E07A5F]" />
          <h3 class="text-xl font-medium tracking-tight {dimMode ? 'text-stone-100' : 'text-stone-900'}">When to Call or Go</h3>
        </div>
        <button 
          onclick={onclose}
          class="p-2 rounded-full {dimMode ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200' : 'hover:bg-[#EBE1D8] text-stone-500 hover:text-stone-800'} transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4 text-sm sm:text-base leading-relaxed">
        <!-- 5-1-1 Rule Explained -->
        <div class="p-4 rounded-2xl border {dimMode ? 'bg-stone-800/80 border-stone-700/80 text-stone-300' : 'bg-white/70 border-[#EBE1D8]/80 text-stone-700'}">
          <h4 class="font-semibold {dimMode ? 'text-stone-100' : 'text-stone-900'} mb-1 flex items-center gap-1.5">
            <HeartPulse class="w-4 h-4 text-[#E07A5F]" /> The 5-1-1 Rule
          </h4>
          <p class="{dimMode ? 'text-stone-400' : 'text-stone-600'} text-sm">
            For many first-time mothers, a common rule of thumb to head to the birth center or hospital is when contractions are:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-sm {dimMode ? 'text-stone-200' : 'text-stone-800'} font-medium">
            <li><strong>5 minutes</strong> apart (from start to start)</li>
            <li>Lasting at least <strong>1 minute</strong> (60 seconds)</li>
            <li>Continuing steadily for <strong>1 hour</strong></li>
          </ul>
        </div>

        <!-- 4-1-1 / Second Baby -->
        <div class="p-4 rounded-2xl border {dimMode ? 'bg-stone-800/80 border-stone-700/80 text-stone-300' : 'bg-white/70 border-[#EBE1D8]/80 text-stone-700'}">
          <h4 class="font-semibold {dimMode ? 'text-stone-100' : 'text-stone-900'} mb-1">Second or Subsequent Babies?</h4>
          <p class="{dimMode ? 'text-stone-400' : 'text-stone-600'} text-sm">
            Labor often progresses faster. Many providers recommend calling at <strong>4-1-1</strong> or <strong>5-1-1</strong>, or whenever contractions demand full focus and breathing through.
          </p>
        </div>

        <!-- Red Flags -->
        <div class="p-4 rounded-2xl border {dimMode ? 'bg-rose-950/70 border-rose-900/80' : 'bg-rose-50/80 border-rose-200'}">
          <h4 class="font-semibold {dimMode ? 'text-rose-300' : 'text-rose-950'} mb-1 flex items-center gap-1.5">
            <ShieldAlert class="w-4 h-4 text-rose-500" /> When to Call Immediately
          </h4>
          <ul class="list-disc list-inside space-y-1 text-xs sm:text-sm {dimMode ? 'text-rose-200' : 'text-rose-900'}">
            <li>Your water breaks with green/brown fluid</li>
            <li>Bright red vaginal bleeding</li>
            <li>Sudden severe or constant abdominal pain</li>
            <li>Noticeable decrease in baby's movement</li>
            <li>You feel you need urgent medical attention</li>
          </ul>
        </div>

        <p class="text-xs {dimMode ? 'text-stone-500' : 'text-stone-400'} text-center italic mt-4">
          Always follow specific instructions provided by your midwife or OB-GYN.
        </p>
      </div>

      <div class="mt-6">
        <button
          onclick={onclose}
          class="w-full py-3 px-5 rounded-2xl bg-[#E07A5F] hover:bg-[#D05B43] text-white font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          Understood
        </button>
      </div>
    </div>
  </div>
{/if}
