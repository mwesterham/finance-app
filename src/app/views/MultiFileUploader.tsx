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

export interface LabeledFile {
  file: File;
  label: InputFileLabel;
  identifier: string;
}

export enum InputFileLabel {
  WELLS_FARGO_CHECKING = "Wells Fargo Checking",
  WELLS_FARGO_CREDIT = "Wells Fargo Credit",
  VENMO = "Venmo",
  MATTHEW_SNAPSHOT_CHECKING = "Wells Fargo Checking Snapshot",
  MATTHEW_SNAPSHOT_CREDIT = "Wells Fargo Credit Snapshot",
  MATTHEW_SNAPSHOT_VENMO = "Venmo Snapshot",
  DISCOVER = "Discover",
  EXPORT = "Transactions Exported",
  RULES_EXPORT = "Rules Exported",
}

interface MultiFileUploaderProps {
}

export default function MultiFileUploader(props: MultiFileUploaderProps) {
  const checkingParser = new CheckingParser();
  const creditParser = new CreditParser();
  const venmoParser = new VenmoParser();
  const matthewCheckingSnapshotParser = new MatthewCheckingSnapshotParser();
  const matthewCreditSnapshotParser = new MatthewCreditSnapshotParser();
  const matthewVenmoSnapshotParser = new MatthewVenmoSnapshotParser();
  const discoverParser = new DiscoverParser();
  const exportParser = new ExportParser();
  const rulesExportParser = new RulesExportsParser();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<LabeledFile[]>([]);

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
    for (const { file, label, identifier } of files) {
      const text = await file.text();
      let rows: FinanceSheetRow[] | undefined;

      switch (label) {
        case InputFileLabel.WELLS_FARGO_CHECKING:
          rows = checkingParser.toFinanceRows(text);
          break;
        case InputFileLabel.WELLS_FARGO_CREDIT:
          rows = creditParser.toFinanceRows(text);
          break;
        case InputFileLabel.VENMO:
          rows = venmoParser.toFinanceRows(text);
          break;
        case InputFileLabel.MATTHEW_SNAPSHOT_VENMO:
          rows = matthewVenmoSnapshotParser.toFinanceRows({
            text,
            label: InputFileLabel.VENMO,
          });
          break;
        case InputFileLabel.MATTHEW_SNAPSHOT_CREDIT:
          rows = matthewCreditSnapshotParser.toFinanceRows({
            text,
            label: InputFileLabel.WELLS_FARGO_CREDIT,
          });
          break;
        case InputFileLabel.MATTHEW_SNAPSHOT_CHECKING:
          rows = matthewCheckingSnapshotParser.toFinanceRows({
            text,
            label: InputFileLabel.WELLS_FARGO_CHECKING,
          });
          break;
        case InputFileLabel.DISCOVER:
          rows = discoverParser.toFinanceRows(text);
          break;
        case InputFileLabel.EXPORT:
          rows = exportParser.toFinanceRows(text);
          break;
        case InputFileLabel.RULES_EXPORT:
          const rules = rulesExportParser.parse(text);
          await DatabaseService.writeRuleToDatabase({ rules });
          continue;
        default:
          console.log(`Invalid label ${label}`);
          continue;
      }

      if (rows) {
        const fullSource = identifier !== undefined && identifier.length > 0 ? `${label} | ${identifier}` : label;
        rows = rows.map((row) => ({
          ...row,
          source: fullSource,
        }));

        await DatabaseService.writeRowToDatabaseIfMissing({ rows });
      }
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
    if (fileName.toLowerCase().includes("checking")) {
      return InputFileLabel.WELLS_FARGO_CHECKING;
    } else if (fileName.toLowerCase().includes("credit")) {
      return InputFileLabel.WELLS_FARGO_CREDIT;
    } else if (fileName.toLowerCase().includes("venmo")) {
      return InputFileLabel.VENMO;
    } else if (fileName.toLowerCase().includes("discover")) {
      return InputFileLabel.DISCOVER;
    } else if (
      fileName.toLowerCase().includes("finance_app-transactions") ||
      fileName.toLowerCase().includes("finance_app-filtered-transactions")
    ) {
      return InputFileLabel.EXPORT;
    } else if (fileName.toLowerCase().includes("finance_app-rules")) {
      return InputFileLabel.RULES_EXPORT;
    } else {
      return InputFileLabel.WELLS_FARGO_CHECKING;
    }
  }

  return <>
    <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
      <label className="font-semibold block">Import Files</label>
      <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="block w-full border p-2 rounded" />

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
              disabled={file.label == InputFileLabel.RULES_EXPORT ? true : false}
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

      <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Submit
      </button>
    </div>
  </>;
}
