import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface AmexCreditParserInputRow {
  date: Date;
  description: string;
  amount: number;
}

export default class AmexCreditParser implements IParser<string, AmexCreditParserInputRow[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  toFinanceRows(input: string): FinanceSheetRow[] {
    const capitalOneInputs = this.parse(input);
    const financeRows: FinanceSheetRow[] = capitalOneInputs.map(capitalOneInput => {
      const financeRow: FinanceSheetRow = {
        epoch: capitalOneInput.date.getTime(),
        amount: capitalOneInput.amount,
        source: InputFileLabel.AMEX_CREDIT,
        transactionInfo: capitalOneInput.description,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: string): AmexCreditParserInputRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: AmexCreditParserInputRow[] = [];

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
            description: row[1],
            amount: -1 * cleanNumber(row[2]),
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
