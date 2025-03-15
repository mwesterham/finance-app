import { useEffect, useState } from "react";
import DynamicIdentifierForm, { FormEntry } from "./components/DynamicIdentifierForm";
import DisplayTable from "./components/DataTable";
import { OnReadFileResult, OnWriteToFileResult } from "../preload";
import { customFormatDate } from "./util/time";

const DATA_FILE_NAME = "upc_entries.csv";
const DELIM = ",";

const App = () => {
  const [csvFileContent, setCsvFileContent] = useState<any[][]>(null);
  // Read file
  useEffect(() => {
    readCSV();
  }, []);

  // Setup listeners for file operations
  useEffect(() => {
    const handleOnWriteToFile = (event: any, values: OnWriteToFileResult) => {
      console.log(values);
    };
    window.electronAPI.onWriteToFile(handleOnWriteToFile);
  }, []);
  useEffect(() => {
    const handleOnReadFile = (event: any, result: OnReadFileResult) => {
      const parsedCsv = result.lines
      .filter((entry) => entry.length > 0)
      .map((entry) => entry.split(DELIM))
      .map((entry) => [entry[0], customFormatDate(parseInt(entry[1]))]);

      setCsvFileContent(parsedCsv);
    };
    window.electronAPI.onReadFile(handleOnReadFile);
  }, []);

  // Function to save the file locally
  const saveToCSV = async (entries: FormEntry[]) => {
    const timestamp = Date.now();
    const csvContent = entries
      .filter((entry) => entry.value.length > 0)
      .map((entry) => `${entry.value}${DELIM}${timestamp}`);

    await window.electronAPI.writeToFile({
      csvLines: csvContent,
      filename: DATA_FILE_NAME,
    });
  };

  // Read file locally
  const readCSV = async () => {
    await window.electronAPI.readFile({
      filename: DATA_FILE_NAME,
    });
  };

  const handleFormSubmit = async (fields: FormEntry[]) => {
    await saveToCSV(fields); // Save data to CSV upon submit
    await readCSV();
  };

  return <div className="p-4 space-y-4">
    <div>
      <DynamicIdentifierForm submitCallback={handleFormSubmit}/>
    </div>

    {csvFileContent &&
      <div className="border p-2">
        <DisplayTable headers={["Identifier", "Timestamp"]} data={csvFileContent} />
      </div>
    }
  </div>
}

export default App;