import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";

export interface CapitalOneCreditParserInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class CapitalOneCreditParser implements IParser<string, CapitalOneCreditParserInputRow[]> {
  toFinanceRows(input: string): FinanceSheetRow[] {
    const capitalOneInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = capitalOneInputs.map(capitalOneInput => {
      const financeRow: FinanceSheetRow = {
        epoch: capitalOneInput.date.getTime(),
        amount: capitalOneInput.amount,
        source: InputFileLabel.CAPITAL_ONE_CREDIT,
        transactionInfo: capitalOneInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): CapitalOneCreditParserInputRow[] {
    const rows: CapitalOneCreditParserInputRow[] = [];

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
            amount: row[5] !== "" ? -1 * cleanNumber(row[5]) : cleanNumber(row[6]),
            detail: row[3],
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
