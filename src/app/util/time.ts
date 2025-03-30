const formattedDate = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const customFormatDate = (millis: number) => {
  return formattedDate.format(new Date(millis));
}

export const epochToDateStr = (epoch: number): string => {
  const date = new Date(epoch);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};