export const buildVersion = () => {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1, 0,0,0,0);
  const lastYearDigit = `${now.getFullYear()}`.slice(-1);
  const minutesSinceNewYear = Math.floor((now.getTime() - yearStart.getTime()) / 1000 / 60).toString();
  const maxMinSinceYearStart = (60 * 24 * 366).toString();
  return lastYearDigit+minutesSinceNewYear.padStart(maxMinSinceYearStart.length, '0');
}

export const getBuildVersion = (version: string) => [version, buildVersion()].join('.')
