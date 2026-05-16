import Papa from "papaparse";
import { IParser } from "./IParser";
import { cleanDate, cleanNumber } from "../util";
import { FinanceSheetRow } from "../../../db/WesterhamDatabase";
import { InputFileLabel } from "../../views/MultiFileUploader";
import { FileValidator } from "./FileValidator";

export interface MatthewCheckingSnapshotRow {
  date: Date;
  amount: number;
  category: string;
  userDetail: string;
  transactionNotes: string;
}

export interface MatthewCreditSnapshotParserInput {
  text: string;
  label: InputFileLabel;
}

export default class MatthewCreditSnapshotParser implements IParser<MatthewCreditSnapshotParserInput, MatthewCheckingSnapshotRow[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  toFinanceRows(input: MatthewCreditSnapshotParserInput): FinanceSheetRow[] {
    const rows = this.parse(input);
    const financeRows: FinanceSheetRow[] = rows.map(row => {
      const financeRow: FinanceSheetRow = {
        epoch: row.date.getTime(),
        amount: row.amount,
        category: row.category,
        providedDetail: row.userDetail,
        transactionInfo: row.transactionNotes,
        source: input.label,
      };
      return financeRow;
    });
    return financeRows;
  }

  parse(input: MatthewCreditSnapshotParserInput): MatthewCheckingSnapshotRow[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: MatthewCheckingSnapshotRow[] = [];

    Papa.parse(input.text, {
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
            date: cleanDate(row[2]),
            amount: cleanNumber(row[3]),
            category: row[5],
            userDetail: row[6],
            transactionNotes: row[7],
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
