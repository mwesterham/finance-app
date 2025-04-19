import React, { useEffect, useState } from "react";
import DatabaseService from "../util/DatabaseService";

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
    if (!newDbName.endsWith(".db")) {
      // alert("Database name must end with .db");
      return;
    }
    await DatabaseService.attachDatabase({ databaseName: newDbName });
    setSelectedPath(newDbName);
    setNewDbName("");
    onSelect(newDbName);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
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
        </div>
      </div>
    </div>
  );
};
