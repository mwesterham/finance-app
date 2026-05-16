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

export interface FileValidatorOptions {
  /**
   * Zero-based line index of the header row in the ACTUAL file.
   * Defaults to 0 (first non-empty line).
   * Use this for files like Venmo statements where metadata rows precede the header.
   * The expected file is always read from its first non-empty line.
   */
  headerLineIndex?: number;
}

export class FileValidator {
  private expectedFile: string;
  private actualFile: string;
  private headerLineIndex: number;

  constructor(
    expectedFile: string,
    actualFile: string,
    options: FileValidatorOptions = {}
  ) {
    this.expectedFile = expectedFile;
    this.actualFile = actualFile;
    this.headerLineIndex = options.headerLineIndex ?? 0;
  }

  /**
   * Extracts the first non-empty line from a CSV string and splits it into
   * column names. Strips surrounding quotes from each field.
   */
  private extractExpectedHeaders(): string[] {
    const line =
      this.expectedFile.split(/\r?\n/).find(l => l.trim().length > 0) ?? "";
    return line.split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  }

  /**
   * Extracts the header line from the actual file at `headerLineIndex`.
   * When headerLineIndex is 0 it finds the first non-empty line; otherwise
   * it indexes directly into the raw line array.
   */
  private extractActualHeaders(): string[] {
    const lines = this.actualFile.split(/\r?\n/);
    const line =
      this.headerLineIndex === 0
        ? (lines.find(l => l.trim().length > 0) ?? "")
        : (lines[this.headerLineIndex] ?? "");
    return line.split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  }

  /**
   * Validates that the actual file's headers match the expected file's headers.
   *
   * @returns A FileValidationResult with `valid: true` on match, or `valid: false`
   *          plus both header arrays on mismatch so the caller can display them.
   */
  validateFile(): FileValidationResult {
    const expectedHeaders = this.extractExpectedHeaders();
    const actualHeaders = this.extractActualHeaders();

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
