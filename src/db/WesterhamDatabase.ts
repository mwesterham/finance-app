import sqlite3 from 'sqlite3';

export enum WesterhamDatabaseEnum {
  MATTHEW = 'matthew.db'
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

export class WesterhamDatabase {
  private dbPath: string;
  private db: sqlite3.Database;
  private FINANCE_TABLE_NAME = "finance_sheet";

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
    );`;

    this.db.exec(queries, (err) => {
      if (err) {
        console.error("Error creating tables:", err);
      } else {
        console.log(`Created to local database table: ${this.FINANCE_TABLE_NAME}`);
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
      // Prepare update query based on provided updated fields
      const setStatements = Object.keys(updatedRow)
        .map(key => `${key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()} = ?`)
        .join(', ');
      
      const values = [...Object.values(updatedRow), transactionId];
      const query = `UPDATE ${this.FINANCE_TABLE_NAME} SET ${setStatements} WHERE transaction_id = ?`;

      this.db.run(query, values, function (err) {
        if (err) {
          reject(`Error updating FinanceSheetRow: ${err}`);
        } else {
          resolve();
          console.log(`Successfully updated row with transaction_id = ${transactionId}`);
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
}
