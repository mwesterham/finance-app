import Papa from "papaparse";
import { IParser } from "./IParser";
import { Rule } from "../../../db/WesterhamDatabase";
import { FileValidator } from "./FileValidator";

export default class RulesExportsParser implements IParser<string, Rule[]> {
  private validator: FileValidator;

  constructor(expectedFile: string, actualFile: string) {
    this.validator = new FileValidator(expectedFile, actualFile);
  }

  parse(input: string): Rule[] {
    if (!this.validator.validateFile().valid) {
      return [];
    }

    const rows: Rule[] = [];

    Papa.parse(input, {
      header: false,
      skipEmptyLines: true,
      complete: (result: any) => {
        const data = result.data as any[][]; // Data from PapaParse
        data.slice(1).forEach(row => {
          rows.push({
            matchingExpression: row[1],
            category: row[2],
            providedDetail: row[3],
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
