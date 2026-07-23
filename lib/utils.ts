export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function formatHours(hours: number): string {
  if (hours >= 1) {
    return `${hours.toFixed(1)}h`;
  }
  return `${Math.round(hours * 60)}m`;
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

export function getExamIcon(examType: string): string {
  const icons: Record<string, string> = {
    JEE: 'graduation-cap',
    NEET: 'stethoscope',
    UPSC: 'landmark',
    SSC: 'briefcase',
    GATE: 'cpu',
    CAT: 'bar-chart',
    Other: 'book-open',
  };
  return icons[examType] || 'book-open';
}

export function getExamColor(examType: string): string {
  const colors: Record<string, string> = {
    JEE: '#2563EB',
    NEET: '#10B981',
    UPSC: '#F59E0B',
    SSC: '#8B5CF6',
    GATE: '#EF4444',
    CAT: '#3B82F6',
    Other: '#64748B',
  };
  return colors[examType] || '#64748B';
}
