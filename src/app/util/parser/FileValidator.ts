/**
 * FileValidator compares the header row of an actual CSV file against an expected
 * example file. On mismatch it logs both header sets to the console and returns a
 * structured result so the caller can surface the error however it sees fit.
 */

export interface FileValidationResult {
  valid: boolean;
  expectedHeaders: string[];
  actualHeaders: string[];
}

export class FileValidator {
  private expectedFile: string;
  private actualFile: string;

  constructor(expectedFile: string, actualFile: string) {
    this.expectedFile = expectedFile;
    this.actualFile = actualFile;
  }

  /**
   * Extracts the first non-empty line of a CSV string and splits it into column
   * names. Handles both quoted ("col1","col2") and unquoted (col1,col2) headers.
   */
  private extractHeaders(csv: string): string[] {
    const firstLine =
      csv.split(/\r?\n/).find(line => line.trim().length > 0) ?? "";

    // Strip surrounding quotes from each field produced by a naive comma-split.
    return firstLine.split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  }

  /**
   * Validates that the actual file's headers match the expected file's headers.
   *
   * @returns A FileValidationResult with `valid: true` on match, or `valid: false`
   *          plus both header arrays on mismatch so the caller can display them.
   */
  validateFile(): FileValidationResult {
    const expectedHeaders = this.extractHeaders(this.expectedFile);
    const actualHeaders = this.extractHeaders(this.actualFile);

    const valid =
      expectedHeaders.length === actualHeaders.length &&
      expectedHeaders.every((h, i) => h === actualHeaders[i]);

    if (!valid) {
      console.error(
        "[FileValidator] Header mismatch detected!\n" +
          `  Expected headers: ${JSON.stringify(expectedHeaders)}\n` +
          `  Actual headers:   ${JSON.stringify(actualHeaders)}`
      );
    }

    return { valid, expectedHeaders, actualHeaders };
  }
}
