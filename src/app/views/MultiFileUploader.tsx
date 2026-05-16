import { useRef, useState } from "react";
import CheckingParser from "../util/parser/CheckingParser";
import CreditParser from "../util/parser/CreditParser";
import VenmoParser from "../util/parser/VenmoParser";
import MatthewCheckingSnapshotParser from "../util/parser/MatthewCheckingSnapshotParser";
import MatthewCreditSnapshotParser from "../util/parser/MatthewCreditSnapshotParser";
import MatthewVenmoSnapshotParser from "../util/parser/MatthewVenmoSnapshotParser";
import DatabaseService from "../util/DatabaseService";
import DiscoverParser from "../util/parser/DiscoverParser";
import ExportParser from "../util/parser/ExportParser";
import RulesExportsParser from "../util/parser/RulesExportsParser";
import { FinanceSheetRow } from "../../db/WesterhamDatabase";
import CapitalOneCreditParser from "../util/parser/CapitalOneCreditParser";
import AmexCreditParser from "../util/parser/AmexCreditParserParser";
import {
  WELLS_FARGO_CHECKING_EXAMPLE,
  WELLS_FARGO_CREDIT_EXAMPLE,
  CAPITAL_ONE_CREDIT_EXAMPLE,
  AMEX_CREDIT_EXAMPLE,
  VENMO_EXAMPLE,
  DISCOVER_EXAMPLE,
  EXPORT_EXAMPLE,
  RULES_EXPORT_EXAMPLE,
  MATTHEW_SNAPSHOT_EXAMPLE,
} from "../util/parser/exampleFiles";
import { FileValidator } from "../util/parser/FileValidator";
import HeaderMismatchModal from "../components/HeaderMismatchModal";

export interface LabeledFile {
  file: File;
  label: InputFileLabel;
  identifier: string;
}

export enum InputFileLabel {
  WELLS_FARGO_CHECKING = "Wells Fargo Checking",
  WELLS_FARGO_CREDIT = "Wells Fargo Credit",
  CAPITAL_ONE_CREDIT = "Capital One Credit",
  AMEX_CREDIT = "Amex Credit",
  VENMO = "Venmo",
  MATTHEW_SNAPSHOT_CHECKING = "Wells Fargo Checking Snapshot",
  MATTHEW_SNAPSHOT_CREDIT = "Wells Fargo Credit Snapshot",
  MATTHEW_SNAPSHOT_VENMO = "Venmo Snapshot",
  DISCOVER = "Discover",
  EXPORT = "Transactions Exported",
  RULES_EXPORT = "Rules Exported",
}

interface MultiFileUploaderProps { }

export default function MultiFileUploader(props: MultiFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<LabeledFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerMismatch, setHeaderMismatch] = useState<{
    fileName: string;
    expectedHeaders: string[];
    actualHeaders: string[];
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        label: getRecommendedFileType(file.name),
        identifier: "",
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleIdentifierChange = (index: number, newIdentifier: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, identifier: newIdentifier } : file
      )
    );
  };

  const handleLabelChange = (index: number, newLabel: InputFileLabel) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, label: newLabel } : file
      )
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleMultiFileSubmit = async (files: LabeledFile[]) => {
    setIsSubmitting(true); // Show modal and block UI
    try {
      for (const { file, label, identifier } of files) {
        const text = await file.text();

        // Determine the expected header for this label.
        const expectedFileMap: Partial<Record<InputFileLabel, string>> = {
          [InputFileLabel.WELLS_FARGO_CHECKING]: WELLS_FARGO_CHECKING_EXAMPLE,
          [InputFileLabel.WELLS_FARGO_CREDIT]: WELLS_FARGO_CREDIT_EXAMPLE,
          [InputFileLabel.VENMO]: VENMO_EXAMPLE,
          [InputFileLabel.CAPITAL_ONE_CREDIT]: CAPITAL_ONE_CREDIT_EXAMPLE,
          [InputFileLabel.AMEX_CREDIT]: AMEX_CREDIT_EXAMPLE,
          [InputFileLabel.MATTHEW_SNAPSHOT_VENMO]: MATTHEW_SNAPSHOT_EXAMPLE,
          [InputFileLabel.MATTHEW_SNAPSHOT_CREDIT]: MATTHEW_SNAPSHOT_EXAMPLE,
          [InputFileLabel.MATTHEW_SNAPSHOT_CHECKING]: MATTHEW_SNAPSHOT_EXAMPLE,
          [InputFileLabel.DISCOVER]: DISCOVER_EXAMPLE,
          [InputFileLabel.EXPORT]: EXPORT_EXAMPLE,
          [InputFileLabel.RULES_EXPORT]: RULES_EXPORT_EXAMPLE,
        };

        const expectedFile = expectedFileMap[label];
        if (expectedFile) {
          const validation = new FileValidator(expectedFile, text).validateFile();
          if (!validation.valid) {
            setHeaderMismatch({
              fileName: file.name,
              expectedHeaders: validation.expectedHeaders,
              actualHeaders: validation.actualHeaders,
            });
            setIsSubmitting(false);
            return; // Stop processing all files on first mismatch
          }
        }

        let rows: FinanceSheetRow[] | undefined;

        switch (label) {
          case InputFileLabel.WELLS_FARGO_CHECKING:
            rows = new CheckingParser(WELLS_FARGO_CHECKING_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.WELLS_FARGO_CREDIT:
            rows = new CreditParser(WELLS_FARGO_CREDIT_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.VENMO:
            rows = new VenmoParser(VENMO_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.CAPITAL_ONE_CREDIT:
            rows = new CapitalOneCreditParser(CAPITAL_ONE_CREDIT_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.AMEX_CREDIT:
            rows = new AmexCreditParser(AMEX_CREDIT_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.MATTHEW_SNAPSHOT_VENMO:
            rows = new MatthewVenmoSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({
              text,
              label: InputFileLabel.VENMO,
            });
            break;
          case InputFileLabel.MATTHEW_SNAPSHOT_CREDIT:
            rows = new MatthewCreditSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({
              text,
              label: InputFileLabel.WELLS_FARGO_CREDIT,
            });
            break;
          case InputFileLabel.MATTHEW_SNAPSHOT_CHECKING:
            rows = new MatthewCheckingSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({
              text,
              label: InputFileLabel.WELLS_FARGO_CHECKING,
            });
            break;
          case InputFileLabel.DISCOVER:
            rows = new DiscoverParser(DISCOVER_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.EXPORT:
            rows = new ExportParser(EXPORT_EXAMPLE, text).toFinanceRows(text);
            break;
          case InputFileLabel.RULES_EXPORT:
            const rules = new RulesExportsParser(RULES_EXPORT_EXAMPLE, text).parse(text);
            await DatabaseService.writeRuleToDatabase({ rules });
            continue;
          default:
            console.log(`Invalid label ${label}`);
            continue;
        }

        if (rows) {
          const fullSource =
            identifier && identifier.length > 0 ? `${label} | ${identifier}` : label;
          rows = rows.map((row) => ({
            ...row,
            source: fullSource,
          }));

          // 🔹 Wrap DB write with loading modal state
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false); // Hide modal after all operations
    }
  };

  const handleSubmit = () => {
    handleMultiFileSubmit(files);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRecommendedFileType = (fileName: string): InputFileLabel => {
    const lower = fileName.toLowerCase();
    if (lower.includes("checking")) return InputFileLabel.WELLS_FARGO_CHECKING;
    if (lower.includes("credit")) return InputFileLabel.WELLS_FARGO_CREDIT;
    if (lower.includes("venmo")) return InputFileLabel.VENMO;
    if (lower.includes("_transaction_download")) return InputFileLabel.CAPITAL_ONE_CREDIT;
    if (lower.includes("discover")) return InputFileLabel.DISCOVER;
    if (lower.includes("activity.csv")) return InputFileLabel.AMEX_CREDIT;
    if (lower.includes("finance_app-transactions") || lower.includes("finance_app-filtered-transactions")) return InputFileLabel.EXPORT;
    if (lower.includes("finance_app-rules")) return InputFileLabel.RULES_EXPORT;
    return InputFileLabel.WELLS_FARGO_CHECKING;
  };

  return (
    <>
      {headerMismatch && (
        <HeaderMismatchModal
          fileName={headerMismatch.fileName}
          expectedHeaders={headerMismatch.expectedHeaders}
          actualHeaders={headerMismatch.actualHeaders}
          onClose={() => setHeaderMismatch(null)}
        />
      )}

      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
            <span className="mt-2 text-white font-semibold">Submitting...</span>
          </div>
        </div>
      )}

      <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
        <label className="font-semibold block">Import Files</label>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="block w-full border p-2 rounded"
        />

        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center gap-2 border p-2 rounded-lg">
              <button
                onClick={() => handleRemoveFile(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                X
              </button>
              <select
                value={file.label}
                onChange={(e) => handleLabelChange(index, e.target.value as InputFileLabel)}
                className="p-1 border rounded-md"
              >
                {Object.values(InputFileLabel).map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                disabled={file.label === InputFileLabel.RULES_EXPORT}
                type="text"
                value={file.identifier || ""}
                onChange={(e) => handleIdentifierChange(index, e.target.value)}
                placeholder="Source Id (optional)"
                className="p-1 border rounded-md"
              />
              <span className="truncate">{file.file.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </>
  );
}
