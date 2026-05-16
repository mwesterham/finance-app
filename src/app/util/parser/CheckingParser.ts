import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface CheckingInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class CheckingParser implements IParser<string, CheckingInputRow[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const checkingInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = checkingInputs.map(checkingInput => {
      const financeRow: FinanceSheetRow = {
        epoch: checkingInput.date.getTime(),
        amount: checkingInput.amount,
        source: InputFileLabel.WELLS_FARGO_CHECKING,
        transactionInfo: checkingInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): CheckingInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: CheckingInputRow[] = [];

    Papa.parse(input, {
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
            date: cleanDate(row[0]),
            amount: cleanNumber(row[2]),
            detail: row[1],
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
