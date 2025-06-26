import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../components/TransactionTableUploader";

export interface MatthewVenmoSnapshotRow {
  date: Date;
  amount: number;
  category: string;
  userDetail: string;
  transactionNotes: string;
}

export interface MatthewVenmoSnapshotParserInput {
  text: string;
  label: InputFileLabel;
}

export default class MatthewVenmoSnapshotParser implements IParser<MatthewVenmoSnapshotParserInput, MatthewVenmoSnapshotRow[]> {
  toFinanceRows(input: MatthewVenmoSnapshotParserInput): FinanceSheetRow[] {
    const rows = this.parse(input);
    const financeRows: FinanceSheetRow[] = rows.map(row => {
      const financeRow: FinanceSheetRow = {
        epoch: row.date.getTime(),
        amount: row.amount,
        category: row.category,
        transactionInfo: row.userDetail,
        source: input.label,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: MatthewVenmoSnapshotParserInput): MatthewVenmoSnapshotRow[] {
    const rows: MatthewVenmoSnapshotRow[] = [];

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
