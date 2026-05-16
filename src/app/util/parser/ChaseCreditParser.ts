import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface ChaseCreditInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class ChaseCreditParser implements IParser<string, ChaseCreditInputRow[]> {
  private validator: FileValidator;
  private source: InputFileLabel;

  constructor(expectedFile: string, actualFile: string, source: InputFileLabel) {
    this.validator = new FileValidator(expectedFile, actualFile);
    this.source = source;
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const rows = this.parse(input);
    return rows.map(row => ({
      epoch: row.date.getTime(),
      amount: row.amount,
      source: this.source,
      transactionInfo: row.detail,
    }));
  }

  parse(input: string): ChaseCreditInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: ChaseCreditInputRow[] = [];

    Papa.parse(input, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        Amount: true,
      },
      complete: (result: any) => {
        const data = result.data as any[][];
        // Skip header row (row[0] = Transaction Date, row[1] = Post Date, row[2] = Description,
        //                   row[3] = Category, row[4] = Type, row[5] = Amount, row[6] = Memo)
        data.slice(1).forEach(row => {
          rows.push({
            date: cleanDate(row[0]),
            amount: cleanNumber(row[5]),
            detail: row[2],
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
