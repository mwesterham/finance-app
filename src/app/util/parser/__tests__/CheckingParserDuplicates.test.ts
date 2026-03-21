import * as fs from "fs";
import * as path from "path";
import CheckingParser from "../CheckingParser";

describe("CheckingParser - real file", () => {
  let parser: CheckingParser;
  let csvContent: string;

  beforeEach(() => {
    parser = new CheckingParser();
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/Checking1.csv"),
      "utf-8"
    );
  });

  it("should parse all 37 rows from the real CSV file", () => {
    const result = parser.parse(csvContent);
    expect(result).toHaveLength(37);
  });

  it("should parse the most recent transaction correctly", () => {
    const result = parser.parse(csvContent);
    const first = result[0];
    expect(first.date.getFullYear()).toBe(2026);
    expect(first.date.getMonth()).toBe(2); // March
    expect(first.date.getDate()).toBe(16);
    expect(first.amount).toBe(10000.00);
    expect(first.detail).toContain("ONLINE TRANSFER FROM CHIN M");
  });

  it("should parse negative amounts correctly", () => {
    const result = parser.parse(csvContent);
    const capitalOnePmt = result.find(r => r.detail.includes("CAPITAL ONE CRCARDPMT") && r.date.getMonth() === 2);
    expect(capitalOnePmt).toBeDefined();
    expect(capitalOnePmt!.amount).toBe(-103.69);
  });

  it("should not deduplicate two payroll deposits on different dates with the same amount", () => {
    const result = parser.parse(csvContent);
    // 01/16/2026 and 01/30/2026 both have AMAZON payroll for 3684.59
    const payrollRows = result.filter(r => r.amount === 3684.59);
    expect(payrollRows).toHaveLength(2);
    const dates = payrollRows.map(r => r.date.getDate()).sort((a, b) => a - b);
    expect(dates).toEqual([16, 30]);
  });

  it("should parse Wells Fargo Rewards entries", () => {
    const result = parser.parse(csvContent);
    const rewards = result.filter(r => r.detail === "WELLS FARGO REWARDS");
    expect(rewards).toHaveLength(3);
    const amounts = rewards.map(r => r.amount);
    expect(amounts).toContain(50.00);
    expect(amounts).toContain(25.00);
  });
});
