export const formatDate = (date: Date, separte: string = '-') => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return separte === '-'
    ? `${day}-${month}-${year}`
    : `${year}-${month}-${day}`;
};

export const differenceBetweenDates = (debut: Date, fin: Date) => {
  const includeBegin = new Date(
    Date.UTC(debut.getFullYear(), debut.getMonth(), debut.getDate(), 0, 0, 0),
  );
  includeBegin.setDate(includeBegin.getDate() - 1);
  const diffTime = Math.abs(includeBegin.getTime() - fin.getTime());
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return days;
};

export const getLastDayOfMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  return new Date(Date.UTC(year, month, lastDay.getDate(), 0, 0, 0));
};

export const reduceOneDay = (debut: Date) => {
  const dateToReduceOneDay = new Date(debut);
  const timestamp = dateToReduceOneDay.setDate(
    dateToReduceOneDay.getDate() - 1,
  );
  return new Date(timestamp);
};

export const addOneMonth = (debut: Date) => {
  const dateToAddOneMonth = new Date(debut);
  const timestamp = dateToAddOneMonth.setMonth(
    dateToAddOneMonth.getMonth() + 1,
  );
  return new Date(timestamp);
};
