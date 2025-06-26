import Papa from "papaparse";
import { IParser } from "./IParser";
import { Rule } from "../../../db/WesterhamDatabase";

export default class RulesExportsParser implements IParser<string, Rule[]> {
  parse(input: string): Rule[] {
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
