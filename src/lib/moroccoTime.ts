const moroccoTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Casablanca',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function getMoroccoMinutes(now = new Date()): number {
  const parts = moroccoTimeFormatter.formatToParts(now);
  const hour = parts.find((part) => part.type === 'hour')?.value;
  const minute = parts.find((part) => part.type === 'minute')?.value;

  if (hour === undefined || minute === undefined) {
    throw new Error('Unable to determine the current time in Morocco.');
  }

  return Number(hour) * 60 + Number(minute);
}
