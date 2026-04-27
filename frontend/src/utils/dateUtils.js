// Input: "yyyy-mm-dd"
// Output: "dd-mm-yyyy"
export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

// Input: "yyyy-mm-dd" | Date | undefined
// Output: "yyyy-mm-dd"
export const toIsoDate = (date) => {
  if (!date) return null;

  if (typeof date === 'string') return date;

  return date.toISOString().split('T')[0];
};