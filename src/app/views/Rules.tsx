import { useState } from 'react';
import { FinanceSheetRow } from '../../db/WesterhamDatabase';
import { OnReadDatabaseRowsResult } from '../../preload';

interface Rule {
  matchingExpression: string;
  category: string;
}

const rules: Rule[] = [
  { matchingExpression: "tesco", category: "Groceries" },
  { matchingExpression: "uber", category: "Transport" },
  { matchingExpression: "netflix", category: "Subscriptions" },
  // Add more rules here
];

export const RuleBasedCategorizer = () => {
  const [rows, setRows] = useState<FinanceSheetRow[]>([]);

  const fetchDatabaseRows = async () => {
    await window.electronAPI.readDatabaseRows();
  };

  const updateRow = async (transactionId: string, row: FinanceSheetRow) => {
    await window.electronAPI.updateRowInDatabase({
      transactionId,
      row,
    });
  };

  const applyRules = async () => {
    await window.electronAPI.readDatabaseRows();
    const dbRows: FinanceSheetRow[] = [];

    for (const row of dbRows) {
      const matchedRule = rules.find(rule =>
        row.transactionInfo?.toLowerCase().includes(rule.matchingExpression.toLowerCase())
      );

      if (matchedRule && row.category !== matchedRule.category) {
        const updatedRow = { ...row, category: matchedRule.category };
        await updateRow(row.transactionId, updatedRow);
      }
    }

    await fetchDatabaseRows();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Rule-Based Categorizer</h2>
      <button
        onClick={applyRules}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Fill Database Using Rules
      </button>
      <div className="mt-4">
        <h3 className="font-semibold mb-1">Defined Rules</h3>
        <ul className="list-disc list-inside space-y-1">
          {rules.map((rule, idx) => (
            <li key={idx}>
              <span className="font-medium">"{rule.matchingExpression}"</span> ➝{" "}
              <span className="italic">{rule.category}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};