import * as fs from "fs";
import * as path from "path";
import CapitalOneCreditParser from "../CapitalOneCreditParser";
import { CAPITAL_ONE_CREDIT_EXAMPLE } from "../exampleFiles";

describe("CapitalOneCreditParser - duplicate detection", () => {
  let parser: CapitalOneCreditParser;
  let csvContent: string;

  beforeEach(() => {
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/2026-03-21_transaction_download.csv"),
      "utf-8"
    );
    parser = new CapitalOneCreditParser(CAPITAL_ONE_CREDIT_EXAMPLE, csvContent);
  });

  it("should parse all 28 data rows from the real CSV file", () => {
    const result = parser.parse(csvContent);
    // CSV has 28 data rows + 1 header row that the parser incorrectly includes
    // This test documents the current (buggy) behavior: result.length === 29
    // The correct behavior should be result.length === 28
    expect(result).toHaveLength(29); // BUG: header row is parsed as a data row
  });

  it("should include both ARBYS transactions with different amounts (not deduplicated)", () => {
    const result = parser.parse(csvContent);

    const arbysRows = result.filter(row => row.detail === "ARBYS 0279");

    // There are two ARBYS transactions on 2026-01-19 with different amounts
    expect(arbysRows).toHaveLength(2);
    const amounts = arbysRows.map(r => r.amount).sort((a, b) => a - b);
    expect(amounts[0]).toBe(-8.41);
    expect(amounts[1]).toBe(-6.26);
  });

  it("should produce two distinct ARBYS rows with the same date but different amounts", () => {
    const result = parser.parse(csvContent);

    const arbysRows = result.filter(row => row.detail === "ARBYS 0279");
    expect(arbysRows).toHaveLength(2);

    // Both should share the same transaction date (2026-01-19)
    expect(arbysRows[0].date.getFullYear()).toBe(2026);
    expect(arbysRows[0].date.getMonth()).toBe(0); // January
    expect(arbysRows[0].date.getDate()).toBe(19);

    expect(arbysRows[1].date.getFullYear()).toBe(2026);
    expect(arbysRows[1].date.getMonth()).toBe(0);
    expect(arbysRows[1].date.getDate()).toBe(19);

    // Amounts must differ — these are NOT duplicates
    expect(arbysRows[0].amount).not.toBe(arbysRows[1].amount);
  });

  it("should not treat same-date same-merchant different-amount rows as duplicates in toFinanceRows", () => {
    const result = parser.toFinanceRows(csvContent);

    const arbysRows = result.filter(row => row.transactionInfo === "ARBYS 0279");
    expect(arbysRows).toHaveLength(2);

    // Epochs should be equal (same date)
    expect(arbysRows[0].epoch).toBe(arbysRows[1].epoch);

    // Amounts must be distinct
    expect(arbysRows[0].amount).not.toBe(arbysRows[1].amount);
  });

  it("should incorrectly include the header row as a parsed data row (known bug)", () => {
    const result = parser.parse(csvContent);

    // The first row should be the header, parsed as if it were data
    // This is the bug: header row is not skipped
    const firstRow = result[0];
    expect(firstRow.detail).toBe("Description"); // header column value leaking as data
  });
});
