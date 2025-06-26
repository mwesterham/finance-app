import Papa from "papaparse";
import { useRef, useState } from "react";
import DatabaseService from "../util/DatabaseService";
import { Rule } from "../../db/WesterhamDatabase";

export interface LabeledFile {
  file: File;
}

interface RulesTableUploaderProps {
}

export default function RulesTableUploader(props: RulesTableUploaderProps) {

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<LabeledFile[]>([]);

  const parse = (input: string): Rule[] => {
      const rows: Rule[] = [];
  
      Papa.parse(input, {
        header: false,
        skipEmptyLines: true,
        complete: (result: any) => {
          const data = result.data as any[][]; // Data from PapaParse
          data.slice(1).forEach(row => {
            rows.push({
              matchingExpression: row[1],
              category: row[2],
              providedDetail: row[3],
            });
          });
        },
        error: (error: any) => {
          console.error("CSV Parsing Error:", error);
        },
      });
  
      return rows;
    }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map((file) => ({
        file
      }));
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleMultiFileSubmit = async (files: LabeledFile[]) => {
    const rules: Rule[] = []
    for (const { file } of files) {
      const text = await file.text();
      rules.push(...parse(text));
    }
    await DatabaseService.writeRuleToDatabase({ rules: rules });
  };

  const handleSubmit = () => {
    handleMultiFileSubmit(files);
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return <>
    <div className="p-4 border rounded-lg shadow-md space-y-4 bg-white">
      <label className="font-semibold block">Rules Table Import</label>
      <input type="file" ref={fileInputRef} multiple onChange={handleFileChange} className="block w-full border p-2 rounded" />

      <div className="space-y-2">
        {files.map((file, index) => (
          <div key={index} className="flex items-center gap-2 border p-2 rounded-lg">
            <span className="truncate flex-1">{file.file.name}</span>
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
        Submit to Rules Table
      </button>
    </div>
  </>;
}
