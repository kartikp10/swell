export interface Contraction {
  id: string;
  startTime: number; // timestamp in ms
  endTime: number;   // timestamp in ms
  durationSeconds: number; // total duration in seconds
  intervalSeconds?: number; // time in seconds from previous contraction startTime to this contraction startTime
  intensity?: 'mild' | 'moderate' | 'strong';
  notes?: string;
}

export interface RollingStats {
  countLastHour: number;
  avgDurationSeconds: number;
  avgIntervalSeconds: number;
  is511RuleMet: boolean; // 5 mins apart, lasting 1 min, for 1 hour
}

export function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs.toString().padStart(2, '0')}s`;
}

export function formatInterval(seconds?: number): string {
  if (seconds === undefined || seconds === null) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return `${secs}s`;
  }
  return `${mins}m ${secs > 0 ? `${secs}s` : ''}`;
}

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
    .filter((inv): inv is number => typeof inv === 'number' && inv > 0);

  const avgIntervalSeconds = intervals.length > 0
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : 0;

  // 5-1-1 Rule check:
  // - At least ~3-4 contractions in the last hour
  // - Average interval is <= 5 minutes (300 seconds) and >= 2 minutes (120s)
  // - Average duration is >= 45 seconds (approaching ~1 minute)
  const is511RuleMet =
    recentContractions.length >= 4 &&
    avgIntervalSeconds > 0 &&
    avgIntervalSeconds <= 330 && // ~5.5 mins or less
    avgDurationSeconds >= 45;

  return {
    countLastHour: recentContractions.length,
    avgDurationSeconds,
    avgIntervalSeconds,
    is511RuleMet,
  };
}
