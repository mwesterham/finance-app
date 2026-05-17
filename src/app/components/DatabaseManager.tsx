import React, { useEffect, useState } from "react";
import DatabaseService from "../util/DatabaseService";
import { FinanceSheetRow, Rule } from "../../db/WesterhamDatabase";
import { getAttachedDb, getBaseDbName } from "../util/util";

interface DatabaseManagerProps {
  onSelect: (option: string) => void;
}

export const DatabaseManager = ({ onSelect }: DatabaseManagerProps) => {
  const [databases, setDatabases] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState("");
  const [newDbName, setNewDbName] = useState("");

  const refreshDatabases = async () => {
    const res = await DatabaseService.getAllExistingDatabases();
    setDatabases(res.databases);
  };

  useEffect(() => {
    refreshDatabases();
  }, [newDbName]);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPath(value);
    const selectedDb = databases.find((db) => db === value);
    if (selectedDb) {
      await DatabaseService.attachDatabase({ databaseName: selectedDb });
      onSelect(selectedDb);
      refreshDatabases();
    }
  };

  const handleCreate = async () => {
    if (!newDbName.endsWith(".db")) return;
    await DatabaseService.attachDatabase({ databaseName: newDbName });
    setSelectedPath(newDbName);
    setNewDbName("");
    onSelect(newDbName);
  };

  const handleExportRules = async () => {
    const rowsResult = await DatabaseService.readDatabaseRules();
    const rows: Rule[] = rowsResult.rules;

    if (!rows.length) return;

    // Step 1: Convert to CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","), // header row
      ...rows.map(row =>
        headers.map(header => {
          let val = (row as any)[header];
          if (val == null) return ""; // handle nulls/undefined
          const escaped = String(val).replace(/"/g, '""'); // escape quotes
          return `"${escaped}"`; // wrap in quotes for CSV
        }).join(",")
      ),
    ].join("\n");

    // Step 2: Trigger file download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dbName = await getAttachedDb();
    link.setAttribute("download", `${getBaseDbName(dbName.length > 0 ? dbName : "default")}-finance_app-rules.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // cleanup
  };

  const handleExportTransactions = async () => {
    const rowsResult = await DatabaseService.readDatabaseRows();
    const rows: FinanceSheetRow[] = rowsResult.rows;

    if (!rows.length) return;

    // Step 1: Convert to CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","), // header row
      ...rows.slice().sort((a, b) => (a.epoch ?? 0) - (b.epoch ?? 0)).map(row =>
        headers.map(header => {
          let val = (row as any)[header];
          if (val == null) return ""; // handle nulls/undefined

          // Format epoch field
          if (header === "epoch") {
            const date = new Date(val);
            val = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
          }

          const escaped = String(val).replace(/"/g, '""'); // escape quotes
          return `"${escaped}"`; // wrap in quotes for CSV
        }).join(",")
      ),
    ].join("\n");

    // Step 2: Trigger file download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dbName = await getAttachedDb();
    link.setAttribute("download", `${getBaseDbName(dbName.length > 0 ? dbName : "default")}-finance_app-transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // cleanup
  };

  return (
    <div className="flex flex-wrap justify-between items-end gap-4">
      {/* LHS: Inputs */}
      <div className="flex flex-wrap gap-4 flex-grow max-w-[calc(100%-12rem)]">
        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium mb-1">Select a database</label>
          <select
            value={selectedPath}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            {databases.map((db) => (
              <option key={db} value={db}>
                {db}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full max-w-sm">
          <label className="block text-sm font-medium mb-1">Create new database</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="example.db"
              value={newDbName}
              onChange={(e) => setNewDbName(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Create
            </button>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => DatabaseService.openDbDirectory()}
                className="bg-gray-600 text-white px-2 py-1 text-xs rounded hover:bg-gray-700 whitespace-nowrap"
              >
                Open DB Folder
              </button>
              <button
                onClick={() => DatabaseService.openBackupsDirectory()}
                className="bg-gray-600 text-white px-2 py-1 text-xs rounded hover:bg-gray-700 whitespace-nowrap"
              >
                Snapshots
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RHS: Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleExportTransactions}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Export Transactions
        </button>
        <button
          onClick={handleExportRules}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Export Rules Table
        </button>
      </div>
    </div>
  );
};
