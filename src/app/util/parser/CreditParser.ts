import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";

export interface CreditInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class CreditParser implements IParser<string, CreditInputRow[]> {
  toFinanceRows(input: string): FinanceSheetRow[] {
    const creditInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = creditInputs.map(creditInput => {
      const financeRow: FinanceSheetRow = {
        epoch: creditInput.date.getTime(),
        amount: creditInput.amount,
        source: InputFileLabel.WELLS_FARGO_CREDIT,
        transactionInfo: creditInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): CreditInputRow[] {
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
            amount: cleanNumber(row[1]),
            detail: row[4],
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
