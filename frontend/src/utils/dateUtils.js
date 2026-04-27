import { format } from 'date-fns';

export const formatDisplayDate = (value) => {
  if (!value) return '';
  return format(new Date(value), 'dd-MM-yyyy');
};

export const toIsoDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};