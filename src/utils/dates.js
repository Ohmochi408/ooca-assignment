// Local-calendar helpers. Dates are passed around as "YYYY-MM-DD" keys.
const pad = (n) => String(n).padStart(2, '0');

export const dateKey = (d = new Date()) => {
  const x = d instanceof Date ? d : new Date(d);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

export const fromKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (key, n) => {
  const d = fromKey(key);
  d.setDate(d.getDate() + n);
  return dateKey(d);
};

export const formatLongDate = (key) => fromKey(key).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
