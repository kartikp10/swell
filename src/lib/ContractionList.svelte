<script lang="ts">
  import { Trash2, Smile, Meh, Frown, MessageSquarePlus, Check } from 'lucide-svelte';
  import { formatTime, formatDuration, formatInterval, type Contraction, type Intensity } from '../types';

  interface Props {
    contractions: Contraction[];
    dimMode: boolean;
    onDelete: (id: string) => void;
    onUpdateIntensity: (id: string, intensity: Intensity) => void;
    onUpdateNotes: (id: string, notes: string) => void;
  }

  let { contractions, dimMode, onDelete, onUpdateIntensity, onUpdateNotes }: Props = $props();

  let editingNotesId = $state<string | null>(null);
  let tempNote = $state('');

  function startEditNotes(item: Contraction) {
    editingNotesId = item.id;
    tempNote = item.notes || '';
  }

  function saveNotes(id: string) {
    onUpdateNotes(id, tempNote.trim().slice(0, 280));
    editingNotesId = null;
  }
</script>

<div class="w-full max-w-xl mx-auto px-4 mt-8 pb-16">
  <div class="flex items-center justify-between mb-4 px-1">
    <h3 class="text-base font-semibold {dimMode ? 'text-stone-200' : 'text-stone-800'} tracking-tight flex items-center gap-2">
      Recorded Surges
      <span class="text-xs font-normal px-2 py-0.5 rounded-full {dimMode ? 'bg-stone-800 text-stone-300' : 'bg-stone-200/70 text-stone-600'}">
        {contractions.length}
      </span>
    </h3>
    <span class="text-xs text-stone-400">Newest first</span>
  </div>

  {#if contractions.length === 0}
    <div class="p-8 text-center rounded-3xl border border-dashed text-stone-400 transition-colors {dimMode ? 'bg-stone-900/60 border-stone-800 text-stone-500' : 'bg-white/50 border-[#EBE1D8]'}">
      <p class="text-sm">No contractions logged yet.</p>
      <p class="text-xs mt-1 text-stone-400/80">Press the large button above when your next wave starts.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each contractions as item, index (item.id)}
        <div class="p-4 rounded-3xl border shadow-xs transition-all text-left group {dimMode ? 'bg-stone-900/90 border-stone-800 hover:border-stone-700' : 'bg-white/80 border-[#EBE1D8] hover:border-stone-300'}">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold {dimMode ? 'text-stone-100' : 'text-stone-800'}">
                  {formatTime(item.startTime)}
                </span>
                {#if index === 0}
                  <span class="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full {dimMode ? 'bg-[#E07A5F]/20 text-[#E07A5F]' : 'bg-[#E07A5F]/15 text-[#E07A5F]'}">
                    Latest
                  </span>
                {/if}
              </div>
              <p class="text-xs text-stone-400 mt-0.5">
                Ended {formatTime(item.endTime)}
              </p>
            </div>

            <!-- Delete action button -->
            <button
              onclick={() => onDelete(item.id)}
              class="min-w-[44px] min-h-[44px] p-2 rounded-xl flex items-center justify-center {dimMode ? 'text-stone-500 hover:text-rose-400 hover:bg-stone-800' : 'text-stone-300 hover:text-rose-500 hover:bg-rose-50'} opacity-80 group-hover:opacity-100 transition-all cursor-pointer"
              title="Delete this entry"
              aria-label="Delete entry"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Duration and Interval Badges -->
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t {dimMode ? 'border-stone-800' : 'border-stone-100'}">
            <div class="{dimMode ? 'bg-stone-800/80' : 'bg-[#FAF7F2]'} p-2.5 rounded-2xl transition-colors">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Duration</span>
              <span class="text-base font-semibold text-[#E07A5F]">{formatDuration(item.durationSeconds)}</span>
            </div>
            <div class="{dimMode ? 'bg-stone-800/80' : 'bg-[#FAF7F2]'} p-2.5 rounded-2xl transition-colors">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Interval</span>
              <span class="text-base font-semibold text-[#52796F]">{formatInterval(item.intervalSeconds)}</span>
            </div>
          </div>

          <!-- Intensity selector & Note snippet -->
          <div class="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2">
            <!-- Intensity Buttons Group -->
            <div role="group" aria-label="Surge intensity" class="flex items-center gap-1 {dimMode ? 'bg-stone-800/80 border-stone-700/60' : 'bg-stone-50 border-stone-100'} p-1 rounded-xl border">
              <button
                onclick={() => onUpdateIntensity(item.id, 'mild')}
                aria-pressed={item.intensity === 'mild'}
                class="min-h-[44px] px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer {item.intensity === 'mild' ? (dimMode ? 'bg-emerald-950 text-emerald-300 font-medium' : 'bg-emerald-100 text-emerald-800 font-medium') : (dimMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-400 hover:text-stone-700')}"
                title="Mild intensity"
                aria-label="Mark intensity as mild"
              >
                <Smile class="w-4 h-4" />
                <span class="text-[11px]">Mild</span>
              </button>

              <button
                onclick={() => onUpdateIntensity(item.id, 'moderate')}
                aria-pressed={item.intensity === 'moderate'}
                class="min-h-[44px] px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer {item.intensity === 'moderate' ? (dimMode ? 'bg-amber-950 text-amber-300 font-medium' : 'bg-amber-100 text-amber-800 font-medium') : (dimMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-400 hover:text-stone-700')}"
                title="Moderate intensity"
                aria-label="Mark intensity as moderate"
              >
                <Meh class="w-4 h-4" />
                <span class="text-[11px]">Moderate</span>
              </button>

              <button
                onclick={() => onUpdateIntensity(item.id, 'strong')}
                aria-pressed={item.intensity === 'strong'}
                class="min-h-[44px] px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer {item.intensity === 'strong' ? (dimMode ? 'bg-rose-950 text-rose-300 font-medium' : 'bg-rose-100 text-rose-800 font-medium') : (dimMode ? 'text-stone-400 hover:text-stone-200' : 'text-stone-400 hover:text-stone-700')}"
                title="Strong intensity"
                aria-label="Mark intensity as strong"
              >
                <Frown class="w-4 h-4" />
                <span class="text-[11px]">Strong</span>
              </button>
            </div>

            <!-- Notes Button -->
            {#if editingNotesId !== item.id}
              <button
                onclick={() => startEditNotes(item)}
                class="min-h-[44px] text-xs {dimMode ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ml-auto cursor-pointer"
                aria-label={item.notes ? 'Edit note for this surge' : 'Add note to this surge'}
              >
                <MessageSquarePlus class="w-4 h-4" />
                <span class="text-[11px]">{item.notes ? 'Edit note' : 'Add note'}</span>
              </button>
            {/if}
          </div>

          <!-- Note text or Editor -->
          {#if editingNotesId === item.id}
            <div class="mt-2 flex items-center gap-1.5">
              <input
                type="text"
                bind:value={tempNote}
                maxlength="280"
                placeholder="e.g. felt in lower back, deep breaths..."
                class="text-xs min-h-[44px] px-3 py-2 rounded-xl border {dimMode ? 'bg-stone-800 text-stone-100 border-stone-700' : 'bg-white text-stone-800 border-stone-200'} flex-1 focus:outline-none focus:border-[#E07A5F]"
                onkeydown={(e) => { if (e.key === 'Enter') saveNotes(item.id); }}
              />
              <button
                onclick={() => saveNotes(item.id)}
                class="min-w-[44px] min-h-[44px] p-2 bg-[#52796F] text-white rounded-xl hover:bg-[#2F3E46] transition-colors cursor-pointer flex items-center justify-center"
                title="Save note"
                aria-label="Save note"
              >
                <Check class="w-4 h-4" />
              </button>
            </div>
          {:else if item.notes}
            <p class="text-xs {dimMode ? 'text-stone-300 bg-stone-800/60 border-stone-700/60' : 'text-stone-600 bg-stone-50/70 border-stone-100'} italic p-2 rounded-xl mt-2 border break-words">
              "{item.notes}"
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
