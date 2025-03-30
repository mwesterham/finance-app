import React from "react";
import { formatAmount } from "../util/util";

interface FinanceSheetRow {
  transactionId?: string;
  epoch: number;
  amount: number;
  source: string;
  transactionInfo: string;
  category?: string;
  providedDetail?: string;
}

interface TransactionDetailsProps {
  transaction: FinanceSheetRow;
}

const TransactionDetails: React.FC<TransactionDetailsProps> = ({ transaction }) => {
  return (
    <table className="w-full border-collapse border border-gray-300 text-left">
      <tbody>
        {[
          { label: "Transaction ID", value: transaction.transactionId || "N/A" },
          { label: "Transaction Info", value: transaction.transactionInfo },
          { label: "Amount", value: formatAmount(transaction.amount) },
          { label: "Source", value: transaction.source },
          { label: "Category", value: transaction.category || "N/A" },
          { label: "Details", value: transaction.providedDetail || "N/A" },
          { label: "Date", value: new Date(transaction.epoch).toLocaleString() },
        ].map(({ label, value }) => (
          <tr key={label} className="border-b border-gray-200">
            <td className="px-4 py-2 font-medium">{label}</td>
            <td className="px-4 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionDetails;
