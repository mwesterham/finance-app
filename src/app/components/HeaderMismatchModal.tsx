interface HeaderMismatchModalProps {
  fileName: string;
  expectedHeaders: string[];
  actualHeaders: string[];
  onClose: () => void;
}

export default function HeaderMismatchModal({
  fileName,
  expectedHeaders,
  actualHeaders,
  onClose,
}: HeaderMismatchModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-xl w-full p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-1">Header Mismatch</h2>
        <p className="text-gray-600 text-sm mb-4">
          <span className="font-medium">{fileName}</span> does not match the expected
          format. The file may be the wrong type or an unsupported version.
          No rows were imported.
        </p>

        <div className="space-y-3 text-sm">
          <div>
            <p className="font-medium text-gray-700 mb-1">Expected headers</p>
            <div className="bg-green-50 border border-green-200 rounded p-2 font-mono text-xs text-green-800 break-all">
              {expectedHeaders.join(", ")}
            </div>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Actual headers</p>
            <div className="bg-red-50 border border-red-200 rounded p-2 font-mono text-xs text-red-800 break-all">
              {actualHeaders.join(", ")}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
