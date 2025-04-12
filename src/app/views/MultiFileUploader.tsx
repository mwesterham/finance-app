import { useRef, useState } from "react";
import CheckingParser from "../util/parser/CheckingParser";
import CreditParser from "../util/parser/CreditParser";
import VenmoParser from "../util/parser/VenmoParser";
import MatthewCheckingSnapshotParser from "../util/parser/MatthewCheckingSnapshotParser";
import MatthewCreditSnapshotParser from "../util/parser/MatthewCreditSnapshotParser";
import MatthewVenmoSnapshotParser from "../util/parser/MatthewVenmoSnapshotParser";
import DatabaseService from "../util/DatabaseService";

export interface LabeledFile {
  file: File;
  label: InputFileLabel;
}

export enum InputFileLabel {
  WELLS_FARGO_CHECKING = "Wells Fargo Checking",
  WELLS_FARGO_CREDIT = "Wells Fargo Credit",
  VENMO = "Venmo",
  MATTHEW_SNAPSHOT_CHECKING = "Wells Fargo Checking Snapshot",
  MATTHEW_SNAPSHOT_CREDIT = "Wells Fargo Credit Snapshot",
  MATTHEW_SNAPSHOT_VENMO = "Venmo Snapshot",
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<LabeledFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        label: getRecommendedFileType(file.name), // Default selection
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
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
    for (const { file, label } of files) {
      const text = await file.text();
      switch (label) {
        case InputFileLabel.WELLS_FARGO_CHECKING: {
          const rows = checkingParser.toFinanceRows(text);
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.WELLS_FARGO_CREDIT: {
          const rows = creditParser.toFinanceRows(text);
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.VENMO: {
          const rows = venmoParser.toFinanceRows(text);
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_VENMO: {
          const rows = matthewVenmoSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.VENMO
          });
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_CREDIT: {
          const rows = matthewCreditSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.WELLS_FARGO_CREDIT
          });
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_CHECKING: {
          const rows = matthewCheckingSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.WELLS_FARGO_CHECKING
          });
          await DatabaseService.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        default: {
          console.log(`Invalid label ${label}`)
        }
      }
    };
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
    } else {
      return InputFileLabel.WELLS_FARGO_CHECKING;
    }
  }

  return (
    <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
      <label className="font-semibold block">Upload Files</label>
      <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="block w-full border p-2 rounded" />
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 border p-2 rounded-lg">
            <span className="truncate flex-1">{file.file.name}</span>
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
            <button
              onClick={() => handleRemoveFile(index)}
              className="text-red-500 hover:text-red-700 p-1"
            >
              X
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Submit to Database
      </button>
    </div>
  );
}
