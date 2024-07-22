export const formatDate = (date: Date, separte: string = '-') => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return separte === '-'
    ? `${day}-${month}-${year}`
    : `${year}-${month}-${day}`;
};

export const differenceBetweenDates = (debut: Date, fin: Date) => {
  const diffTime = Math.abs(debut.getTime() - fin.getTime());
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return days;
};
