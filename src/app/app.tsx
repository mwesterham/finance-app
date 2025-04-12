import { useEffect, useState } from "react";
import { OnGetDbLocalPathResult, OnReadDatabaseRowsResult, OnWriteRowToDatabaseIfMissingResult, OnWriteRowToDatabaseResult } from "../preload";
import { FinanceSheetRow } from "../db/WesterhamDatabase";
import MultiFileUploader, { InputFileLabel, LabeledFile } from "./views/MultiFileUploader";
import CheckingParser from "./util/parser/CheckingParser";
import CreditParser from "./util/parser/CreditParser";
import VenmoParser from "./util/parser/VenmoParser";
import MatthewVenmoSnapshotParser from "./util/parser/MatthewVenmoSnapshotParser";
import MatthewCheckingSnapshotParser from "./util/parser/MatthewCheckingSnapshotParser";
import { TanstackDataTable } from "./views/TanstackDatatable";
import MatthewCreditSnapshotParser from "./util/parser/MatthewCreditSnapshotParser";
import { TanstackExploreTable } from "./views/TanstackExploreTable";
import { prettyPrintString } from "./util/util";

const App = () => {
  const checkingParser = new CheckingParser();
  const creditParser = new CreditParser();
  const venmoParser = new VenmoParser();
  const matthewCheckingSnapshotParser = new MatthewCheckingSnapshotParser();
  const matthewCreditSnapshotParser = new MatthewCreditSnapshotParser();
  const matthewVenmoSnapshotParser = new MatthewVenmoSnapshotParser();

  const [rows, setRows] = useState<FinanceSheetRow[]>([]);
  const [formData, setFormData] = useState({
    epoch: Date.now(),
    amount: 0,
    transactionInfo: "",
    source: "",
    category: undefined,
    providedDetail: "",
  });
  const [activeTab, setActiveTab] = useState<string>("pivotTable");

  useEffect(() => {
    window.electronAPI.onWriteRowToDatabase((event, values: OnWriteRowToDatabaseResult) => {
      console.log("Database write result:", values);
      fetchDatabaseRows(); // Refresh table after insertion
    });
    window.electronAPI.onWriteRowToDatabaseIfMissing((event, result: OnWriteRowToDatabaseIfMissingResult) => {
      console.log(`Attempting to write ${result.requestedRowCount} rows, wrote ${result.writtenRowCount} rows. Found ${result.requestedRowCount - result.writtenRowCount} duplicates. oldid: ${result.oldLastTransactionId}. newid: ${result.newLastTransactionId}`,);
      fetchDatabaseRows();
    });
    window.electronAPI.onReadDatabaseRows((event, values: OnReadDatabaseRowsResult) => {
      console.log("Database read result length:", values.rows.length);
      setRows(values.rows);
    });
  }, []);

  useEffect(() => {
    fetchDatabaseRows();
  }, []);

  useEffect(() => {
    getDbLocalPath();
    window.electronAPI.onGetDbLocalPath((event, values: OnGetDbLocalPathResult) => {
      console.log("Local db path:", values.path);
    });
  }, []);

  const fetchDatabaseRows = async () => {
    await window.electronAPI.readDatabaseRows();
  };

  const getDbLocalPath = async () => {
    await window.electronAPI.getDbLocalPath();
  };

  const handleSubmit = async () => {
    await window.electronAPI.writeRowToDatabase({
      row: { ...formData, epoch: formData.epoch }, // Use user-inputted epoch
    });
  };

  const handleDelete = async (transactionId: number) => {
    // Implement deletion logic here
    console.log("Deleting transaction with ID:", transactionId);
    await window.electronAPI.deleteRowFromDatabase({ transactionId });
    fetchDatabaseRows();
  };

  const handleMultiFileSubmit = async (files: LabeledFile[]) => {
    for (const { file, label } of files) {
      const text = await file.text();
      switch (label) {
        case InputFileLabel.WELLS_FARGO_CHECKING: {
          const rows = checkingParser.toFinanceRows(text);
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.WELLS_FARGO_CREDIT: {
          const rows = creditParser.toFinanceRows(text);
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.VENMO: {
          const rows = venmoParser.toFinanceRows(text);
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_VENMO: {
          const rows = matthewVenmoSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.VENMO
          });
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_CREDIT: {
          const rows = matthewCreditSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.WELLS_FARGO_CREDIT
          });
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        case InputFileLabel.MATTHEW_SNAPSHOT_CHECKING: {
          const rows = matthewCheckingSnapshotParser.toFinanceRows({ 
            text: text, 
            label: InputFileLabel.WELLS_FARGO_CHECKING
          });
          await window.electronAPI.writeRowToDatabaseIfMissing({ rows });
          break;
        }
        default: {
          console.log(`Invalid label ${label}`)
        }
      }
    };
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="mb-4 flex border-b">
        {["pivotTable", "tanstackTable", "fillTable", "multiFileUploader"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            {prettyPrintString(tab)} {/* Format tab names */}
          </button>
        ))}
      </div>

      <div className={activeTab !== "pivotTable" ? "hidden" : ""}>
        <TanstackExploreTable data={rows}/>
      </div>

      <div className={activeTab !== "multiFileUploader" ? "hidden" : ""}>
        <MultiFileUploader onSubmit={handleMultiFileSubmit} />
      </div>

      <div className={activeTab !== "fillTable" ? "hidden" : ""}>
        New View
      </div>

      <div className={activeTab !== "tanstackTable" ? "hidden" : ""}>
        <TanstackDataTable data={rows}/>
      </div>
    </div>
  );
};

export default App;
