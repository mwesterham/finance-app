import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../components/MultiFileUploader";

export interface MatthewSnapshotRow {
  date: Date;
  amount: number;
  category: string;
  userDetail: string;
  transactionNotes: string;
}

export interface MatthewSnapshotParserInput {
  text: string;
  label: InputFileLabel;
}

export default class MatthewSnapshotParser implements IParser<MatthewSnapshotParserInput, MatthewSnapshotRow[]> {
  toFinanceRows(input: MatthewSnapshotParserInput): FinanceSheetRow[] {
    const rows = this.parse(input);
    const financeRows: FinanceSheetRow[] = rows.map(row => {
      const financeRow: FinanceSheetRow = {
        epoch: row.date.getTime(),
        amount: row.amount,
        category: row.category,
        providedDetail: row.userDetail,
        transactionInfo: row.transactionNotes,
        source: input.label,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: MatthewSnapshotParserInput): MatthewSnapshotRow[] {
    const rows: MatthewSnapshotRow[] = [];

    Papa.parse(input.text, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        Amount: true,
        epoch: true,
      },
      complete: (result: any) => {
        const data = result.data as any[][]; // Data from PapaParse
        data.forEach(row => {
          rows.push({
            date: cleanDate(row[2]),
            amount: cleanNumber(row[3]),
            category: row[5],
            userDetail: row[6],
            transactionNotes: row[8],
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
