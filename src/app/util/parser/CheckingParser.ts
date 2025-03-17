import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";

export interface CheckingInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class CheckingParser implements IParser<string, CheckingInputRow[]> {
  parse(input: string): CheckingInputRow[] {
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
