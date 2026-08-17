<script lang="ts">
  import { Droplet, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-svelte';
  import { formatTime, type WaterBreakEvent, type FluidColor, type FluidAmount, type FluidOdor } from '../types';

  interface Props {
    event: WaterBreakEvent | null;
    dimMode: boolean;
    onSave: (event: WaterBreakEvent | null) => void;
  }

  let { event, dimMode, onSave }: Props = $props();

  let isExpanded = $state(false);
  let selectedColor = $state<FluidColor>('clear');
  let selectedAmount = $state<FluidAmount>('moderate');
  let selectedOdor = $state<FluidOdor>('odorless');
  let noteText = $state('');

  function openEditor() {
    selectedColor = event?.color || 'clear';
    selectedAmount = event?.amount || 'moderate';
    selectedOdor = event?.odor || 'odorless';
    noteText = event?.notes || '';
    isExpanded = true;
  }

  function recordWaterBreak() {
    onSave({
      timestamp: event?.timestamp || Date.now(),
      color: selectedColor,
      amount: selectedAmount,
      odor: selectedOdor,
      notes: noteText.trim().slice(0, 280) || undefined,
    });
    isExpanded = false;
  }

  function removeWaterBreak() {
    onSave(null);
    isExpanded = false;
    selectedColor = 'clear';
    selectedAmount = 'moderate';
    selectedOdor = 'odorless';
    noteText = '';
  }
</script>

<div class="w-full max-w-xl mx-auto px-4 mt-4">
  <div class="p-4 rounded-3xl border transition-all {dimMode ? 'bg-stone-900 border-stone-800 text-[#E6DFD5]' : 'bg-white/80 border-[#EBE1D8] text-[#3D3A37]'} shadow-xs">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2.5 text-left">
        <div class="p-2 rounded-2xl {event ? (dimMode ? 'bg-sky-950 text-sky-300 border border-sky-800/60' : 'bg-sky-100 text-sky-700') : (dimMode ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-500')}">
          <Droplet class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs sm:text-sm font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">
            {#if event}
              Water Broke: <span class="{dimMode ? 'text-sky-300' : 'text-sky-600'} font-normal">{formatTime(event.timestamp)}</span>
            {:else}
              Water Breaking (ROM)
            {/if}
          </h4>
          <p class="text-[11px] {dimMode ? 'text-stone-300' : 'text-stone-400'}">
            {#if event}
              <span class="capitalize font-medium {dimMode ? 'text-stone-200' : 'text-stone-600'}">Color: {event.color}</span>
              {#if event.amount}<span> • Amount: {event.amount}</span>{/if}
              {#if event.odor}<span> • Odor: {event.odor}</span>{/if}
              {#if event.notes}<span> • "{event.notes}"</span>{/if}
            {:else}
              Track TACO (Time, Amount, Color, Odor) for your midwife
            {/if}
          </p>
        </div>
      </div>

      <button
        onclick={() => { if (isExpanded) { isExpanded = false; } else { openEditor(); } }}
        aria-expanded={isExpanded}
        class="min-h-[44px] text-xs font-medium px-3 py-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center {event 
          ? (dimMode ? 'border-sky-800/80 text-sky-300 bg-sky-950/80 hover:bg-sky-900/80' : 'border-sky-200 text-sky-700 bg-sky-50 hover:bg-sky-100') 
          : (dimMode ? 'border-stone-700 text-stone-300 bg-stone-800 hover:bg-stone-700' : 'border-stone-200 text-stone-600 hover:bg-stone-100')}"
      >
        <span class="flex items-center gap-1">
          {event ? 'Edit' : 'Log'}
          {#if isExpanded}
            <ChevronUp class="w-3.5 h-3.5" />
          {:else}
            <ChevronDown class="w-3.5 h-3.5" />
          {/if}
        </span>
      </button>
    </div>

    <!-- Expansion form -->
    {#if isExpanded}
      <div class="mt-4 pt-3 border-t {dimMode ? 'border-stone-800' : 'border-stone-100'} space-y-3 text-left">
        <div>
          <span class="block text-[11px] font-medium uppercase tracking-wider {dimMode ? 'text-stone-300' : 'text-stone-400'} mb-1.5">
            Fluid Appearance
          </span>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {#each [
              { key: 'clear', label: 'Clear / Pale', desc: 'Normal' },
              { key: 'pink', label: 'Pink / Bloody', desc: 'Bloody show' },
              { key: 'green', label: 'Green', desc: 'Meconium' },
              { key: 'brown', label: 'Brown / Dark', desc: 'Meconium' },
            ] as opt}
              <button
                onclick={() => selectedColor = opt.key as FluidColor}
                class="min-h-[44px] p-2 rounded-xl text-left border transition-all cursor-pointer {selectedColor === opt.key 
                  ? (dimMode ? 'border-sky-500 bg-sky-950 text-sky-200 font-medium' : 'border-sky-500 bg-sky-50/80 text-sky-900 font-medium') 
                  : (dimMode ? 'border-stone-800 bg-stone-800/80 text-stone-300 hover:bg-stone-800' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50')}"
              >
                <div class="text-xs">{opt.label}</div>
                <div class="text-[10px] {dimMode ? 'text-stone-400' : 'text-stone-400'}">{opt.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Fluid Amount (TACO: Amount) -->
        <div>
          <span class="block text-[11px] font-medium uppercase tracking-wider {dimMode ? 'text-stone-300' : 'text-stone-400'} mb-1.5">
            Amount (Gush or Trickle?)
          </span>
          <div class="grid grid-cols-3 gap-1.5">
            {#each [
              { key: 'trickle', label: 'Trickle', desc: 'Small amount' },
              { key: 'moderate', label: 'Moderate', desc: 'Steady flow' },
              { key: 'gush', label: 'Gush', desc: 'Large amount' },
            ] as opt}
              <button
                onclick={() => selectedAmount = opt.key as FluidAmount}
                class="min-h-[44px] p-2 rounded-xl text-left border transition-all cursor-pointer {selectedAmount === opt.key 
                  ? (dimMode ? 'border-emerald-500 bg-emerald-950 text-emerald-200 font-medium' : 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-medium') 
                  : (dimMode ? 'border-stone-800 bg-stone-800/80 text-stone-300 hover:bg-stone-800' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50')}"
              >
                <div class="text-xs">{opt.label}</div>
                <div class="text-[10px] {dimMode ? 'text-stone-400' : 'text-stone-400'}">{opt.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <!-- Fluid Odor (TACO: Odor) -->
        <div>
          <span class="block text-[11px] font-medium uppercase tracking-wider {dimMode ? 'text-stone-300' : 'text-stone-400'} mb-1.5">
            Odor
          </span>
          <div class="grid grid-cols-2 gap-1.5">
            {#each [
              { key: 'odorless', label: 'Odorless', desc: 'Normal' },
              { key: 'unusual', label: 'Unusual Odor', desc: 'Report to provider' },
            ] as opt}
              <button
                onclick={() => selectedOdor = opt.key as FluidOdor}
                class="min-h-[44px] p-2 rounded-xl text-left border transition-all cursor-pointer {selectedOdor === opt.key 
                  ? (dimMode ? 'border-amber-500 bg-amber-950 text-amber-200 font-medium' : 'border-amber-500 bg-amber-50/80 text-amber-900 font-medium') 
                  : (dimMode ? 'border-stone-800 bg-stone-800/80 text-stone-300 hover:bg-stone-800' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50')}"
              >
                <div class="text-xs">{opt.label}</div>
                <div class="text-[10px] {dimMode ? 'text-stone-400' : 'text-stone-400'}">{opt.desc}</div>
              </button>
            {/each}
          </div>
        </div>

        <div>
          <label for="water-break-notes" class="block text-[11px] font-medium uppercase tracking-wider {dimMode ? 'text-stone-300' : 'text-stone-400'} mb-1">
            Notes / Details
          </label>
          <input
            id="water-break-notes"
            type="text"
            bind:value={noteText}
            placeholder="e.g. big gush while standing, odorless..."
            maxlength="280"
            class="w-full min-h-[44px] text-xs px-3 py-2 rounded-xl border transition-colors {dimMode ? 'bg-stone-800/90 text-stone-100 border-stone-700 placeholder:text-stone-500 focus:border-sky-400' : 'bg-white text-stone-800 border-stone-200 placeholder:text-stone-400 focus:border-sky-500'} focus:outline-none"
          />
        </div>

        <div class="flex items-center justify-between pt-1">
          {#if event}
            <button
              onclick={removeWaterBreak}
              class="min-h-[44px] text-xs text-rose-500 hover:text-rose-400 flex items-center gap-1 cursor-pointer px-2"
            >
              <Trash2 class="w-3.5 h-3.5" /> Remove entry
            </button>
          {:else}
            <div></div>
          {/if}

          <div class="flex items-center gap-2">
            <button
              onclick={() => isExpanded = false}
              class="min-h-[44px] text-xs px-3 py-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center {dimMode ? 'border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200' : 'border-stone-200 text-stone-500 hover:bg-stone-100'}"
            >
              Cancel
            </button>
            <button
              onclick={recordWaterBreak}
              class="min-h-[44px] text-xs px-4 py-2 rounded-xl bg-sky-600 text-white font-medium hover:bg-sky-500 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Check class="w-3.5 h-3.5" /> Save Record
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
