export const formatDisplayDate = (isoDate) => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

// Uses local calendar fields; toISOString would shift the day across time zones.
export const formatIsoDate = (date) => {
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
    startDate: formatIsoDate(new Date(year, month + 1, 1)),
    endDate: formatIsoDate(new Date(year, month + 2, 0)),
  };
};
