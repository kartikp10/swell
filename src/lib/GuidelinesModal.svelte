<script lang="ts">
  import { Sparkles, HeartPulse, ShieldAlert, Wind, X } from 'lucide-svelte';

  interface Props {
    open: boolean;
    dimMode: boolean;
    onclose: () => void;
  }

  let { open = false, dimMode, onclose }: Props = $props();

  let activeTab = $state<'511' | 'breathing'>('511');
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
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Sparkles class="w-5 h-5 text-[#E07A5F]" />
          <h3 class="text-xl font-medium tracking-tight {dimMode ? 'text-stone-100' : 'text-stone-900'}">Labor Companion</h3>
        </div>
        <button 
          onclick={onclose}
          class="p-2 rounded-full {dimMode ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200' : 'hover:bg-[#EBE1D8] text-stone-500 hover:text-stone-800'} transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1 p-1 rounded-2xl mb-5 {dimMode ? 'bg-stone-800/80 border border-stone-700/60' : 'bg-stone-200/60'}">
        <button
          onclick={() => activeTab = '511'}
          class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer {activeTab === '511' 
            ? (dimMode ? 'bg-stone-700 text-stone-100 shadow-xs' : 'bg-white text-stone-900 shadow-xs') 
            : (dimMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')}"
        >
          When to Call (5-1-1)
        </button>
        <button
          onclick={() => activeTab = 'breathing'}
          class="flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 {activeTab === 'breathing' 
            ? (dimMode ? 'bg-stone-700 text-stone-100 shadow-xs' : 'bg-white text-stone-900 shadow-xs') 
            : (dimMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-900')}"
        >
          <Wind class="w-3.5 h-3.5 text-[#E07A5F]" />
          Breathing Techniques
        </button>
      </div>

      {#if activeTab === '511'}
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
      {:else}
        <!-- Breathing Techniques Tab -->
        <div class="space-y-4 text-sm sm:text-base leading-relaxed">
          <div class="p-4 rounded-2xl border {dimMode ? 'bg-stone-800/80 border-stone-700/80 text-stone-300' : 'bg-white/70 border-[#EBE1D8]/80 text-stone-700'}">
            <h4 class="font-semibold {dimMode ? 'text-stone-100' : 'text-stone-900'} mb-1 flex items-center gap-1.5">
              🌬️ Slow Surge Breathing (First Stage)
            </h4>
            <p class="{dimMode ? 'text-stone-400' : 'text-stone-600'} text-xs sm:text-sm mt-1">
              Inhale deeply through your nose for <strong>4 seconds</strong>, expanding your belly. Exhale softly through your mouth for <strong>6 seconds</strong>, letting your body melt down into the surface beneath you.
            </p>
          </div>

          <div class="p-4 rounded-2xl border {dimMode ? 'bg-stone-800/80 border-stone-700/80 text-stone-300' : 'bg-white/70 border-[#EBE1D8]/80 text-stone-700'}">
            <h4 class="font-semibold {dimMode ? 'text-stone-100' : 'text-stone-900'} mb-1 flex items-center gap-1.5">
              🐴 Horse Flutter Lips (Jaw-Pelvis Release)
            </h4>
            <p class="{dimMode ? 'text-stone-400' : 'text-stone-600'} text-xs sm:text-sm mt-1">
              Flutter or vibrate your lips loosely on the exhale (like a horse sigh). A loose, relaxed jaw directly releases the muscles of the pelvic floor.
            </p>
          </div>

          <div class="p-4 rounded-2xl border {dimMode ? 'bg-stone-800/80 border-stone-700/80 text-stone-300' : 'bg-white/70 border-[#EBE1D8]/80 text-stone-700'}">
            <h4 class="font-semibold {dimMode ? 'text-stone-100' : 'text-stone-900'} mb-1 flex items-center gap-1.5">
              ✨ Golden Thread Exhale (Peak Surges)
            </h4>
            <p class="{dimMode ? 'text-stone-400' : 'text-stone-600'} text-xs sm:text-sm mt-1">
              At the peak of a wave, blow out through slightly parted lips. Imagine blowing a fine golden thread long into the room, carrying away intensity.
            </p>
          </div>

          <div class="p-3.5 rounded-2xl border bg-[#E07A5F]/10 border-[#E07A5F]/30 text-left">
            <p class="text-xs {dimMode ? 'text-stone-300' : 'text-stone-700'} font-medium">
              💡 <strong>Birth Partner Tip:</strong> Keep your voice low and slow. Whisper: <em>“Soft jaw, drop your shoulders, blow the wave away.”</em>
            </p>
          </div>
        </div>
      {/if}

      <div class="mt-6">
        <button
          onclick={onclose}
          class="w-full py-3 px-5 rounded-2xl bg-[#E07A5F] hover:bg-[#D05B43] text-white font-medium transition-all shadow-sm active:scale-[0.99] cursor-pointer"
        >
          Got It
        </button>
      </div>
    </div>
  </div>
{/if}
