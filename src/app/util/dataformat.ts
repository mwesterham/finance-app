import { FinanceSheetRow } from "../../db/WesterhamDatabase";
import { customFormatDate } from "./time";

export const formatDataTableRows = (rows: FinanceSheetRow[]): any[][] => {
  return rows.map((row) => {
    return [
      customFormatDate(row.epoch),
      row.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      row.transactionInfo,
      row.source,
      row.category ?? "",
      row.providedDetail ?? "",
    ]
  });
};

export interface PivotTableRow {
  year: number;
  month: number;
  day: number;
  amount: number;
  transactionInfo: string;
  source: string;
  category: string;
  providedDetail: string;
}

export const formatPivotTableRows = (rows: FinanceSheetRow[]): PivotTableRow[] => {
  return rows.map((row) => {
    const thisDate = new Date(row.epoch);
    return {
      year: thisDate.getFullYear(),
      month: thisDate.getMonth() + 1,
      day: thisDate.getDate(),
      amount: row.amount,
      transactionInfo: row.transactionInfo,
      source: row.source,
      category: row.category ?? "",
      providedDetail: row.providedDetail ?? "",
    } as PivotTableRow
  });
};