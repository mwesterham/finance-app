import { FinanceSheetRow } from "../../../db/WesterhamDatabase";

export interface IParser<I, O> {
  parse(input: I): O;
  toFinanceRows(input: I): FinanceSheetRow[];
}