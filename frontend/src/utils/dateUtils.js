export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

export const toIsoDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') return date;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};