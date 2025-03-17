export const cleanNumber = (str: string): number => {
  return parseFloat(str.replace(/[^0-9.-]/g, "").trim());
}

export const cleanDate = (str: string): Date => {
  const cleanedStr = str.replace(/[^0-9/-]/g, "").trim();
  return new Date(cleanedStr);
};
