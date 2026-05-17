import { useEffect, useRef, useState } from "react";
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
import { FinanceSheetRow, FileType } from "../../db/WesterhamDatabase";
import CapitalOneCreditParser from "../util/parser/CapitalOneCreditParser";
import AmexCreditParser from "../util/parser/AmexCreditParserParser";
import ChaseCheckingParser from "../util/parser/ChaseCheckingParser";
import ChaseCreditParser from "../util/parser/ChaseCreditParser";
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
  CHASE_CHECKING_EXAMPLE,
  CHASE_CREDIT_EXAMPLE,
} from "../util/parser/exampleFiles";
import { FileValidator } from "../util/parser/FileValidator";
import HeaderMismatchModal from "../components/HeaderMismatchModal";

export interface LabeledFile {
  file: File;
  parserKey: ParserKey;
  identifier: string;
}

/**
 * Each value is the parser class name used in the switch statement.
 * This is what gets stored in FileType.parserKey.
 */
export enum ParserKey {
  CHECKING_PARSER            = "Wells Fargo Checking",
  CREDIT_PARSER              = "Wells Fargo Credit",
  CAPITAL_ONE_CREDIT_PARSER  = "Capital One Credit",
  AMEX_CREDIT_PARSER         = "Amex Credit",
  VENMO_PARSER               = "Venmo",
  MATTHEW_SNAPSHOT_CHECKING  = "Wells Fargo Checking Snapshot",
  MATTHEW_SNAPSHOT_CREDIT    = "Wells Fargo Credit Snapshot",
  MATTHEW_SNAPSHOT_VENMO     = "Venmo Snapshot",
  DISCOVER_PARSER            = "Discover",
  EXPORT_PARSER              = "Transactions Exported",
  RULES_EXPORT_PARSER        = "Rules Exported",
  CHASE_CHECKING_PARSER      = "Chase Checking",
  CHASE_CREDIT_PARSER        = "Chase Credit",
}

interface MultiFileUploaderProps {}

export default function MultiFileUploader(_props: MultiFileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<LabeledFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerMismatch, setHeaderMismatch] = useState<{
    fileName: string;
    expectedHeaders: string[];
    actualHeaders: string[];
  } | null>(null);
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);

  useEffect(() => {
    DatabaseService.readFileTypes().then((result) => {
      setFileTypes(result.fileTypes);
    });
  }, []);

  /**
   * Returns the first matching ParserKey from the user-configured file types,
   * falling back to CHECKING_PARSER if nothing matches.
   */
  const getRecommendedParserKey = (fileName: string): ParserKey => {
    const lower = fileName.toLowerCase();
    for (const ft of fileTypes) {
      if (lower.includes(ft.filenamePattern.toLowerCase())) {
        if (Object.values(ParserKey).includes(ft.parserKey as ParserKey)) {
          return ft.parserKey as ParserKey;
        }
      }
    }
    return ParserKey.CHECKING_PARSER;
  };

  /**
   * Returns the default source ID from the matching file type config.
   */
  const getAutoSourceId = (fileName: string, parserKey: ParserKey): string => {
    const lower = fileName.toLowerCase();
    for (const ft of fileTypes) {
      if (lower.includes(ft.filenamePattern.toLowerCase()) && ft.parserKey === parserKey) {
        return ft.defaultSourceId ?? "";
      }
    }
    const byKey = fileTypes.find((ft) => ft.parserKey === parserKey);
    return byKey?.defaultSourceId ?? "";
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => {
        const parserKey = getRecommendedParserKey(file.name);
        return {
          file,
          parserKey,
          identifier: getAutoSourceId(file.name, parserKey),
        };
      });
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

  const handleParserKeyChange = (index: number, newKey: ParserKey) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) => {
        if (i !== index) return file;
        const autoId = getAutoSourceId(file.file.name, newKey);
        return {
          ...file,
          parserKey: newKey,
          identifier: autoId !== "" ? autoId : file.identifier,
        };
      })
    );
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleMultiFileSubmit = async (filesToSubmit: LabeledFile[]) => {
    setIsSubmitting(true);
    try {
      for (const { file, parserKey, identifier } of filesToSubmit) {
        const text = await file.text();
        let rows: FinanceSheetRow[] | undefined;

        switch (parserKey) {
          case ParserKey.CHECKING_PARSER: {
            const validation = new FileValidator(WELLS_FARGO_CHECKING_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new CheckingParser(WELLS_FARGO_CHECKING_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.CREDIT_PARSER: {
            const validation = new FileValidator(WELLS_FARGO_CREDIT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new CreditParser(WELLS_FARGO_CREDIT_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.VENMO_PARSER: {
            const validation = new FileValidator(VENMO_EXAMPLE, text, { headerLineIndex: 2 }).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new VenmoParser(VENMO_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.CAPITAL_ONE_CREDIT_PARSER: {
            const validation = new FileValidator(CAPITAL_ONE_CREDIT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new CapitalOneCreditParser(CAPITAL_ONE_CREDIT_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.AMEX_CREDIT_PARSER: {
            const validation = new FileValidator(AMEX_CREDIT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new AmexCreditParser(AMEX_CREDIT_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.MATTHEW_SNAPSHOT_VENMO: {
            const validation = new FileValidator(MATTHEW_SNAPSHOT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new MatthewVenmoSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({ text, label: "Venmo" });
            break;
          }
          case ParserKey.MATTHEW_SNAPSHOT_CREDIT: {
            const validation = new FileValidator(MATTHEW_SNAPSHOT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new MatthewCreditSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({ text, label: "Wells Fargo Credit" });
            break;
          }
          case ParserKey.MATTHEW_SNAPSHOT_CHECKING: {
            const validation = new FileValidator(MATTHEW_SNAPSHOT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new MatthewCheckingSnapshotParser(MATTHEW_SNAPSHOT_EXAMPLE, text).toFinanceRows({ text, label: "Wells Fargo Checking" });
            break;
          }
          case ParserKey.DISCOVER_PARSER: {
            const validation = new FileValidator(DISCOVER_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new DiscoverParser(DISCOVER_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.EXPORT_PARSER: {
            const validation = new FileValidator(EXPORT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new ExportParser(EXPORT_EXAMPLE, text).toFinanceRows(text);
            break;
          }
          case ParserKey.CHASE_CHECKING_PARSER: {
            const validation = new FileValidator(CHASE_CHECKING_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new ChaseCheckingParser(CHASE_CHECKING_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.CHASE_CREDIT_PARSER: {
            const validation = new FileValidator(CHASE_CREDIT_EXAMPLE, text).validateFile();
            if (!validation.valid) { setHeaderMismatch({ fileName: file.name, expectedHeaders: validation.expectedHeaders, actualHeaders: validation.actualHeaders }); setIsSubmitting(false); return; }
            rows = new ChaseCreditParser(CHASE_CREDIT_EXAMPLE, text, identifier).toFinanceRows(text);
            break;
          }
          case ParserKey.RULES_EXPORT_PARSER: {
            const rules = new RulesExportsParser(RULES_EXPORT_EXAMPLE, text).parse(text);
            await DatabaseService.writeRuleToDatabase({ rules });
            continue;
          }
          default:
            console.log(`Unknown parser key: ${parserKey}`);
            continue;
        }

        if (rows) {
          const fullSource =
            identifier && identifier.length > 0 ? `${parserKey} | ${identifier}` : parserKey;
          rows = rows.map((row) => ({ ...row, source: fullSource }));
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    handleMultiFileSubmit(files);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
                value={file.parserKey}
                onChange={(e) => handleParserKeyChange(index, e.target.value as ParserKey)}
                className="p-1 border rounded-md"
              >
                {Object.values(ParserKey).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <input
                disabled={file.parserKey === ParserKey.RULES_EXPORT_PARSER}
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
