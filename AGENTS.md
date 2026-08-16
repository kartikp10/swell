# Swell 🌊 - Agent Context

Swell is a simple, soothing, single-button contraction timer designed for laboring mothers and birth partners.

## 🛠️ Stack & Architecture

- **Framework:** Svelte 5 (Runes: `$state`, `$derived`, `$props`, `$effect`) + TypeScript
- **Styling:** Tailwind CSS v4 with custom warm daylight (`#FAF7F2`) and candlelight night mode (`#1A1817`) palettes
- **Toolchain:** Bun + Vite
- **PWA:** Web Manifest (`public/manifest.json`) & Service Worker (`public/sw.js`) for offline iOS/Android home screen install
- **Audio/Haptics:** Web Audio API (432Hz sine-wave chimes in `src/lib/audio.ts`) + `navigator.vibrate`
- **Wake Lock:** Screen Wake Lock API in `src/App.svelte` to prevent display sleep during timing

## 📂 Project Structure

```
src/
├── App.svelte                # Root container, state orchestrator & localStorage sync
├── app.css                   # Tailwind v4 directives & keyframe animations
├── types.ts                  # Type definitions (Contraction, WaterBreakEvent, CSV exporter)
├── vite-env.d.ts             # Vite client type definitions
└── lib/
    ├── audio.ts              # Web Audio chime generator & vibration helper
    ├── BirthAffirmations.svelte # Rotatable hypnobirthing affirmations
    ├── ContractionList.svelte   # History list, intensity selector & notes editor
    ├── GuidelinesModal.svelte   # 5-1-1 labor guidelines & breathing techniques hub
    ├── QuickSummary.svelte      # Rolling stats (avg duration/frequency) & 5-1-1 alert
    ├── SurgeCue.svelte          # 1-liner real-time coaching cue during active timing
    ├── TimerHero.svelte         # Primary surge timer button & active wave animation
    └── WaterBreakCard.svelte    # Water breaking (ROM) timestamp & fluid appearance logger
```

## 🧪 Validation & Conventions

- Run `bun run svelte-check` and `bun run build` before submitting changes.
- Never commit or push directly to remote without explicit user authorization.
- Keep touch targets at minimum 44x44px for labor accessibility.
- Maintain strict low-light WCAG contrast in candlelight night mode (`dimMode`).
