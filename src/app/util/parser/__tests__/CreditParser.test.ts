import CreditParser from "../CreditParser";
import { ParserKey } from "../../../views/MultiFileUploader";
import { WELLS_FARGO_CREDIT_EXAMPLE } from "../exampleFiles";

describe("CreditParser", () => {
  let parser: CreditParser;

  beforeEach(() => {
    parser = new CreditParser(WELLS_FARGO_CREDIT_EXAMPLE, WELLS_FARGO_CREDIT_EXAMPLE, "Wells Fargo Credit");
  });

  describe("parse", () => {
    it("should parse restaurant purchase with correct date and amount", () => {
      const input = `"02/07/2026","SP SMOKO INC. SMOKONOW.COM CA","-30.95","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].date.getFullYear()).toBe(2026);
      expect(result[0].date.getMonth()).toBe(1); // February is month 1 (0-indexed)
      expect(result[0].date.getDate()).toBe(7);
      expect(result[0].amount).toBe(-30.95);
      expect(result[0].detail).toBe("SP SMOKO INC. SMOKONOW.COM CA");
    });

    it("should parse automatic payment as positive amount", () => {
      const input = `"02/04/2026","AUTOMATIC PAYMENT - THANK YOU","1041.29","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(1041.29);
      expect(result[0].detail).toBe("AUTOMATIC PAYMENT - THANK YOU");
    });

    it("should parse Costco purchase", () => {
      const input = `"02/04/2026","COSTCO WHSE #0436 TEMPE AZ","-133.14","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-133.14);
      expect(result[0].detail).toBe("COSTCO WHSE #0436 TEMPE AZ");
    });

    it("should parse Amazon marketplace purchase", () => {
      const input = `"02/02/2026","AMAZON MKTPL*3K1TO1RM3 Amzn.com/billWA","-77.97","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-77.97);
      expect(result[0].detail).toBe("AMAZON MKTPL*3K1TO1RM3 Amzn.com/billWA");
    });

    it("should parse gas station purchase", () => {
      const input = `"02/02/2026","FRYS FUEL #7628 PHOENIX AZ","-28.71","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-28.71);
      expect(result[0].detail).toBe("FRYS FUEL #7628 PHOENIX AZ");
    });

    it("should parse Kiro Pro subscription", () => {
      const input = `"02/01/2026","KIRO PRO KIRO.DEV WA","-21.82","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-21.82);
      expect(result[0].detail).toBe("KIRO PRO KIRO.DEV WA");
    });

    it("should parse DoorDash purchase", () => {
      const input = `"01/28/2026","DD *DOORDASH GREENCORN DOORDASH.COM CA","-28.05","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].date.getFullYear()).toBe(2026);
      expect(result[0].date.getMonth()).toBe(0); // January is month 0
      expect(result[0].date.getDate()).toBe(28);
      expect(result[0].amount).toBe(-28.05);
      expect(result[0].detail).toBe("DD *DOORDASH GREENCORN DOORDASH.COM CA");
    });

    it("should parse Steam purchase", () => {
      const input = `"01/28/2026","WL *Steam Purchase 425-9522985 WA","-12.83","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-12.83);
      expect(result[0].detail).toBe("WL *Steam Purchase 425-9522985 WA");
    });

    it("should parse large purchase (jewelry)", () => {
      const input = `"01/11/2026","Brilliant Earth San FranciscoCA","-1985.62","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-1985.62);
      expect(result[0].detail).toBe("Brilliant Earth San FranciscoCA");
    });

    it("should parse Delta Air purchase", () => {
      const input = `"01/04/2026","DELTA AIR 0062392751882800-2211212 CA","-116.99","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-116.99);
      expect(result[0].detail).toBe("DELTA AIR 0062392751882800-2211212 CA");
    });

    it("should parse Amazon Prime subscription", () => {
      const input = `"01/19/2026","AMAZON PRIME*KV49G4I23 Amzn.com/billWA","-16.35","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-16.35);
      expect(result[0].detail).toBe("AMAZON PRIME*KV49G4I23 Amzn.com/billWA");
    });

    it("should parse refund transaction", () => {
      const input = `"12/19/2025","CLAUDE.AI SUBSCRIPTION SAN FRANCISCOCA","21.82","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(21.82);
      expect(result[0].detail).toBe("CLAUDE.AI SUBSCRIPTION SAN FRANCISCOCA");
    });

    it("should parse eBay purchase", () => {
      const input = `"12/25/2025","EBAY O*25-13995-49443 EBAY.COM/EBP CA","-25.09","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].date.getFullYear()).toBe(2025);
      expect(result[0].date.getMonth()).toBe(11); // December
      expect(result[0].date.getDate()).toBe(25);
      expect(result[0].amount).toBe(-25.09);
      expect(result[0].detail).toBe("EBAY O*25-13995-49443 EBAY.COM/EBP CA");
    });

    it("should parse multiple transactions correctly", () => {
      const input = `"02/07/2026","SP SMOKO INC. SMOKONOW.COM CA","-30.95","","Posted"
"02/04/2026","AUTOMATIC PAYMENT - THANK YOU","1041.29","","Posted"
"02/02/2026","AMAZON MKTPL*3K1TO1RM3 Amzn.com/billWA","-77.97","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(3);
      expect(result[0].amount).toBe(-30.95);
      expect(result[1].amount).toBe(1041.29);
      expect(result[2].amount).toBe(-77.97);
    });

    it("should parse State Farm insurance payment", () => {
      const input = `"11/19/2025","STATE FARM INSURANCE 800-956-6310 IL","-471.89","","Posted"`;

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].amount).toBe(-471.89);
      expect(result[0].detail).toBe("STATE FARM INSURANCE 800-956-6310 IL");
    });
  });

  describe("toFinanceRows", () => {
    it("should convert parsed data to FinanceSheetRow format", () => {
      const input = `"02/07/2026","SP SMOKO INC. SMOKONOW.COM CA","-30.95","","Posted"`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(1);
      const resultDate = new Date(result[0].epoch);
      expect(resultDate.getFullYear()).toBe(2026);
      expect(resultDate.getMonth()).toBe(1); // February
      expect(resultDate.getDate()).toBe(7);
      expect(result[0].amount).toBe(-30.95);
      expect(result[0].source).toBe(ParserKey.CREDIT_PARSER);
      expect(result[0].transactionInfo).toBe("SP SMOKO INC. SMOKONOW.COM CA");
    });

    it("should handle multiple transactions", () => {
      const input = `"02/07/2026","SP SMOKO INC. SMOKONOW.COM CA","-30.95","","Posted"
"02/04/2026","AUTOMATIC PAYMENT - THANK YOU","1041.29","","Posted"
"01/28/2026","DD *DOORDASH GREENCORN DOORDASH.COM CA","-28.05","","Posted"`;

      const result = parser.toFinanceRows(input);

      expect(result).toHaveLength(3);

      // First transaction
      const date1 = new Date(result[0].epoch);
      expect(date1.getMonth()).toBe(1); // February
      expect(date1.getDate()).toBe(7);
      expect(result[0].amount).toBe(-30.95);

      // Second transaction
      const date2 = new Date(result[1].epoch);
      expect(date2.getMonth()).toBe(1); // February
      expect(date2.getDate()).toBe(4);
      expect(result[1].amount).toBe(1041.29);

      // Third transaction
      const date3 = new Date(result[2].epoch);
      expect(date3.getMonth()).toBe(0); // January
      expect(date3.getDate()).toBe(28);
      expect(result[2].amount).toBe(-28.05);
    });
  });
});
