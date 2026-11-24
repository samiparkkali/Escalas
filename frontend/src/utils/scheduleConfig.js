import { getNextMonthRange } from './dateUtils';

// Keys match the API's ScheduleConfigModel so the state is posted as-is.
export const initialConfig = () => {
  const { startDate, endDate } = getNextMonthRange();
  return {
    start_date: startDate,
    end_date: endDate,
    morning_weekday_specialist: 1,
    night_weekday_specialist: 1,
    morning_weekend_specialist: 1,
    night_weekend_specialist: 1,

    morning_weekday_intern: 2,
    night_weekday_intern: 2,
    morning_weekend_intern: 2,
    night_weekend_intern: 2,
  };
};

export const restoreConfig = (current, schedule) =>
  schedule?.config ? { ...current, ...schedule.config } : current;
