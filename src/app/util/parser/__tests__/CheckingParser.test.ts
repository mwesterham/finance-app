import CheckingParser from "../CheckingParser";
import { InputFileLabel } from "../../../views/MultiFileUploader";

describe("CheckingParser", () => {
  let parser: CheckingParser;

  beforeEach(() => {
    parser = new CheckingParser();
  });

  describe("parse", () => {
    it("should parse Amazon direct deposit with correct date and amount", () => {
      const input = `"04/11/2025","AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW","4142.66","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].date.getFullYear()).toBe(2025);
      expect(result[0].date.getMonth()).toBe(3); // April is month 3 (0-indexed)
      expect(result[0].date.getDate()).toBe(11);
      expect(result[0].amount).toBe(4142.66);
      expect(result[0].detail).toBe("AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW");
    });

    it("should parse ATM withdrawal as negative amount", () => {
      const input = `"04/07/2025","ATM WITHDRAWAL AUTHORIZED ON 04/06 3495 W Chandler Blvd Chandler AZ 0004840 ATM ID 9986V CARD 3042","-1000.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-1000.00);
      expect(result[0].detail).toBe("ATM WITHDRAWAL AUTHORIZED ON 04/06 3495 W Chandler Blvd Chandler AZ 0004840 ATM ID 9986V CARD 3042");
    });

    it("should parse IRS tax refund", () => {
      const input = `"04/07/2025","IRS TREAS 310 TAX REF 040725 XXXXXXXXXX00989 REF*WEST*FRESNO*12/2024*TAX REFUND*30","364.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(364.00);
      expect(result[0].detail).toBe("IRS TREAS 310 TAX REF 040725 XXXXXXXXXX00989 REF*WEST*FRESNO*12/2024*TAX REFUND*30");
    });

    it("should parse credit card auto payment", () => {
      const input = `"04/04/2025","WF Credit Card AUTO PAY 250404 90143425376771 WESTERHAM,MATTHEW K","-2728.18","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-2728.18);
      expect(result[0].detail).toBe("WF Credit Card AUTO PAY 250404 90143425376771 WESTERHAM,MATTHEW K");
    });

    it("should parse Zelle transfer", () => {
      const input = `"03/17/2025","ZELLE TO VAN BRENDON ON 03/16 REF #RP0YMH6TR6 3 LESSONS MISSED BADMINTON","-50.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].date.getFullYear()).toBe(2025);
      expect(result[0].date.getMonth()).toBe(2); // March is month 2
      expect(result[0].date.getDate()).toBe(17);
      expect(result[0].amount).toBe(-50.00);
      expect(result[0].detail).toBe("ZELLE TO VAN BRENDON ON 03/16 REF #RP0YMH6TR6 3 LESSONS MISSED BADMINTON");
    });

    it("should parse Venmo cashout", () => {
      const input = `"03/18/2025","VENMO CASHOUT 250318 1040959411377 MATTHEW WESTERHAM","120.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(120.00);
      expect(result[0].detail).toBe("VENMO CASHOUT 250318 1040959411377 MATTHEW WESTERHAM");
    });

    it("should parse multiple transactions correctly", () => {
      const input = `"04/11/2025","AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW","4142.66","","Posted"
"04/07/2025","ATM WITHDRAWAL AUTHORIZED ON 04/06 3495 W Chandler Blvd Chandler AZ 0004840 ATM ID 9986V CARD 3042","-1000.00","","Posted"
"04/07/2025","IRS TREAS 310 TAX REF 040725 XXXXXXXXXX00989 REF*WEST*FRESNO*12/2024*TAX REFUND*30","364.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(4142.66);
      expect(result[1].amount).toBe(-1000.00);
      expect(result[2].amount).toBe(364.00);
    });

    it("should parse Wells Fargo rewards", () => {
      const input = `"03/14/2025","WELLS FARGO REWARDS","75.00","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(75.00);
      expect(result[0].detail).toBe("WELLS FARGO REWARDS");
    });

    it("should parse gym membership fee", () => {
      const input = `"03/25/2025","EOS FITNESS ABC CLUB FEES 2508300289006 - EOS FITNESS 888-827-9262","-26.99","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-26.99);
      expect(result[0].detail).toBe("EOS FITNESS ABC CLUB FEES 2508300289006 - EOS FITNESS 888-827-9262");
    });
  });

  describe("toFinanceRows", () => {
    it("should convert parsed data to FinanceSheetRow format", () => {
      const input = `"04/11/2025","AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW","4142.66","","Posted"`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(1);
      const resultDate = new Date(result[0].epoch);
      expect(resultDate.getFullYear()).toBe(2025);
      expect(resultDate.getMonth()).toBe(3); // April
      expect(resultDate.getDate()).toBe(11);
      expect(result[0].amount).toBe(4142.66);
      expect(result[0].source).toBe(InputFileLabel.WELLS_FARGO_CHECKING);
      expect(result[0].transactionInfo).toBe("AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW");
    });

    it("should handle multiple transactions", () => {
      const input = `"04/11/2025","AMAZON.COM SVCS DIRECT DEP 250411 937034978351NFT WESTERHAM,MATTHEW","4142.66","","Posted"
"04/07/2025","ATM WITHDRAWAL AUTHORIZED ON 04/06 3495 W Chandler Blvd Chandler AZ 0004840 ATM ID 9986V CARD 3042","-1000.00","","Posted"
"03/17/2025","ZELLE TO VAN BRENDON ON 03/16 REF #RP0YMH6TR6 3 LESSONS MISSED BADMINTON","-50.00","","Posted"`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(3);

      // First transaction
      const date1 = new Date(result[0].epoch);
      expect(date1.getMonth()).toBe(3); // April
      expect(date1.getDate()).toBe(11);
      expect(result[0].amount).toBe(4142.66);

      // Second transaction
      const date2 = new Date(result[1].epoch);
      expect(date2.getMonth()).toBe(3); // April
      expect(date2.getDate()).toBe(7);
      expect(result[1].amount).toBe(-1000.00);

      // Third transaction
      const date3 = new Date(result[2].epoch);
      expect(date3.getMonth()).toBe(2); // March
      expect(date3.getDate()).toBe(17);
      expect(result[2].amount).toBe(-50.00);
    });
  });
});
