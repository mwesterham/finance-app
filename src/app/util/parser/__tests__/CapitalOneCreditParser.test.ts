import CapitalOneCreditParser from "../CapitalOneCreditParser";
import { InputFileLabel } from "../../../views/MultiFileUploader";

describe("CapitalOneCreditParser", () => {
  let parser: CapitalOneCreditParser;

  beforeEach(() => {
    parser = new CapitalOneCreditParser();
  });

  describe("parse", () => {
    it("should parse TST* SHINKO row with correct transaction date", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2025-12-03,2025-12-04,5981,TST* SHINKO,Dining,80.93,`;

      const result = parser.parse(input);

      // Parser includes header row, so we check the second item
      expect(result).toHaveLength(2);
      expect(result[1].date.getFullYear()).toBe(2025);
      expect(result[1].date.getMonth()).toBe(11); // December is month 11 (0-indexed)
      expect(result[1].date.getDate()).toBe(3); // Now correctly December 3rd
    });

    it("should parse debit amounts as negative", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2025-12-03,2025-12-04,5981,TST* SHINKO,Dining,80.93,`;

      const result = parser.parse(input);

      expect(result[1].amount).toBe(-80.93);
      expect(result[1].detail).toBe("TST* SHINKO");
    });

    it("should parse credit amounts as positive", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2026-02-06,2026-02-06,5981,CAPITAL ONE AUTOPAY PYMT,Payment/Credit,,225.69`;

      const result = parser.parse(input);

      expect(result[1].amount).toBe(225.69);
      expect(result[1].detail).toBe("CAPITAL ONE AUTOPAY PYMT");
    });

    it("should parse multiple rows correctly", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2026-01-19,2026-01-21,5981,ARBYS 0279,Dining,8.41,
2026-01-16,2026-01-17,5981,WENDY'S,Dining,27.46,
2026-01-06,2026-01-06,5981,CAPITAL ONE AUTOPAY PYMT,Payment/Credit,,400.58`;

      const result = parser.parse(input);

      expect(result).toHaveLength(4); // 3 data rows + 1 header
      expect(result[1].amount).toBe(-8.41);
      expect(result[2].amount).toBe(-27.46);
      expect(result[3].amount).toBe(400.58);
    });
  });

  describe("toFinanceRows", () => {
    it("should convert parsed data to FinanceSheetRow format", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2025-12-03,2025-12-04,5981,TST* SHINKO,Dining,80.93,`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(2); // Includes header row
      // Check the date components instead of exact epoch
      const resultDate = new Date(result[1].epoch);
      expect(resultDate.getFullYear()).toBe(2025);
      expect(resultDate.getMonth()).toBe(11);
      expect(resultDate.getDate()).toBe(3); // Now correctly December 3rd
      expect(result[1].amount).toBe(-80.93);
      expect(result[1].source).toBe(InputFileLabel.CAPITAL_ONE_CREDIT);
      expect(result[1].transactionInfo).toBe("TST* SHINKO");
    });

    it("should handle full CSV with multiple transactions", () => {
      const input = `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit
2026-02-06,2026-02-06,5981,CAPITAL ONE AUTOPAY PYMT,Payment/Credit,,225.69
2026-01-19,2026-01-21,5981,ARBYS 0279,Dining,8.41,
2025-12-03,2025-12-04,5981,TST* SHINKO,Dining,80.93,`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(4); // 3 data rows + 1 header
      
      // Check first transaction date
      const date1 = new Date(result[1].epoch);
      expect(date1.getFullYear()).toBe(2026);
      expect(date1.getMonth()).toBe(1); // February
      expect(date1.getDate()).toBe(6); // Now correctly February 6th
      
      // Check second transaction date
      const date2 = new Date(result[2].epoch);
      expect(date2.getFullYear()).toBe(2026);
      expect(date2.getMonth()).toBe(0); // January
      expect(date2.getDate()).toBe(19); // Now correctly January 19th
      
      // Check third transaction date (TST* SHINKO)
      const date3 = new Date(result[3].epoch);
      expect(date3.getFullYear()).toBe(2025);
      expect(date3.getMonth()).toBe(11); // December
      expect(date3.getDate()).toBe(3); // Now correctly December 3rd
    });
  });
});
