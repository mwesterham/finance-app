// components/DeleteTransactionForm.tsx

import React, { useState } from "react";

interface DeleteTransactionFormProps {
  handleDelete: (transactionId: number) => void;
}

const DeleteTransactionForm: React.FC<DeleteTransactionFormProps> = ({ handleDelete }) => {
  const [transactionId, setTransactionId] = useState<number | "">(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionId) {
      handleDelete(transactionId);
    }
  };

  return (
    <div className="border p-4">
      <h2 className="text-lg font-bold mb-2">Delete Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1">
          <label htmlFor="transactionId" className="block font-medium">Transaction ID</label>
          <input
            id="transactionId"
            type="number"
            placeholder="Enter Transaction ID to delete"
            value={transactionId}
            onChange={(e) => setTransactionId(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>

        <button type="submit" className="bg-red-500 text-white p-2 w-full">
          Delete Transaction
        </button>
      </form>
    </div>
  );
};

export default DeleteTransactionForm;
