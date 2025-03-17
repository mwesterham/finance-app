// components/TransactionForm.tsx

import React from "react";

interface TransactionFormProps {
  formData: {
    epoch: number;
    amount: number;
    transactionInfo: string;
    source: string;
    category?: number;
    providedDetail: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleSubmit: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ formData, setFormData, handleSubmit }) => {
  return (
    <div className="border p-4">
      <h2 className="text-lg font-bold mb-2">Add Transaction</h2>
      <div className="space-y-2">
        <div className="space-y-1">
          <label htmlFor="epoch" className="block font-medium">Epoch</label>
          <input
            id="epoch"
            type="datetime-local"
            placeholder="Epoch"
            value={new Date(formData.epoch).toISOString().slice(0, 16)} // Format as datetime-local
            onChange={(e) => setFormData({ ...formData, epoch: new Date(e.target.value).getTime() })}
            className="border p-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="amount" className="block font-medium">Amount</label>
          <input
            id="amount"
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
            className="border p-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="transactionInfo" className="block font-medium">Transaction Info</label>
          <input
            id="transactionInfo"
            type="text"
            placeholder="Transaction Info"
            value={formData.transactionInfo}
            onChange={(e) => setFormData({ ...formData, transactionInfo: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="source" className="block font-medium">Source</label>
          <input
            id="source"
            type="text"
            placeholder="Source"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="category" className="block font-medium">Category (Optional)</label>
          <input
            id="category"
            type="text"
            placeholder="Category (Optional)"
            value={formData.category || ""}
            onChange={(e) => setFormData({ ...formData, category: Number(e.target.value) || undefined })}
            className="border p-2 w-full"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="providedDetail" className="block font-medium">Provided Detail (Optional)</label>
          <input
            id="providedDetail"
            type="text"
            placeholder="Provided Detail (Optional)"
            value={formData.providedDetail}
            onChange={(e) => setFormData({ ...formData, providedDetail: e.target.value })}
            className="border p-2 w-full"
          />
        </div>

        <button onClick={handleSubmit} className="bg-blue-500 text-white p-2 w-full">
          Submit
        </button>
      </div>
    </div>
  );
};

export default TransactionForm;
