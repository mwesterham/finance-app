import * as fs from "fs";
import * as path from "path";
import ChaseCreditParser from "../ChaseCreditParser";
import { ParserKey } from "../../../views/MultiFileUploader";
import { CHASE_CREDIT_EXAMPLE } from "../exampleFiles";

describe("ChaseCreditParser", () => {
  describe("Chase Freedom Credit (1915)", () => {
    let parser: ChaseCreditParser;
    let csvContent: string;

    beforeEach(() => {
      csvContent = fs.readFileSync(
        path.resolve(__dirname, "resources/Chase1915_Activity20240516_20260516_20260516.CSV"),
        "utf-8"
      );
      parser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, csvContent, ParserKey.CHASE_CREDIT_PARSER);
    });

    it("should parse all rows from the real CSV file", () => {
      const result = parser.parse(csvContent);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should parse a sale as a negative amount", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/13/2026,05/14/2026,TST* PARIS BAGUETTE - CHA,Food & Drink,Sale,-42.76,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-42.76);
      expect(result[0].detail).toBe("TST* PARIS BAGUETTE - CHA");
      expect(result[0].date.getFullYear()).toBe(2026);
      expect(result[0].date.getMonth()).toBe(4); // May
      expect(result[0].date.getDate()).toBe(13);
    });

    it("should parse a payment as a positive amount", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/01/2026,05/01/2026,AUTOMATIC PAYMENT - THANK,,Payment,436.04,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(436.04);
      expect(result[0].detail).toBe("AUTOMATIC PAYMENT - THANK");
    });

    it("should parse multiple rows correctly", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/13/2026,05/14/2026,TST* PARIS BAGUETTE - CHA,Food & Drink,Sale,-42.76,
05/12/2026,05/13/2026,FRYS FUEL #7628,Gas,Sale,-65.54,
05/01/2026,05/01/2026,AUTOMATIC PAYMENT - THANK,,Payment,436.04,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(-42.76);
      expect(result[1].amount).toBe(-65.54);
      expect(result[2].amount).toBe(436.04);
    });

    it("should set source to CHASE_FREEDOM_CREDIT in toFinanceRows", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/13/2026,05/14/2026,TST* PARIS BAGUETTE - CHA,Food & Drink,Sale,-42.76,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.toFinanceRows(input);

      expect(result[0].source).toBe(ParserKey.CHASE_CREDIT_PARSER);
      expect(result[0].transactionInfo).toBe("TST* PARIS BAGUETTE - CHA");
    });
  });

  describe("Chase Amazon Prime Credit (1616)", () => {
    let parser: ChaseCreditParser;
    let csvContent: string;

    beforeEach(() => {
      csvContent = fs.readFileSync(
        path.resolve(__dirname, "resources/Chase1616_Activity20240516_20260516_20260516.CSV"),
        "utf-8"
      );
      parser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, csvContent, ParserKey.CHASE_CREDIT_PARSER);
    });

    it("should parse all rows from the real CSV file", () => {
      const result = parser.parse(csvContent);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should set source to CHASE_AMAZON_CREDIT in toFinanceRows", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/01/2026,05/03/2026,H MART MESA LLC,Groceries,Sale,-51.44,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.toFinanceRows(input);

      expect(result[0].source).toBe(ParserKey.CHASE_CREDIT_PARSER);
      expect(result[0].amount).toBe(-51.44);
      expect(result[0].transactionInfo).toBe("H MART MESA LLC");
    });

    it("should parse a return as a positive amount", () => {
      const input = `Transaction Date,Post Date,Description,Category,Type,Amount,Memo
05/01/2026,05/01/2026,AMAZON MKTPLACE PMTS,Shopping,Return,43.46,`;

      const singleParser = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, input, ParserKey.CHASE_CREDIT_PARSER);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(43.46);
    });

    it("should parse all rows from the real file into FinanceSheetRows", () => {
      const result = parser.toFinanceRows(csvContent);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(row => {
        expect(row.source).toBe(ParserKey.CHASE_CREDIT_PARSER);
        expect(typeof row.amount).toBe("number");
        expect(typeof row.epoch).toBe("number");
      });
    });
  });
});
