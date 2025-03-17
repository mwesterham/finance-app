import { useEffect, useState } from "react";
import DisplayTable from "./components/DataTable";
import TransactionForm from "./components/TransactionForm";
import DeleteTransactionForm from "./components/DeleteTransactionForm"; // Import the delete form
import { OnGetDbLocalPathResult, OnReadDatabaseRowsResult, OnWriteRowToDatabaseIfMissingResult, OnWriteRowToDatabaseResult } from "../preload";
import { FinanceSheetRow } from "../db/WesterhamDatabase";
import PivotTable from "./components/PivotTable";
import MultiFileUploader, { LabeledFile } from "./components/MultiFileUploader";
import CheckingParser from "./util/parser/CheckingParser";

const App = () => {
  const checkingParser = new CheckingParser();
  const [rows, setRows] = useState<FinanceSheetRow[]>([]);
  const [formData, setFormData] = useState({
    epoch: Date.now(),
    amount: 0,
    transactionInfo: "",
    source: "",
    category: undefined,
    providedDetail: "",
  });
  const [activeTab, setActiveTab] = useState<string>("addTransaction");

  useEffect(() => {
    window.electronAPI.onWriteRowToDatabase((event, values: OnWriteRowToDatabaseResult) => {
      console.log("Database write result:", values);
      fetchDatabaseRows(); // Refresh table after insertion
    });
    window.electronAPI.onWriteRowToDatabaseIfMissing((event, result: OnWriteRowToDatabaseIfMissingResult) => {
      console.log(`Attempting to write ${result.requestedRowCount} rows, wrote ${result.writtenRowCount} rows. Found ${result.requestedRowCount - result.writtenRowCount} duplicates.`, );
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
      const rows = checkingParser.parse(text);

      const financeRows: FinanceSheetRow[] = rows.map(checkingInput => {
        const financeRow: FinanceSheetRow = {
          epoch: checkingInput.date.getTime(),
          amount: checkingInput.amount,
          source: label,
          transactionInfo: checkingInput.detail,
        };
        return financeRow;
      })
  
      await window.electronAPI.writeRowToDatabaseIfMissing({ rows: financeRows });
    };
  };

  const formatRows = (rows: FinanceSheetRow[]): any[][] => {
    return rows.map((row) => [
      row.transactionId ?? -1,
      row.epoch,
      row.amount,
      row.transactionInfo,
      row.source,
      row.category ?? "",
      row.providedDetail ?? "",
    ]);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="mb-4 flex border-b">
        <button
          onClick={() => setActiveTab("addTransaction")}
          className={`py-2 px-4 ${activeTab === "addTransaction" ? "border-b-2 border-blue-500" : ""}`}
        >
          Add Transaction
        </button>
        <button
          onClick={() => setActiveTab("deleteTransaction")}
          className={`py-2 px-4 ${activeTab === "deleteTransaction" ? "border-b-2 border-blue-500" : ""}`}
        >
          Delete Transaction
        </button>
        <button
          onClick={() => setActiveTab("viewTransactions")}
          className={`py-2 px-4 ${activeTab === "viewTransactions" ? "border-b-2 border-blue-500" : ""}`}
        >
          View Transactions
        </button>
        <button
          onClick={() => setActiveTab("pivotTable")}
          className={`py-2 px-4 ${activeTab === "pivotTable" ? "border-b-2 border-blue-500" : ""}`}
        >
          View Pivot Table
        </button>
        <button
          onClick={() => setActiveTab("multiFileUploader")}
          className={`py-2 px-4 ${activeTab === "multiFileUploader" ? "border-b-2 border-blue-500" : ""}`}
        >
          View Multi-file Upload
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "addTransaction" && (
        <TransactionForm formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} />
      )}

      {activeTab === "deleteTransaction" && (
        <DeleteTransactionForm handleDelete={handleDelete} />
      )}

      {activeTab === "viewTransactions" && (
        <div className="border p-4">
          <h2 className="text-lg font-bold mb-2">Transaction Records</h2>
          <button onClick={fetchDatabaseRows} className="bg-gray-500 text-white p-2 mb-2 w-full">
            Refresh Table
          </button>
          <DisplayTable headers={["Transaction ID", "Epoch", "Amount", "Info", "Source", "Category", "Detail"]} data={formatRows(rows)} />
        </div>
      )}

      {activeTab === "pivotTable" && (
        <PivotTable data={rows} />
      )}

      {activeTab === "multiFileUploader" && (
        <MultiFileUploader onSubmit={handleMultiFileSubmit} />
      )}
    </div>
  );
};

export default App;
