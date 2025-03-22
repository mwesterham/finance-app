const formattedDate = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const customFormatDate = (millis: number) => {
  return formattedDate.format(new Date(millis));
}