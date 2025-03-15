const formattedDate = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true, // Use 24-hour format
  timeZoneName: 'short',
});

export const customFormatDate = (millis: number) => {
  return formattedDate.format(new Date(millis));
}