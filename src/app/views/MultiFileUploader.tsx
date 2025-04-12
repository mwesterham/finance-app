import { useRef, useState } from "react";

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
  onSubmit: (files: LabeledFile[]) => void;
}

export default function MultiFileUploader({ onSubmit }: MultiFileUploaderProps) {
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

  const handleSubmit = () => {
    onSubmit(files);
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
