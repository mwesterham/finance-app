import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface DiscoverInputRow {
  date: Date;
  amount: number;
  detail: string;
}

export default class DiscoverParser implements IParser<string, DiscoverInputRow[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const discoverInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = discoverInputs.map(discoverInput => {
      const financeRow: FinanceSheetRow = {
        epoch: discoverInput.date.getTime(),
        amount: discoverInput.amount,
        source: InputFileLabel.DISCOVER,
        transactionInfo: discoverInput.detail,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): DiscoverInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: DiscoverInputRow[] = [];

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
            amount: -1 * cleanNumber(row[3]),
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
