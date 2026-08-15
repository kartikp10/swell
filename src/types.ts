export type Intensity = 'mild' | 'moderate' | 'strong';

export interface Contraction {
  id: string;
  startTime: number; // timestamp in ms
  endTime: number;   // timestamp in ms
  durationSeconds: number; // total duration in seconds
  intervalSeconds?: number; // time in seconds from previous contraction startTime to this contraction startTime
  intensity?: Intensity;
  notes?: string;
}

export interface RollingStats {
  countLastHour: number;
  avgDurationSeconds: number;
  avgIntervalSeconds: number;
  is511RuleMet: boolean; // 5 mins apart, lasting 1 min, for 1 hour
}

// Format timestamp to localized readable time string
export function formatTime(timestamp: number): string {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return '—';
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Format duration in seconds to "Xs" or "Xm Ys"
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0s';
  const rounded = Math.floor(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

// Format interval between contractions
export function formatInterval(seconds?: number): string {
  if (seconds === undefined || seconds === null || !Number.isFinite(seconds) || seconds <= 0) {
    return '—';
  }
  const rounded = Math.floor(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
}

// Safe deserialization and validation of stored contractions
export function parseStoredContractions(raw: unknown): Contraction[] {
  if (!Array.isArray(raw)) return [];
  
  const valid: Contraction[] = [];
  for (const item of raw) {
    if (
      typeof item === 'object' &&
      item !== null &&
      typeof item.id === 'string' &&
      typeof item.startTime === 'number' &&
      Number.isFinite(item.startTime) &&
      typeof item.endTime === 'number' &&
      Number.isFinite(item.endTime) &&
      typeof item.durationSeconds === 'number' &&
      Number.isFinite(item.durationSeconds) &&
      item.durationSeconds > 0
    ) {
      const validIntensity: Intensity | undefined = 
        item.intensity === 'mild' || item.intensity === 'moderate' || item.intensity === 'strong'
          ? item.intensity
          : undefined;

      const validNotes = typeof item.notes === 'string' ? item.notes.slice(0, 280) : undefined;
      const validInterval = typeof item.intervalSeconds === 'number' && Number.isFinite(item.intervalSeconds) && item.intervalSeconds > 0
        ? item.intervalSeconds
        : undefined;

      valid.push({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        durationSeconds: Math.max(1, Math.round(item.durationSeconds)),
        intervalSeconds: validInterval,
        intensity: validIntensity,
        notes: validNotes,
      });
    }
  }

  // Sort newest first
  return valid.sort((a, b) => b.startTime - a.startTime);
}

// Compute statistics across the past hour or recent dataset
export function calculateStats(contractions: Contraction[]): RollingStats {
  if (contractions.length === 0) {
    return {
      countLastHour: 0,
      avgDurationSeconds: 0,
      avgIntervalSeconds: 0,
      is511RuleMet: false,
    };
  }

  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  
  // Contractions within the last hour
  const recentContractions = contractions.filter(c => c.startTime >= oneHourAgo);
  const dataset = recentContractions.length >= 2 ? recentContractions : contractions.slice(0, 5);

  const totalDuration = dataset.reduce((sum, c) => sum + c.durationSeconds, 0);
  const avgDurationSeconds = Math.round(totalDuration / dataset.length);

  const intervals = dataset
    .map(c => c.intervalSeconds)
    .filter((inv): inv is number => typeof inv === 'number' && Number.isFinite(inv) && inv > 0);

  const avgIntervalSeconds = intervals.length > 0
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : 0;

  // 5-1-1 Rule check:
  // - At least 4 contractions in the last hour
  // - Average interval is between 2 minutes and 5.5 minutes
  // - Average duration is at least 45 seconds (approaching ~1 minute)
  const is511RuleMet =
    recentContractions.length >= 4 &&
    avgIntervalSeconds > 0 &&
    avgIntervalSeconds <= 330 &&
    avgIntervalSeconds >= 120 &&
    avgDurationSeconds >= 45;

  return {
    countLastHour: recentContractions.length,
    avgDurationSeconds,
    avgIntervalSeconds,
    is511RuleMet,
  };
}
