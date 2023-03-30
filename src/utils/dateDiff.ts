const MS_PER_YEAR = 12 * 30 * 24 * 60 * 60 * 1000;
const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MIN = 60 * 1000;

/**
 * Returns a formatted date difference string (e.g. 2 days ago)
 * 
 * `dateA` should come before `dateB` chronologically
 */
export const dateDiff = (dateA: Date, dateB: Date) => {
  // discard time-zone information.
  const utcA = Date.UTC(
    dateA.getFullYear(),
    dateA.getMonth(),
    dateA.getDate(),
    dateA.getHours(),
    dateA.getMinutes()
  );
  const utcB = Date.UTC(
    dateB.getFullYear(),
    dateB.getMonth(),
    dateB.getDate(),
    dateB.getHours(),
    dateB.getMinutes()
  );

  const diff = {
    years: Math.floor((utcB - utcA) / MS_PER_YEAR),
    months: Math.floor((utcB - utcA) / MS_PER_MONTH),
    days: Math.floor((utcB - utcA) / MS_PER_DAY),
    hours: Math.floor((utcB - utcA) / MS_PER_HOUR),
    mins: Math.floor((utcB - utcA) / MS_PER_MIN),
  };

  if (diff.years > 1) return `${diff.years} years ago`;
  if (diff.years > 0) return `${diff.years} year ago`;
  if (diff.months > 1) return `${diff.months} months ago`;
  if (diff.months > 0) return `${diff.months} month ago`;
  if (diff.days > 1) return `${diff.days} days ago`;
  if (diff.days > 0) return `${diff.days} day ago`;
  if (diff.hours > 1) return `${diff.hours} hours ago`;
  if (diff.hours > 0) return `${diff.hours} hour ago`;
  if (diff.mins > 1) return `${diff.mins} minutes ago`;
  if (diff.mins > 0) return `${diff.mins} minute ago`;
  return "just now";
};
