import * as fs from "fs";
import * as path from "path";
import CreditParser from "../CreditParser";

describe("CreditParser - real file", () => {
  let parser: CreditParser;
  let csvContent: string;

  beforeEach(() => {
    parser = new CreditParser();
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/CreditCard2.csv"),
      "utf-8"
    );
  });

  it("should parse all 82 rows from the real CSV file", () => {
    const result = parser.parse(csvContent);
    expect(result).toHaveLength(82);
  });

  it("should parse the most recent transaction correctly", () => {
    const result = parser.parse(csvContent);
    const first = result[0];
    expect(first.date.getFullYear()).toBe(2026);
    expect(first.date.getMonth()).toBe(2); // March
    expect(first.date.getDate()).toBe(19);
    expect(first.amount).toBe(-16.35);
    expect(first.detail).toContain("AMAZON PRIME");
  });

  it("should parse automatic payments as positive amounts", () => {
    const result = parser.parse(csvContent);
    const payments = result.filter(r => r.detail === "AUTOMATIC PAYMENT - THANK YOU");
    expect(payments).toHaveLength(3);
    const amounts = payments.map(r => r.amount).sort((a, b) => a - b);
    expect(amounts).toEqual([1041.29, 2909.86, 3140.50]);
  });

  it("should preserve three Delta Air rows with same amount but different descriptions (not duplicates)", () => {
    const result = parser.parse(csvContent);
    // Three Delta Air tickets on 01/04/2026, all -116.99 but different ticket numbers
    const deltaRows = result.filter(r => r.detail.startsWith("DELTA AIR"));
    expect(deltaRows).toHaveLength(3);
    deltaRows.forEach(r => expect(r.amount).toBe(-116.99));
    // All on the same date
    deltaRows.forEach(r => {
      expect(r.date.getFullYear()).toBe(2026);
      expect(r.date.getMonth()).toBe(0); // January
      expect(r.date.getDate()).toBe(4);
    });
    // Descriptions must differ (different ticket numbers)
    const details = deltaRows.map(r => r.detail);
    expect(new Set(details).size).toBe(3);
  });

  it("should preserve same-date same-amount rows that are genuine duplicates", () => {
    const result = parser.parse(csvContent);
    // Two EASTGATE HOTEL rows on 03/14/2026 with different amounts - not duplicates
    const hotelRows = result.filter(r => r.detail.includes("EASTGATE HOTEL"));
    expect(hotelRows).toHaveLength(2);
    const amounts = hotelRows.map(r => r.amount).sort((a, b) => a - b);
    expect(amounts[0]).toBe(-323.82);
    expect(amounts[1]).toBe(-254.40);
  });

  it("should parse Kiro Pro subscription entries on different months", () => {
    const result = parser.parse(csvContent);
    const kiroRows = result.filter(r => r.detail === "KIRO PRO KIRO.DEV WA");
    // Appears in Dec 2025, Jan 2026, Feb 2026
    expect(kiroRows).toHaveLength(3);
    const months = kiroRows.map(r => r.date.getMonth()).sort((a, b) => a - b);
    expect(months).toEqual([0, 1, 11]); // Jan, Feb, Dec
  });
});
