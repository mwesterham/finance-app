import { useState, ReactNode } from "react";

interface ConfirmActionProps {
  onConfirm: () => void;
  children: ReactNode;
  title?: string;
  body?: any;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmAction({
  onConfirm,
  children,
  title = "Are you sure?",
  body = <p className="text-gray-600 mt-2">This action cannot be undone.</p>,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmActionProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <span className="cursor-pointer" onClick={() => setOpen(true)}>
        {children}
      </span>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl">
            <h1 className="text-xl font-semibold pb-4">{title}</h1>
            {body}
            <div className="flex justify-end space-x-2 mt-4">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setOpen(false)}
              >
                {cancelText}
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
