import { Column } from "@tanstack/react-table";

export const cleanNumber = (str: string): number => {
  return parseFloat(str.replace(/[^0-9.-]/g, "").trim());
}

export const formatVenmoNumber = (str: string): number => {
  const val = parseFloat(str.replace(/[^0-9.-]/g, "").trim());
  return val < 0 ? 0 : val;
};

export const prettyPrintColumnName = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')         // insert space before capital letters
    .replace(/^./, c => c.toUpperCase()) // capitalize the first character
    .trim();                             // remove leading/trailing spaces
};


export const cleanDate = (str: string): Date => {
  // Check if the string matches the ISO 8601 format
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(str)) {
    const date = new Date(str);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Fallback for other date formats (removes unwanted characters)
  const cleanedStr = str.replace(/[^0-9/-]/g, "").trim();
  const date = new Date(cleanedStr);
  date.setHours(0, 0, 0, 0);
  return date;
};


export const cx = (...classNames: any[]) =>
  classNames.filter(Boolean).join(" ");

export const getPossibleValuesFromCol = (column: Column<any>) => {
  return Array.from(column.getFacetedUniqueValues().keys())
    .sort()
    .slice(0, 5000);
}

export const formatAmount = (amount: number) => {
  const formattedNumber = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return amount < 0 ? `($${formattedNumber})` : `$${formattedNumber}`;
};