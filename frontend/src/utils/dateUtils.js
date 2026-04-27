export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

export const toIsoDate = (date) => {
  if (!date) return null;
  if (typeof date === 'string') {
    if (date.includes('-') && date.split('-')[0].length === 2) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }
    return date;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getNextMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  return {
    startDate: toIsoDate(new Date(year, month + 1, 1)),
    endDate: toIsoDate(new Date(year, month + 2, 0)),
  };
};