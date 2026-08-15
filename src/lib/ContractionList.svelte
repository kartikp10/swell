<script lang="ts">
  import { Trash2, Smile, Meh, Frown, MessageSquarePlus, Check } from 'lucide-svelte';
  import { formatTime, formatDuration, formatInterval, type Contraction } from '../types';

  interface Props {
    contractions: Contraction[];
    onDelete: (id: string) => void;
    onUpdateIntensity: (id: string, intensity: 'mild' | 'moderate' | 'strong') => void;
    onUpdateNotes: (id: string, notes: string) => void;
  }

  let { contractions, onDelete, onUpdateIntensity, onUpdateNotes }: Props = $props();

  let editingNotesId = $state<string | null>(null);
  let tempNote = $state('');

  function startEditNotes(item: Contraction) {
    editingNotesId = item.id;
    tempNote = item.notes || '';
  }

  function saveNotes(id: string) {
    onUpdateNotes(id, tempNote.trim());
    editingNotesId = null;
  }
</script>

<div class="w-full max-w-xl mx-auto px-4 mt-8 pb-16">
  <div class="flex items-center justify-between mb-4 px-1">
    <h3 class="text-base font-semibold text-stone-800 tracking-tight flex items-center gap-2">
      Recorded Surges
      <span class="text-xs font-normal px-2 py-0.5 rounded-full bg-stone-200/70 text-stone-600">
        {contractions.length}
      </span>
    </h3>
    <span class="text-xs text-stone-400">Newest first</span>
  </div>

  {#if contractions.length === 0}
    <div class="p-8 text-center bg-white/50 rounded-3xl border border-dashed border-[#EBE1D8] text-stone-400">
      <p class="text-sm">No contractions logged yet.</p>
      <p class="text-xs mt-1 text-stone-400/80">Press the large button above when your next wave starts.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each contractions as item, index (item.id)}
        <div class="p-4 rounded-3xl bg-white/80 border border-[#EBE1D8] shadow-xs hover:border-stone-300 transition-all text-left group">
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-semibold text-stone-800">
                  {formatTime(item.startTime)}
                </span>
                {#if index === 0}
                  <span class="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[#E07A5F]/15 text-[#E07A5F]">
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
              class="p-1.5 rounded-xl text-stone-300 hover:text-rose-500 hover:bg-rose-50 opacity-80 group-hover:opacity-100 transition-all"
              title="Delete this entry"
              aria-label="Delete entry"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>

          <!-- Duration and Interval Badges -->
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-stone-100">
            <div class="bg-[#FAF7F2] p-2.5 rounded-2xl">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Duration</span>
              <span class="text-base font-semibold text-[#E07A5F]">{formatDuration(item.durationSeconds)}</span>
            </div>
            <div class="bg-[#FAF7F2] p-2.5 rounded-2xl">
              <span class="text-[10px] text-stone-400 uppercase tracking-wider block font-medium">Interval</span>
              <span class="text-base font-semibold text-[#52796F]">{formatInterval(item.intervalSeconds)}</span>
            </div>
          </div>

          <!-- Intensity selector & Note snippet -->
          <div class="mt-3 pt-2 flex flex-wrap items-center justify-between gap-2">
            <!-- Intensity Buttons -->
            <div class="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-100">
              <button
                onclick={() => onUpdateIntensity(item.id, 'mild')}
                class="px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all {item.intensity === 'mild' ? 'bg-emerald-100 text-emerald-800 font-medium' : 'text-stone-400 hover:text-stone-700'}"
                title="Mild"
              >
                <Smile class="w-3.5 h-3.5" />
                <span class="text-[11px]">Mild</span>
              </button>

              <button
                onclick={() => onUpdateIntensity(item.id, 'moderate')}
                class="px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all {item.intensity === 'moderate' ? 'bg-amber-100 text-amber-800 font-medium' : 'text-stone-400 hover:text-stone-700'}"
                title="Moderate"
              >
                <Meh class="w-3.5 h-3.5" />
                <span class="text-[11px]">Moderate</span>
              </button>

              <button
                onclick={() => onUpdateIntensity(item.id, 'strong')}
                class="px-2 py-1 rounded-lg text-xs flex items-center gap-1 transition-all {item.intensity === 'strong' ? 'bg-rose-100 text-rose-800 font-medium' : 'text-stone-400 hover:text-stone-700'}"
                title="Strong"
              >
                <Frown class="w-3.5 h-3.5" />
                <span class="text-[11px]">Strong</span>
              </button>
            </div>

            <!-- Notes Button -->
            {#if editingNotesId !== item.id}
              <button
                onclick={() => startEditNotes(item)}
                class="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors ml-auto"
              >
                <MessageSquarePlus class="w-3.5 h-3.5" />
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
                placeholder="e.g. felt in lower back, deep breaths..."
                class="text-xs px-3 py-1.5 rounded-xl border border-stone-200 bg-white flex-1 focus:outline-none focus:border-[#E07A5F]"
                onkeydown={(e) => { if (e.key === 'Enter') saveNotes(item.id); }}
              />
              <button
                onclick={() => saveNotes(item.id)}
                class="p-1.5 bg-[#52796F] text-white rounded-xl hover:bg-[#2F3E46] transition-colors"
                title="Save note"
              >
                <Check class="w-3.5 h-3.5" />
              </button>
            </div>
          {:else if item.notes}
            <p class="text-xs text-stone-600 italic bg-stone-50/70 p-2 rounded-xl mt-2 border border-stone-100">
              "{item.notes}"
            </p>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
