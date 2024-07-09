export const formatDate = (originalDateString: string) => {
  const dateObject = new Date(originalDateString);
  const formattedDateString = `${
    dateObject.getDate() < 10
      ? `0${dateObject.getDate()}`
      : dateObject.getDate()
  }-${dateObject.getMonth() + 1}-${dateObject.getFullYear()}`;
  return formattedDateString;
};
export const todayDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
