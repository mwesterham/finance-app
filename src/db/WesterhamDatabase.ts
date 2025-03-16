import sqlite3 from 'sqlite3';

export enum WesterhamDatabaseEnum {
  MATTHEW = 'matthew.db'
}

export interface FinanceSheetRow {
  transactionId?: string; // not needed when inserting since created when entered into db
  epoch: number;
  amount: number;
  transactionInfo: string;
  category?: number;
  providedDetail?: string;
  payee?: string;
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
        category INTEGER,
        provided_detail TEXT,
        payee TEXT
    );`;

    this.db.exec(queries, (err) => {
      if (err) {
        console.error("Error creating tables:", err);
      } else {
        console.log(`Created to local database table: ${this.FINANCE_TABLE_NAME}`);
      }
    });
  }

  public insertIntoTable(table: string, columns: string[], values: any[]) {
    const placeholders = values.map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

    this.db.run(query, values, (err) => {
      if (err) {
        console.error(`Error inserting into ${table}:`, err);
      } else {
        console.error(`Successfully inserted into ${table}. Data{ col: ${columns}; val: ${values}}`);
      }
    });
  }

  public insertFinanceSheetRow(row: FinanceSheetRow) {
    const query = `INSERT INTO ${this.FINANCE_TABLE_NAME} (epoch, amount, transaction_info, category, provided_detail, payee) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
    const values = [row.epoch, row.amount, row.transactionInfo, row.category || null, row.providedDetail || null, row.payee || null];

    this.db.run(query, values, (err) => {
      if (err) {
        console.error("Error inserting FinanceSheetRow:", err);
      } else {
        console.log(`Successfully inserting into ${this.FINANCE_TABLE_NAME}. FinanceSheetRow{ ${values}}`);
      }
    });
  }

  public async getAllFinanceSheetRows(): Promise<FinanceSheetRow[]> {
    return new Promise((resolve, reject) => {
      const query = `SELECT transaction_id AS transactionId, epoch, amount, transaction_info AS transactionInfo, category, provided_detail AS providedDetail, payee FROM ${this.FINANCE_TABLE_NAME}`;
      this.db.all(query, [], (err, rows) => {
        if (err) {
          reject("Error fetching FinanceSheetRows: " + err);
        } else {
          resolve(rows as FinanceSheetRow[]);
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

  public getDbPath(): string {
    return this.dbPath;
  }
}
