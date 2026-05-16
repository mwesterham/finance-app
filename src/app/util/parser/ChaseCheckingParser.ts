import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface ChaseCheckingInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class ChaseCheckingParser implements IParser<string, ChaseCheckingInputRow[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const rows = this.parse(input);
    return rows.map(row => ({
      epoch: row.date.getTime(),
      amount: row.amount,
      source: InputFileLabel.CHASE_CHECKING,
      transactionInfo: row.detail,
    }));
  }

  parse(input: string): ChaseCheckingInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: ChaseCheckingInputRow[] = [];

    Papa.parse(input, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        Amount: true,
      },
      complete: (result: any) => {
        const data = result.data as any[][];
        // Skip header row (row[0] = Details, row[1] = Posting Date, row[2] = Description,
        //                   row[3] = Amount, row[4] = Type, row[5] = Balance, row[6] = Check or Slip #)
        data.slice(1).forEach(row => {
          rows.push({
            date: cleanDate(row[1]),
            amount: cleanNumber(row[3]),
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
