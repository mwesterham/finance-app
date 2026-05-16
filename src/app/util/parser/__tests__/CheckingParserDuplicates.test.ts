import * as fs from "fs";
import * as path from "path";
import CheckingParser from "../CheckingParser";
import { WELLS_FARGO_CHECKING_EXAMPLE } from "../exampleFiles";

describe("CheckingParser - real file", () => {
  let parser: CheckingParser;
  let csvContent: string;

  beforeEach(() => {
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/Checking1.csv"),
      "utf-8"
    );
    parser = new CheckingParser(WELLS_FARGO_CHECKING_EXAMPLE, csvContent);
  });

  it("should parse all 29 data rows from the real CSV file (plus 1 header row)", () => {
    const result = parser.parse(csvContent);
    expect(result).toHaveLength(30); // 29 data rows + 1 header row (header: false)
  });

  it("should parse the most recent transaction correctly", () => {
    const result = parser.parse(csvContent);
    // Skip header row (index 0), first real transaction is index 1
    const first = result[1];
    expect(first.date.getFullYear()).toBe(2026);
    expect(first.date.getMonth()).toBe(4); // May
    expect(first.date.getDate()).toBe(1);
    expect(first.amount).toBe(-493.06);
    expect(first.detail).toContain("RECURRING TRANSFER TO CHIN M");
  });

  it("should parse negative amounts correctly", () => {
    const result = parser.parse(csvContent);
    const capitalOnePmt = result.find(r => r.detail && r.detail.includes("CAPITAL ONE") && r.detail.includes("CRCARDPMT") && r.date.getMonth && r.date.getMonth() === 2);
    expect(capitalOnePmt).toBeDefined();
    expect(capitalOnePmt!.amount).toBe(-103.69);
  });

  it("should parse four payroll deposits across different dates", () => {
    const result = parser.parse(csvContent);
    const payrollRows = result.filter(r => r.detail && r.detail.includes("AMAZON.COM SVCS") && r.detail.includes("PAYROLL"));
    expect(payrollRows).toHaveLength(4);
  });

  it("should parse Wells Fargo Rewards entries", () => {
    const result = parser.parse(csvContent);
    const rewards = result.filter(r => r.detail === "WELLS FARGO REWARDS");
    expect(rewards).toHaveLength(2);
    const amounts = rewards.map(r => r.amount);
    expect(amounts).toContain(100.00);
    expect(amounts).toContain(50.00);
  });
});
