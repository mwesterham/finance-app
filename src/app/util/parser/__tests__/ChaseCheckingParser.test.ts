import * as fs from "fs";
import * as path from "path";
import ChaseCheckingParser from "../ChaseCheckingParser";
import { InputFileLabel } from "../../../views/MultiFileUploader";
import { CHASE_CHECKING_EXAMPLE } from "../exampleFiles";

describe("ChaseCheckingParser", () => {
  let parser: ChaseCheckingParser;
  let csvContent: string;

  beforeEach(() => {
    csvContent = fs.readFileSync(
      path.resolve(__dirname, "resources/Chase3727_Activity_20260516.CSV"),
      "utf-8"
    );
    parser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, csvContent);
  });

  describe("parse", () => {
    it("should parse all rows from the real CSV file", () => {
      const result = parser.parse(csvContent);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should parse a debit row as a negative amount", () => {
      const input = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,05/01/2026,"Zelle payment to Injae 29051363145",-100.00,QUICKPAY_DEBIT,13647.45,,`;

      const singleParser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, input);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-100.00);
      expect(result[0].detail).toBe("Zelle payment to Injae 29051363145");
      expect(result[0].date.getFullYear()).toBe(2026);
      expect(result[0].date.getMonth()).toBe(4); // May
      expect(result[0].date.getDate()).toBe(1);
    });

    it("should parse a credit row as a positive amount", () => {
      const input = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
CREDIT,05/01/2026,"DIGNITY HEALTH   PR PAYMENT                 PPD ID: 9411962036",1780.11,ACH_CREDIT,13747.45,,`;

      const singleParser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, input);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(1780.11);
      expect(result[0].detail).toContain("DIGNITY HEALTH");
    });

    it("should parse multiple rows correctly", () => {
      const input = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,05/01/2026,"Zelle payment to Injae 29051363145",-100.00,QUICKPAY_DEBIT,13647.45,,
CREDIT,05/01/2026,"DIGNITY HEALTH   PR PAYMENT                 PPD ID: 9411962036",1780.11,ACH_CREDIT,13747.45,,
DEBIT,04/30/2026,"WINCO FOODS #129 WINCO CHANDLER AZ   026983  04/30",-32.52,DEBIT_CARD,11967.34,,`;

      const singleParser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, input);
      const result = singleParser.parse(input);

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(-100.00);
      expect(result[1].amount).toBe(1780.11);
      expect(result[2].amount).toBe(-32.52);
    });
  });

  describe("toFinanceRows", () => {
    it("should set source to CHASE_CHECKING", () => {
      const input = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
DEBIT,05/01/2026,"Zelle payment to Injae 29051363145",-100.00,QUICKPAY_DEBIT,13647.45,,`;

      const singleParser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, input);
      const result = singleParser.toFinanceRows(input);

      expect(result).toHaveLength(1);
      expect(result[0].source).toBe(InputFileLabel.CHASE_CHECKING);
      expect(result[0].amount).toBe(-100.00);
      expect(result[0].transactionInfo).toBe("Zelle payment to Injae 29051363145");
    });

    it("should convert date to epoch correctly", () => {
      const input = `Details,Posting Date,Description,Amount,Type,Balance,Check or Slip #
CREDIT,04/01/2026,"Zelle payment from CASPER S KIM 28646931504",1320.00,QUICKPAY_CREDIT,21042.10,,`;

      const singleParser = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, input);
      const result = singleParser.toFinanceRows(input);

      const date = new Date(result[0].epoch);
      expect(date.getFullYear()).toBe(2026);
      expect(date.getMonth()).toBe(3); // April
      expect(date.getDate()).toBe(1);
    });

    it("should parse all rows from the real file into FinanceSheetRows", () => {
      const result = parser.toFinanceRows(csvContent);
      expect(result.length).toBeGreaterThan(0);
      result.forEach(row => {
        expect(row.source).toBe(InputFileLabel.CHASE_CHECKING);
        expect(typeof row.amount).toBe("number");
        expect(typeof row.epoch).toBe("number");
      });
    });
  });
});
