export const cleanNumber = (str: string): number => {
  return parseFloat(str.replace(/[^0-9.-]/g, "").trim());
}

export const formatVenmoNumber = (str: string): number => {
  const val = parseFloat(str.replace(/[^0-9.-]/g, "").trim());
  return val < 0 ? 0 : val;
};

export const cleanDate = (str: string): Date => {
  // Check if the string matches the ISO 8601 format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
    return new Date(str);
  }

  // Fallback for other date formats (removes unwanted characters)
  const cleanedStr = str.replace(/[^0-9/-]/g, "").trim();
  return new Date(cleanedStr);
};
