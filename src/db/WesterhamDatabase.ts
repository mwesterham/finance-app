import sqlite3 from 'sqlite3';

export enum DatabaseName {
  DEFAULT = "default.db"
}

export interface FinanceSheetRow {
  transactionId?: string; // not needed when inserting since created when entered into db
  epoch: number;
  amount: number;
  source: string;
  transactionInfo: string;
  category?: string;
  providedDetail?: string;
}

export interface Rule {
  ruleId?: string;
  matchingExpression: string;
  category: string;
  providedDetail?: string;
}

export class WesterhamDatabase {
  private dbPath: string;
  private db: sqlite3.Database;
  private FINANCE_TABLE_NAME = "finance_sheet";
  private RULES_TABLE_NAME = "rules";

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err && err.message === "SQLITE_CANTOPEN: unable to open database file") {
        this.createDatabase(dbPath);
      } else if (err) {
        console.error("Database connection error:", err.message);
      } else {
        console.log(`Connected to local database (${dbPath})`);
      }
    });
  }

  private createDatabase(dbPath: string) {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error creating database:", err);
      } else {
        console.log(`Created local database (${dbPath})`);
        this.createTables();
      }
    });
  }

  private createTables() {
    const queries = `
    CREATE TABLE IF NOT EXISTS ${this.FINANCE_TABLE_NAME} (
        transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
        epoch INTEGER NOT NULL,
        amount REAL NOT NULL,
        transaction_info TEXT NOT NULL,
        source TEXT NOT NULL,
        category TEXT,
        provided_detail TEXT
    );

    CREATE TABLE IF NOT EXISTS ${this.RULES_TABLE_NAME} (
        rule_id INTEGER PRIMARY KEY AUTOINCREMENT,
        matching_expression TEXT NOT NULL,
        category TEXT NOT NULL,
        provided_detail TEXT
    );`;

    this.db.exec(queries, (err) => {
      if (err) {
        console.error("Error creating tables:", err);
      } else {
        console.log(`Created tables: ${this.FINANCE_TABLE_NAME}, ${this.RULES_TABLE_NAME}`);
      }
    });
  }

  public async insertIntoTable(table: string, columns: string[], values: any[]) {
    const placeholders = values.map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    await this.db.run(query, values, (err) => {
      if (err) {
        console.error(`Error inserting into ${table}:`, err);
      } else {
        console.log(`Successfully inserted into ${table}. Data{ col: ${columns}; val: ${values}}`);
      }
    });
  }

  public async insertFinanceSheetRow(row: FinanceSheetRow) {
    const query = `INSERT INTO ${this.FINANCE_TABLE_NAME} (epoch, amount, transaction_info, source, category, provided_detail) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [row.epoch, row.amount, row.transactionInfo, row.source, row.category || null, row.providedDetail || null];

    await this.db.run(query, values, (err) => {
      if (err) {
        console.error("Error inserting FinanceSheetRow:", err);
      } else {
        console.log(`Successfully inserting into ${this.FINANCE_TABLE_NAME}. FinanceSheetRow{ ${values} }`);
      }
    });
  }

  public async insertRule(rule: Rule) {
    const query = `INSERT INTO ${this.RULES_TABLE_NAME} (matching_expression, category, provided_detail) VALUES (?, ?, ?)`;
    const values = [rule.matchingExpression, rule.category, rule.providedDetail || null];

    return new Promise<void>((resolve, reject) => {
      this.db.run(query, values, (err) => {
        if (err) {
          reject("Error inserting rule: " + err);
        } else {
          console.log(`Successfully inserted rule: ${JSON.stringify(rule)}`);
          resolve();
        }
      });
    });
  }

  public async getAllRules(): Promise<Rule[]> {
    const query = `SELECT rule_id AS ruleId, matching_expression AS matchingExpression, category, provided_detail AS providedDetail FROM ${this.RULES_TABLE_NAME}`;

    return new Promise((resolve, reject) => {
      this.db.all<Rule>(query, [], (err, rows) => {
        if (err) {
          reject("Error fetching rules: " + err);
        } else {
          console.log(`Successfully fetched all rules`);
          resolve(rows);
        }
      });
    });
  }

  public async deleteRule(ruleId: number): Promise<void> {
    const query = `DELETE FROM ${this.RULES_TABLE_NAME} WHERE rule_id = ?`;

    return new Promise((resolve, reject) => {
      this.db.run(query, [ruleId], (err) => {
        if (err) {
          reject("Error deleting rule: " + err);
        } else {
          console.log(`Successfully deleted rule with ruleId = ${ruleId}`);
          resolve();
        }
      });
    });
  }

  public getLastRuleId(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT MAX(rule_id) AS lastRuleId FROM ${this.RULES_TABLE_NAME}`;

      this.db.get<{ lastRuleId: number }>(query, [], (err, row) => {
        if (err) {
          reject("Error fetching last transaction_id: " + err);
        } else {
          resolve(row?.lastRuleId ?? null); // Return the last rule_id or null if not found
          console.log(`Successfully fetched last rule_id: ${row?.lastRuleId}`);
        }
      });
    });
  }

  public async updateRuleRow(ruleId: string, updatedRule: Partial<Rule>): Promise<void> {
    return new Promise((resolve, reject) => {
      const setStatements: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(updatedRule)) {
        const columnName = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        if (value === null || value === undefined) {
          setStatements.push(`${columnName} = NULL`);
        } else {
          setStatements.push(`${columnName} = ?`);
          values.push(value);
        }
      }

      const query = `UPDATE ${this.RULES_TABLE_NAME} SET ${setStatements.join(', ')} WHERE rule_id = ?`;
      values.push(ruleId);

      this.db.run(query, values, function (err) {
        if (err) {
          reject(`Error updating RuleRow: ${err}`);
        } else {
          console.log(`Successfully updated row with rule_id = ${ruleId}`);
          resolve();
        }
      });
    });
  }

  public async getAllFinanceSheetRows(): Promise<FinanceSheetRow[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT transaction_id AS transactionId, epoch, amount, transaction_info AS transactionInfo, source, category, provided_detail AS providedDetail FROM ${this.FINANCE_TABLE_NAME}`;
      this.db.all<FinanceSheetRow>(query, [], (err, rows) => {
        if (err) {
          reject("Error fetching FinanceSheetRows: " + err);
        } else {
          resolve(rows);
          console.log(`Successfully returned all rows from ${this.FINANCE_TABLE_NAME}`);
        }
      });
    });
  }

  public async getAllFinanceSheetRowsWhereColumnEmpty(col: string): Promise<FinanceSheetRow[]> {
    return new Promise((resolve, reject) => {
      // Sanitize column name by allowing only alphanumeric + underscore characters
      const sanitizedCol = col.replace(/[^a-zA-Z0-9_]/g, '');

      const query = `
        SELECT 
          transaction_id AS transactionId, 
          epoch, 
          amount, 
          transaction_info AS transactionInfo, 
          source, 
          category, 
          provided_detail AS providedDetail 
        FROM ${this.FINANCE_TABLE_NAME}
        WHERE ${sanitizedCol} IS NULL
      `;

      this.db.all<FinanceSheetRow>(query, [], (err, rows) => {
        if (err) {
          reject("Error fetching FinanceSheetRows: " + err);
        } else {
          console.log(`Successfully returned rows with NULL '${sanitizedCol}' from ${this.FINANCE_TABLE_NAME}`);
          resolve(rows);
        }
      });
    });
  }

  public async deleteFinanceSheetRow(transactionId: number): Promise<void> {
    const query = `DELETE FROM ${this.FINANCE_TABLE_NAME} WHERE transaction_id = ?`;
    return new Promise((resolve, reject) => {
      this.db.run(query, [transactionId], (err) => {
        if (err) {
          reject("Error deleting FinanceSheetRow: " + err);
        } else {
          resolve();
          console.log(`Successfully deleted transactionId (${transactionId}) from ${this.FINANCE_TABLE_NAME}`);
        }
      });
    });
  }

  public async checkIfRowExists(row: FinanceSheetRow): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const query = `SELECT COUNT(*) AS count FROM ${this.FINANCE_TABLE_NAME} WHERE epoch = ? AND amount = ? AND transaction_info = ?`;
      const values = [row.epoch, row.amount, row.transactionInfo];

      this.db.get<{ count: number }>(query, values, (err, rowCount) => {
        if (err) {
          reject("Error checking if row exists: " + err);
        } else {
          const found = rowCount.count != 0;
          resolve(found);
          console.log(`Checked existence of row: ${values}. Exists: ${found}. Found ${rowCount.count}`);
        }
      });
    });
  }

  public getDbPath(): string {
    return this.dbPath;
  }

  public async updateFinanceSheetRow(transactionId: string, updatedRow: Partial<FinanceSheetRow>): Promise<void> {
    return new Promise((resolve, reject) => {
      const setStatements: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(updatedRow)) {
        const columnName = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
        if (value === null || value === undefined) {
          setStatements.push(`${columnName} = NULL`);
        } else {
          setStatements.push(`${columnName} = ?`);
          values.push(value);
        }
      }

      const query = `UPDATE ${this.FINANCE_TABLE_NAME} SET ${setStatements.join(', ')} WHERE transaction_id = ?`;
      values.push(transactionId);

      this.db.run(query, values, function (err) {
        if (err) {
          reject(`Error updating FinanceSheetRow: ${err}`);
        } else {
          console.log(`Successfully updated row with transaction_id = ${transactionId}`);
          resolve();
        }
      });
    });
  }

  public getLastTransactionId(): Promise<number | null> {
    return new Promise((resolve, reject) => {
      const query = `SELECT MAX(transaction_id) AS lastTransactionId FROM ${this.FINANCE_TABLE_NAME}`;

      this.db.get<{ lastTransactionId: number }>(query, [], (err, row) => {
        if (err) {
          reject("Error fetching last transaction_id: " + err);
        } else {
          resolve(row?.lastTransactionId ?? null); // Return the last transaction_id or null if not found
          console.log(`Successfully fetched last transaction_id: ${row?.lastTransactionId}`);
        }
      });
    });
  }

  public async getDistinctColumnValues(table: 'finance_sheet' | 'rules', column: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      // Sanitize table and column names
      const allowedTables = [this.FINANCE_TABLE_NAME, this.RULES_TABLE_NAME];
      const sanitizedTable = allowedTables.includes(table) ? table : this.FINANCE_TABLE_NAME;
      const sanitizedColumn = column.replace(/[^a-zA-Z0-9_]/g, '');
  
      const query = `SELECT DISTINCT ${sanitizedColumn} FROM ${sanitizedTable} WHERE ${sanitizedColumn} IS NOT NULL`;
  
      this.db.all<{ [key: string]: string }>(query, [], (err, rows) => {
        if (err) {
          reject(`Error fetching distinct values for column '${sanitizedColumn}' in table '${sanitizedTable}': ${err}`);
        } else {
          const values = rows.map((row) => row[sanitizedColumn]);
          resolve(values);
          console.log(`Fetched ${values.length} unique values from '${sanitizedColumn}' in '${sanitizedTable}'`);
        }
      });
    });
  }
}
