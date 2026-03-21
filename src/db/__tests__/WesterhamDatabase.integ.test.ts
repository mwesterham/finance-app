import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { WesterhamDatabase, FinanceSheetRow } from "../WesterhamDatabase";

// Wait for async db operations that use callbacks internally
const wait = (ms: number) => new Promise(res => setTimeout(res, ms));

describe("WesterhamDatabase - checkIfRowExists (integration)", () => {
  let db: WesterhamDatabase;
  let dbPath: string;

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `westerham-test-${Date.now()}.db`);
    db = new WesterhamDatabase(dbPath);
    // Allow time for db creation and table setup
    await wait(200);
  });

  afterEach(async () => {
    await db.close();
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  const sampleRow: FinanceSheetRow = {
    epoch: new Date(2026, 0, 19).getTime(), // 2026-01-19
    amount: -8.41,
    source: "Capital One Credit",
    transactionInfo: "ARBYS 0279",
  };

  it("should return false when the row does not exist", async () => {
    const exists = await db.checkIfRowExists(sampleRow);
    expect(exists).toBe(false);
  });

  it("should return true after inserting the row", async () => {
    await db.insertFinanceSheetRow(sampleRow);
    await wait(50);

    const exists = await db.checkIfRowExists(sampleRow);
    expect(exists).toBe(true);
  });

  it("should return false for a row with the same date and description but different amount", async () => {
    await db.insertFinanceSheetRow(sampleRow);
    await wait(50);

    const differentAmount: FinanceSheetRow = { ...sampleRow, amount: -6.26 };
    const exists = await db.checkIfRowExists(differentAmount);
    expect(exists).toBe(false);
  });

  it("should return false for a row with the same amount and description but different date", async () => {
    await db.insertFinanceSheetRow(sampleRow);
    await wait(50);

    const differentDate: FinanceSheetRow = {
      ...sampleRow,
      epoch: new Date(2026, 0, 20).getTime(),
    };
    const exists = await db.checkIfRowExists(differentDate);
    expect(exists).toBe(false);
  });

  it("should return false for a row with the same date and amount but different description", async () => {
    await db.insertFinanceSheetRow(sampleRow);
    await wait(50);

    const differentDesc: FinanceSheetRow = { ...sampleRow, transactionInfo: "ARBYS 0280" };
    const exists = await db.checkIfRowExists(differentDesc);
    expect(exists).toBe(false);
  });

  it("should correctly identify both ARBYS rows as distinct (the duplicate detection bug)", async () => {
    const arbys841: FinanceSheetRow = { ...sampleRow, amount: -8.41 };
    const arbys626: FinanceSheetRow = { ...sampleRow, amount: -6.26 };

    await db.insertFinanceSheetRow(arbys841);
    await db.insertFinanceSheetRow(arbys626);
    await wait(50);

    // Both rows exist independently
    expect(await db.checkIfRowExists(arbys841)).toBe(true);
    expect(await db.checkIfRowExists(arbys626)).toBe(true);
  });

  it("should not insert a duplicate row when the same row is inserted twice", async () => {
    await db.insertFinanceSheetRow(sampleRow);
    await wait(50);

    // Simulate what MultiFileUploader does: check before inserting
    const existsBeforeSecondInsert = await db.checkIfRowExists(sampleRow);
    expect(existsBeforeSecondInsert).toBe(true);

    // A second insert would be skipped in the app — verify checkIfRowExists
    // correctly gates it by returning true
    if (!existsBeforeSecondInsert) {
      await db.insertFinanceSheetRow(sampleRow);
    }
    await wait(50);

    const allRows = await db.getAllFinanceSheetRows();
    expect(allRows).toHaveLength(1);
  });
});

import { Rule } from "../WesterhamDatabase";

// ─── finance_sheet ────────────────────────────────────────────────────────────

describe("WesterhamDatabase - finance sheet (integration)", () => {
  let db: WesterhamDatabase;
  let dbPath: string;

  const row1: FinanceSheetRow = {
    epoch: new Date(2026, 0, 19).getTime(),
    amount: -8.41,
    source: "Capital One Credit",
    transactionInfo: "ARBYS 0279",
  };
  const row2: FinanceSheetRow = {
    epoch: new Date(2026, 1, 6).getTime(),
    amount: 225.69,
    source: "Capital One Credit",
    transactionInfo: "CAPITAL ONE AUTOPAY PYMT",
    category: "Payment",
    providedDetail: "autopay",
  };

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `westerham-test-${Date.now()}.db`);
    db = new WesterhamDatabase(dbPath);
    await wait(200);
  });

  afterEach(async () => {
    await db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  describe("insertFinanceSheetRow / getAllFinanceSheetRows", () => {
    it("should return empty array when no rows inserted", async () => {
      const rows = await db.getAllFinanceSheetRows();
      expect(rows).toHaveLength(0);
    });

    it("should persist a row and return it with all fields", async () => {
      await db.insertFinanceSheetRow(row2);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].epoch).toBe(row2.epoch);
      expect(rows[0].amount).toBe(row2.amount);
      expect(rows[0].transactionInfo).toBe(row2.transactionInfo);
      expect(rows[0].source).toBe(row2.source);
      expect(rows[0].category).toBe(row2.category);
      expect(rows[0].providedDetail).toBe(row2.providedDetail);
    });

    it("should assign a transactionId on insert", async () => {
      await db.insertFinanceSheetRow(row1);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      expect(rows[0].transactionId).toBeDefined();
      expect(Number(rows[0].transactionId)).toBeGreaterThan(0);
    });

    it("should persist multiple rows independently", async () => {
      await db.insertFinanceSheetRow(row1);
      await db.insertFinanceSheetRow(row2);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      expect(rows).toHaveLength(2);
    });
  });

  describe("getAllFinanceSheetRowsWhereColumnEmpty", () => {
    it("should return rows where category is null", async () => {
      await db.insertFinanceSheetRow(row1);         // no category
      await db.insertFinanceSheetRow(row2);         // has category
      await wait(50);

      const uncategorized = await db.getAllFinanceSheetRowsWhereColumnEmpty("category");
      expect(uncategorized).toHaveLength(1);
      expect(uncategorized[0].transactionInfo).toBe(row1.transactionInfo);
    });

    it("should return rows where provided_detail is null", async () => {
      await db.insertFinanceSheetRow(row1);         // no providedDetail
      await db.insertFinanceSheetRow(row2);         // has providedDetail
      await wait(50);

      const noDetail = await db.getAllFinanceSheetRowsWhereColumnEmpty("provided_detail");
      expect(noDetail).toHaveLength(1);
      expect(noDetail[0].transactionInfo).toBe(row1.transactionInfo);
    });

    it("should return empty array when all rows have the column populated", async () => {
      await db.insertFinanceSheetRow(row2);         // has both category and providedDetail
      await wait(50);

      const result = await db.getAllFinanceSheetRowsWhereColumnEmpty("category");
      expect(result).toHaveLength(0);
    });
  });

  describe("deleteFinanceSheetRow", () => {
    it("should remove the row by transactionId", async () => {
      await db.insertFinanceSheetRow(row1);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      const id = Number(rows[0].transactionId);

      await db.deleteFinanceSheetRow(id);
      await wait(50);

      const remaining = await db.getAllFinanceSheetRows();
      expect(remaining).toHaveLength(0);
    });

    it("should only delete the targeted row", async () => {
      await db.insertFinanceSheetRow(row1);
      await db.insertFinanceSheetRow(row2);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      const idToDelete = Number(rows[0].transactionId);

      await db.deleteFinanceSheetRow(idToDelete);
      await wait(50);

      const remaining = await db.getAllFinanceSheetRows();
      expect(remaining).toHaveLength(1);
      expect(Number(remaining[0].transactionId)).not.toBe(idToDelete);
    });
  });

  describe("updateFinanceSheetRow", () => {
    it("should update category on an existing row", async () => {
      await db.insertFinanceSheetRow(row1);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      const id = rows[0].transactionId!;

      await db.updateFinanceSheetRow(id, { category: "Dining" });
      await wait(50);

      const updated = await db.getAllFinanceSheetRows();
      expect(updated[0].category).toBe("Dining");
    });

    it("should update providedDetail on an existing row", async () => {
      await db.insertFinanceSheetRow(row1);
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      const id = rows[0].transactionId!;

      await db.updateFinanceSheetRow(id, { providedDetail: "fast food" });
      await wait(50);

      const updated = await db.getAllFinanceSheetRows();
      expect(updated[0].providedDetail).toBe("fast food");
    });

    it("should set a field to null when passed undefined", async () => {
      await db.insertFinanceSheetRow(row2);   // has category = "Payment"
      await wait(50);

      const rows = await db.getAllFinanceSheetRows();
      const id = rows[0].transactionId!;

      await db.updateFinanceSheetRow(id, { category: undefined });
      await wait(50);

      const updated = await db.getAllFinanceSheetRows();
      expect(updated[0].category).toBeNull();
    });
  });

  describe("getLastTransactionId", () => {
    it("should return null when table is empty", async () => {
      const id = await db.getLastTransactionId();
      expect(id).toBeNull();
    });

    it("should return the id of the most recently inserted row", async () => {
      await db.insertFinanceSheetRow(row1);
      await db.insertFinanceSheetRow(row2);
      await wait(50);

      const lastId = await db.getLastTransactionId();
      const rows = await db.getAllFinanceSheetRows();
      const maxId = Math.max(...rows.map(r => Number(r.transactionId)));
      expect(lastId).toBe(maxId);
    });
  });

  describe("getDistinctColumnValues - finance_sheet", () => {
    it("should return distinct sources", async () => {
      await db.insertFinanceSheetRow(row1);
      await db.insertFinanceSheetRow({ ...row1, source: "Wells Fargo Checking" });
      await db.insertFinanceSheetRow({ ...row1, source: "Capital One Credit" }); // duplicate source
      await wait(50);

      const sources = await db.getDistinctColumnValues("finance_sheet", "source");
      expect(sources).toHaveLength(2);
      expect(sources).toContain("Capital One Credit");
      expect(sources).toContain("Wells Fargo Checking");
    });

    it("should exclude null values from distinct results", async () => {
      await db.insertFinanceSheetRow(row1);   // category is null
      await db.insertFinanceSheetRow(row2);   // category = "Payment"
      await wait(50);

      const categories = await db.getDistinctColumnValues("finance_sheet", "category");
      expect(categories).toHaveLength(1);
      expect(categories).toContain("Payment");
    });
  });
});

// ─── rules ────────────────────────────────────────────────────────────────────

describe("WesterhamDatabase - rules (integration)", () => {
  let db: WesterhamDatabase;
  let dbPath: string;

  const rule1: Rule = {
    matchingExpression: "ARBYS",
    category: "Dining",
  };
  const rule2: Rule = {
    matchingExpression: "AMAZON",
    category: "Shopping",
    providedDetail: "online",
  };

  beforeEach(async () => {
    dbPath = path.join(os.tmpdir(), `westerham-test-${Date.now()}.db`);
    db = new WesterhamDatabase(dbPath);
    await wait(200);
  });

  afterEach(async () => {
    await db.close();
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  });

  describe("insertRule / getAllRules", () => {
    it("should return empty array when no rules inserted", async () => {
      const rules = await db.getAllRules();
      expect(rules).toHaveLength(0);
    });

    it("should persist a rule and return it with all fields", async () => {
      await db.insertRule(rule2);

      const rules = await db.getAllRules();
      expect(rules).toHaveLength(1);
      expect(rules[0].matchingExpression).toBe(rule2.matchingExpression);
      expect(rules[0].category).toBe(rule2.category);
      expect(rules[0].providedDetail).toBe(rule2.providedDetail);
    });

    it("should assign a ruleId on insert", async () => {
      await db.insertRule(rule1);

      const rules = await db.getAllRules();
      expect(rules[0].ruleId).toBeDefined();
      expect(Number(rules[0].ruleId)).toBeGreaterThan(0);
    });

    it("should persist multiple rules independently", async () => {
      await db.insertRule(rule1);
      await db.insertRule(rule2);

      const rules = await db.getAllRules();
      expect(rules).toHaveLength(2);
    });
  });

  describe("deleteRule", () => {
    it("should remove the rule by ruleId", async () => {
      await db.insertRule(rule1);

      const rules = await db.getAllRules();
      const id = Number(rules[0].ruleId);

      await db.deleteRule(id);

      const remaining = await db.getAllRules();
      expect(remaining).toHaveLength(0);
    });

    it("should only delete the targeted rule", async () => {
      await db.insertRule(rule1);
      await db.insertRule(rule2);

      const rules = await db.getAllRules();
      const idToDelete = Number(rules[0].ruleId);

      await db.deleteRule(idToDelete);

      const remaining = await db.getAllRules();
      expect(remaining).toHaveLength(1);
      expect(Number(remaining[0].ruleId)).not.toBe(idToDelete);
    });
  });

  describe("getLastRuleId", () => {
    it("should return null when no rules exist", async () => {
      const id = await db.getLastRuleId();
      expect(id).toBeNull();
    });

    it("should return the id of the most recently inserted rule", async () => {
      await db.insertRule(rule1);
      await db.insertRule(rule2);

      const lastId = await db.getLastRuleId();
      const rules = await db.getAllRules();
      const maxId = Math.max(...rules.map(r => Number(r.ruleId)));
      expect(lastId).toBe(maxId);
    });
  });

  describe("updateRuleRow", () => {
    it("should update category on an existing rule", async () => {
      await db.insertRule(rule1);

      const rules = await db.getAllRules();
      const id = rules[0].ruleId!;

      await db.updateRuleRow(id, { category: "Fast Food" });

      const updated = await db.getAllRules();
      expect(updated[0].category).toBe("Fast Food");
    });

    it("should update matchingExpression on an existing rule", async () => {
      await db.insertRule(rule1);

      const rules = await db.getAllRules();
      const id = rules[0].ruleId!;

      await db.updateRuleRow(id, { matchingExpression: "ARBYS.*" });

      const updated = await db.getAllRules();
      expect(updated[0].matchingExpression).toBe("ARBYS.*");
    });

    it("should set providedDetail to null when passed undefined", async () => {
      await db.insertRule(rule2);   // has providedDetail = "online"

      const rules = await db.getAllRules();
      const id = rules[0].ruleId!;

      await db.updateRuleRow(id, { providedDetail: undefined });

      const updated = await db.getAllRules();
      expect(updated[0].providedDetail).toBeNull();
    });
  });

  describe("getDistinctColumnValues - rules", () => {
    it("should return distinct categories from rules table", async () => {
      await db.insertRule(rule1);                              // Dining
      await db.insertRule(rule2);                              // Shopping
      await db.insertRule({ ...rule1, matchingExpression: "WENDYS" }); // Dining again

      const categories = await db.getDistinctColumnValues("rules", "category");
      expect(categories).toHaveLength(2);
      expect(categories).toContain("Dining");
      expect(categories).toContain("Shopping");
    });
  });
});
