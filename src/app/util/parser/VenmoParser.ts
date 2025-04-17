import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber, formatVenmoNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";

export interface VenmoInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class VenmoParser implements IParser<string, VenmoInputRow[]> {
  toFinanceRows(input: string): FinanceSheetRow[] {
    const venmoInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = venmoInputs.map(venmoInput => {
      const financeRow: FinanceSheetRow = {
        epoch: venmoInput.date.getTime(),
        amount: venmoInput.amount,
        source: InputFileLabel.VENMO,
        transactionInfo: venmoInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): VenmoInputRow[] {
    const rows: VenmoInputRow[] = [];

    Papa.parse(input, {
      header: false,
      skipEmptyLines: true,
      dynamicTyping: {
        Amount: true,
        epoch: true,
      },
      complete: (result: any) => {
        const data = result.data as any[][]; // Data from PapaParse
        
        // Skip the first 4 rows, and last row
        data.slice(4, -1).forEach(row => {
          const amount = formatVenmoNumber(row[8]);
          const destination: string = row[15];
          const isDeposit = destination.includes("Wells Fargo");
          rows.push({
            date: cleanDate(row[2]),
            amount: amount < 0 && !isDeposit ? 0 : amount,
            detail: isDeposit ? "Bank deposit" : row[5],
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
