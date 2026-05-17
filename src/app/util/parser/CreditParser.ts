import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";

import { FileValidator } from "./FileValidator";

export interface CreditInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class CreditParser implements IParser<string, CreditInputRow[]> {
  private validator: FileValidator;
  private source: string;

  constructor(expectedFile: string, actualFile: string, source: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
    this.source = source;
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const creditInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = creditInputs.map(creditInput => {
      const financeRow: FinanceSheetRow = {
        epoch: creditInput.date.getTime(),
        amount: creditInput.amount,
        source: this.source,
        transactionInfo: creditInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): CreditInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: CreditInputRow[] = [];

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
