<script lang="ts">
  import { Sparkles, HeartPulse, ShieldAlert, X } from 'lucide-svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
  }

  let { open = false, onclose }: Props = $props();
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    onclick={(e) => { if (e.target === e.currentTarget) onclose(); }}
    onkeydown={(e) => { if (e.key === 'Escape') onclose(); }}
  >
    <div class="bg-[#FAF7F2] max-w-md w-full rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EBE1D8] text-[#3D3A37] max-h-[90vh] overflow-y-auto">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-[#E07A5F]" />
          <h3 class="text-xl font-medium tracking-tight">When to Call or Go</h3>
        </div>
        <button 
          onclick={onclose}
          class="p-2 rounded-full hover:bg-[#EBE1D8] transition-colors text-stone-500 hover:text-stone-800"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-4 text-sm sm:text-base leading-relaxed text-stone-700">
        <!-- 5-1-1 Rule Explained -->
        <div class="p-4 bg-white/70 rounded-2xl border border-[#EBE1D8]/80">
          <h4 class="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
            <HeartPulse class="w-4 h-4 text-[#E07A5F]" /> The 5-1-1 Rule
          </h4>
          <p class="text-stone-600 text-sm">
            For many first-time mothers, a common rule of thumb to head to the birth center or hospital is when contractions are:
          </p>
          <ul class="list-disc list-inside mt-2 space-y-1 text-sm text-stone-800 font-medium">
            <li><strong>5 minutes</strong> apart (from start to start)</li>
            <li>Lasting at least <strong>1 minute</strong> (60 seconds)</li>
            <li>Continuing steadily for <strong>1 hour</strong></li>
          </ul>
        </div>

        <!-- 4-1-1 / Second Baby -->
        <div class="p-4 bg-white/70 rounded-2xl border border-[#EBE1D8]/80">
          <h4 class="font-semibold text-stone-900 mb-1">Second or Subsequent Babies?</h4>
          <p class="text-stone-600 text-sm">
            Labor often progresses faster. Many providers recommend calling at <strong>4-1-1</strong> or <strong>5-1-1</strong>, or whenever contractions demand full focus and breathing through.
          </p>
        </div>

        <!-- Red Flags -->
        <div class="p-4 bg-rose-50/80 rounded-2xl border border-rose-200">
          <h4 class="font-semibold text-rose-950 mb-1 flex items-center gap-1.5">
            <ShieldAlert class="w-4 h-4 text-rose-600" /> When to Call Immediately
          </h4>
          <ul class="list-disc list-inside space-y-1 text-xs sm:text-sm text-rose-900">
            <li>Your water breaks with green/brown fluid</li>
            <li>Bright red vaginal bleeding</li>
            <li>Sudden severe or constant abdominal pain</li>
            <li>Noticeable decrease in baby's movement</li>
            <li>You feel you need urgent medical attention</li>
          </ul>
        </div>

        <p class="text-xs text-stone-400 text-center italic mt-4">
          Always follow specific instructions provided by your midwife or OB-GYN.
        </p>
      </div>

      <div class="mt-6">
        <button
          onclick={onclose}
          class="w-full py-3 px-5 rounded-2xl bg-[#E07A5F] hover:bg-[#D05B43] text-white font-medium transition-all shadow-sm active:scale-[0.99]"
        >
          Understood
        </button>
      </div>
    </div>
  </div>
{/if}
