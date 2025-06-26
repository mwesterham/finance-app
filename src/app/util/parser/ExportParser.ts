import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../components/TransactionTableUploader";

export interface ExportInputRow {
  date: Date;
  amount: number;
  transactionInfo: string;
  source: string;
  category: string;
  providedDetail: string;
}

export default class ExportParser implements IParser<string, ExportInputRow[]> {
  toFinanceRows(input: string): FinanceSheetRow[] {
    const exportInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = exportInputs.map(exportInput => {
      const financeRow: FinanceSheetRow = {
        epoch: exportInput.date.getTime(),
        amount: exportInput.amount,
        source: exportInput.source,
        category: exportInput.category,
        transactionInfo: exportInput.transactionInfo,
        providedDetail: exportInput.providedDetail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): ExportInputRow[] {
    const rows: ExportInputRow[] = [];

    Papa.parse(input, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        Amount: true,
        epoch: true,
      },
      complete: (result: any) => {
        const data = result.data as any[][]; // Data from PapaParse
        data.slice(1).forEach(row => {
          rows.push({
            date: cleanDate(row[1]),
            amount: row[2],
            transactionInfo: row[3],
            source: row[4],
            category: row[5],
            providedDetail: row[6],
          });
        });
      },
      error: (error: any) => {
        console.error("CSV Parsing Error:", error);
      },
    });

    return rows;
  }
}
