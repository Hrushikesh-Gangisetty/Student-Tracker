const DAY = 24 * 60 * 60 * 1000;

// Returns the percentage rounded to one decimal, or null when no classes were held yet.
export function attendancePercent(subject) {
  if (!subject.totalClasses) return null;
  return Math.round((subject.attendedClasses / subject.totalClasses) * 1000) / 10;
}

// Tells the student what the 75% rule means for this subject right now.
// Below 75%:  (a + x) / (t + x) >= 0.75  gives  x >= 3t - 4a  classes to attend in a row.
// At/above:   a / (t + y) >= 0.75        gives  y <= (4a - 3t) / 3  classes that can be missed.
export function attendanceHint(subject) {
  const a = subject.attendedClasses;
  const t = subject.totalClasses;
  if (!t) return '';

  const plural = (n) => (n === 1 ? 'class' : 'classes');

  if (4 * a < 3 * t) {
    const needed = 3 * t - 4 * a;
    return `Attend the next ${needed} ${plural(needed)} to reach 75%`;
  }

  const canMiss = Math.floor((4 * a - 3 * t) / 3);
  if (canMiss === 0) return 'Cannot miss the next class';
  return `Can miss ${canMiss} more ${plural(canMiss)}`;
}

// Deadlines are stored as a plain date (midnight UTC), so we compare calendar days only.
// Returns 'completed', 'overdue', 'soon' (within 2 days) or 'upcoming'.
export function deadlineState(task) {
  if (task.status === 'completed') return 'completed';

  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
  const daysLeft = (Date.parse(task.deadline.slice(0, 10)) - Date.parse(today)) / DAY;

  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 2) return 'soon';
  return 'upcoming';
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
