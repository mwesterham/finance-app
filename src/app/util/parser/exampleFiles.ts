/**
 * Canonical first-row header strings for each supported CSV format.
 * These are used by FileValidator to detect when an uploaded file does not
 * match the expected format for a given parser.
 *
 * Only the header row is needed — the validator only compares the first line.
 */

export const WELLS_FARGO_CHECKING_EXAMPLE =
  `"DATE","DESCRIPTION","AMOUNT","CHECK #","STATUS"`;

export const WELLS_FARGO_CREDIT_EXAMPLE =
  `"DATE","DESCRIPTION","AMOUNT","CHECK #","STATUS"`;

export const CAPITAL_ONE_CREDIT_EXAMPLE =
  `Transaction Date,Posted Date,Card No.,Description,Category,Debit,Credit`;

// Amex exports have no header row — the first row is already data.
// We use the first data row's column count (3 columns) as the "expected" shape.
// Provide a representative first row so the validator can compare column count.
export const AMEX_CREDIT_EXAMPLE =
  `01/01/2024,Sample Merchant,12.34`;

export const VENMO_EXAMPLE =
  `ID,Datetime,Type,Status,Note,From,To,Amount (total),Amount (tip),Amount (tax),Amount (fee),Funding Source,Destination,Beginning Balance,Ending Balance,Statement Period Venmo Fees,Terminal Location,Year to Date Venmo Fees,Disclaimer`;

export const DISCOVER_EXAMPLE =
  `Trans. Date,Post Date,Description,Amount,Category`;

export const EXPORT_EXAMPLE =
  `ID,Date,Amount,Transaction Info,Source,Category,Provided Detail`;

export const RULES_EXPORT_EXAMPLE =
  `ID,Matching Expression,Category,Provided Detail`;

// Snapshot parsers share the same column layout regardless of account type.
export const MATTHEW_SNAPSHOT_EXAMPLE =
  `ID,Name,Date,Amount,Balance,Category,User Detail,Notes,Transaction Notes`;
