import { useState } from "react";

export interface LabeledFile {
  file: File;
  label: string;
}

interface MultiFileUploaderProps {
  onSubmit: (files: LabeledFile[]) => void;
}

export default function MultiFileUploader({ onSubmit }: MultiFileUploaderProps) {
  const [files, setFiles] = useState<LabeledFile[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file,
        label: "",
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleLabelChange = (index: number, newLabel: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file, i) =>
        i === index ? { ...file, label: newLabel } : file
      )
    );
  };

  const handleSubmit = () => {
    onSubmit(files);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
      <label className="font-semibold block">Upload Files</label>
      <input type="file" multiple onChange={handleFileChange} className="block w-full border p-2 rounded" />
      
      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 border p-2 rounded-lg">
            <span className="truncate">{file.file.name}</span>
            <input
              type="text"
              placeholder="Enter label"
              value={file.label}
              onChange={(e) => handleLabelChange(index, e.target.value)}
              className="flex-1 p-1 border rounded-md"
            />
          </div>
        ))}
      </div>

      <button onClick={handleSubmit} className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Submit to Database
      </button>
    </div>
  );
}
