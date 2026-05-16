import * as fs from "fs";
import * as path from "path";
import CreditParser from "../CreditParser";
import { WELLS_FARGO_CREDIT_EXAMPLE } from "../exampleFiles";

describe("CreditParser - real file", () => {
  let parser: CreditParser;
  let csvContent: string;

  beforeEach(() => {
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/CreditCard2.csv"),
      "utf-8"
    );
    parser = new CreditParser(WELLS_FARGO_CREDIT_EXAMPLE, csvContent);
  });

  it("should parse all 52 data rows from the real CSV file (plus 1 header row)", () => {
    const result = parser.parse(csvContent);
    expect(result).toHaveLength(53); // 52 data rows + 1 header row (header: false)
  });

  it("should parse the most recent transaction correctly", () => {
    const result = parser.parse(csvContent);
    // Skip header row (index 0), first real transaction is index 1
    const first = result[1];
    expect(first.date.getFullYear()).toBe(2026);
    expect(first.date.getMonth()).toBe(3); // April
    expect(first.date.getDate()).toBe(30);
    expect(first.amount).toBe(-186.31);
    expect(first.detail).toContain("COSTCO WHSE");
  });

  it("should parse automatic payment as positive amount", () => {
    const result = parser.parse(csvContent);
    const payments = result.filter(r => r.detail === "AUTOMATIC PAYMENT - THANK YOU");
    expect(payments).toHaveLength(1);
    expect(payments[0].amount).toBe(2909.86);
  });

  it("should preserve two EASTGATE HOTEL rows with different amounts on the same date", () => {
    const result = parser.parse(csvContent);
    const hotelRows = result.filter(r => r.detail && r.detail.includes("EASTGATE HOTEL"));
    expect(hotelRows).toHaveLength(2);
    const amounts = hotelRows.map(r => r.amount).sort((a, b) => a - b);
    expect(amounts[0]).toBe(-323.82);
    expect(amounts[1]).toBe(-254.40);
    hotelRows.forEach(r => {
      expect(r.date.getFullYear()).toBe(2026);
      expect(r.date.getMonth()).toBe(2); // March
      expect(r.date.getDate()).toBe(14);
    });
  });

  it("should parse online payment as positive amount", () => {
    const result = parser.parse(csvContent);
    const onlinePayment = result.find(r => r.detail === "ONLINE PAYMENT THANK YOU");
    expect(onlinePayment).toBeDefined();
    expect(onlinePayment!.amount).toBe(4100.00);
  });
});
