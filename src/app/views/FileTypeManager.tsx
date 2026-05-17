import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getFilteredRowModel,
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useState } from "react";
import { FileType } from "../../db/WesterhamDatabase";
import { ParserKey } from "./MultiFileUploader";
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdDeleteForever,
} from "react-icons/md";
import { RowData } from "@tanstack/react-table";
import Filter from "../components/Filter";
import ErrorBoundary from "../components/ErrorBoundary";
import { cx } from "../util/util";
import EditableInput from "../components/tablecell/EditableInput";
import ConfirmAction from "../components/ConfirmAction";
import WithTooltip from "../components/WithTooltip";
import DatabaseService from "../util/DatabaseService";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select" | "search" | "daterange";
  }
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const updateFileType = async (fileTypeId: string, fileType: FileType) => {
  await DatabaseService.updateFileType({ fileTypeId, fileType });
};

const columnHelper = createColumnHelper<FileType>();

const ALL_PARSER_KEYS = Object.values(ParserKey);

const getColumns = () => [
  columnHelper.accessor("filenamePattern", {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();
      const onChange = async (val: any) => {
        const str = val == null ? String(Math.random()) : String(val);
        table.options.meta?.updateData(row.index, column.id, str);
        await updateFileType(row.original.fileTypeId, {
          ...row.original,
          filenamePattern: str,
        });
      };
      return (
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          onChange={onChange}
        />
      );
    },
    header: ({ column }) => <span>Filename Pattern</span>,
    footer: ({ column }) => <span>Filename Pattern</span>,
    meta: { filterVariant: "search" },
  }),
  columnHelper.accessor("parserKey", {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();
      const onChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const str = e.target.value;
        table.options.meta?.updateData(row.index, column.id, str);
        await updateFileType(row.original.fileTypeId, {
          ...row.original,
          parserKey: str,
        });
      };
      return (
        <select
          value={value}
          onChange={onChange}
          className="w-full border rounded px-2 py-1 text-sm"
        >
          {ALL_PARSER_KEYS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      );
    },
    header: ({ column }) => <span>Parser</span>,
    footer: ({ column }) => <span>Parser</span>,
    meta: { filterVariant: "select" },
  }),
  columnHelper.accessor("defaultSourceId", {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();
      const onChange = async (val: any) => {
        const str = val == null ? "" : String(val);
        table.options.meta?.updateData(row.index, column.id, str);
        await updateFileType(row.original.fileTypeId, {
          ...row.original,
          defaultSourceId: str,
        });
      };
      return (
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value || <span className="text-gray-400 italic">none</span>}</>}
          onChange={onChange}
        />
      );
    },
    header: ({ column }) => <span>Default Source ID</span>,
    footer: ({ column }) => <span>Default Source ID</span>,
    meta: { filterVariant: "search" },
  }),
  columnHelper.accessor("fileTypeId", {
    cell: () => null,
    header: () => null,
    footer: () => null,
    enableHiding: true,
  }),
];

// ─── New File Type Form ───────────────────────────────────────────────────────

interface FileTypeFormProps {
  onSubmit: (ft: FileType) => void;
  onCancel: () => void;
}

const FileTypeForm: React.FC<FileTypeFormProps> = ({ onSubmit, onCancel }) => {
  const [filenamePattern, setFilenamePattern] = useState("");
  const [parserKey, setParserKey] = useState<string>(ALL_PARSER_KEYS[0]);
  const [defaultSourceId, setDefaultSourceId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!filenamePattern.trim()) {
      alert("Filename pattern is required.");
      return;
    }
    onSubmit({ filenamePattern: filenamePattern.trim(), parserKey, defaultSourceId: defaultSourceId.trim() });
    setFilenamePattern("");
    setParserKey(ALL_PARSER_KEYS[0]);
    setDefaultSourceId("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
      <div>
        <label className="block text-sm font-medium mb-1">Filename Pattern</label>
        <input
          type="text"
          value={filenamePattern}
          onChange={(e) => setFilenamePattern(e.target.value)}
          placeholder="e.g. chase3727"
          className="w-full border rounded px-3 py-2"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Case-insensitive substring matched against the uploaded filename.
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Parser</label>
        <select
          value={parserKey}
          onChange={(e) => setParserKey(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {ALL_PARSER_KEYS.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Default Source ID (optional)</label>
        <input
          type="text"
          value={defaultSourceId}
          onChange={(e) => setDefaultSourceId(e.target.value)}
          placeholder="e.g. Chase Joint Checking"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Add
        </button>
        <button type="button" onClick={onCancel} className="flex-1 border py-2 rounded hover:bg-gray-100">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export interface FileTypeManagerProps {}

export const FileTypeManager = (props: FileTypeManagerProps) => {
  const [fileTypeData, setFileTypeData] = useState<FileType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletedRows, setDeletedRows] = useState<number[]>([]);

  useEffect(() => {
    fetchFileTypes();
  }, []);

  const fetchFileTypes = async () => {
    DatabaseService.readFileTypes().then((result) => {
      setFileTypeData(result.fileTypes);
    });
  };

  const deleteFileType = async (fileTypeId: number) => {
    setTimeout(async () => {
      await DatabaseService.deleteFileType({ fileTypeId });
      setDeletedRows([]);
      fetchFileTypes();
    }, 1000);
    setDeletedRows([fileTypeId]);
  };

  const [columnVisibility, setColumnVisibility] = useState({ fileTypeId: false });
  const [columnSizing, setColumnSizing] = useState<{ [key: string]: number }>({});
  const [sorting, setSorting] = useState([{ id: "filenamePattern", desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = getColumns();

  const [data, setData] = useState<FileType[]>([]);
  useEffect(() => { setData(fileTypeData); }, [fileTypeData]);

  const updateData = useCallback(
    (rowIndex: number, columnId: string, value: unknown) => {
      setData((old) =>
        old.map((row, index) =>
          index === rowIndex ? { ...row, [columnId]: value } : row
        )
      );
    },
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility, columnSizing, sorting, columnFilters },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    initialState: { pagination: { pageSize: 20 } },
    meta: { updateData },
  });

  return (
    <ErrorBoundary>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">File Types</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            + New File Type
          </button>
        </div>

        <p className="text-sm text-gray-600">
          Each row maps a filename pattern to a parser and an optional default source ID.
          When you upload a file, the first matching pattern (top to bottom) determines the parser used.
        </p>

        {/* New File Type Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between px-4 pt-4">
                <h3 className="font-semibold text-base">New File Type</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
              <FileTypeForm
                onSubmit={async (ft) => {
                  await DatabaseService.writeFileType({ fileType: ft });
                  setShowModal(false);
                  fetchFileTypes();
                }}
                onCancel={() => setShowModal(false)}
              />
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (header.column.id === "fileTypeId") return null;
                    return (
                      <th
                        key={header.id}
                        className="border px-2 py-1 bg-gray-100 text-left select-none"
                      >
                        <div
                          className={cx("flex items-center gap-1", header.column.getCanSort() ? "cursor-pointer" : "")}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === "asc" ? (
                            <GoArrowUp />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <GoArrowDown />
                          ) : header.column.getCanSort() ? (
                            <GoArrowSwitch />
                          ) : null}
                        </div>
                        {header.column.getCanFilter() && (
                          <Filter column={header.column} />
                        )}
                      </th>
                    );
                  })}
                  <th className="border px-2 py-1 bg-gray-100 w-10" />
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => {
                const fileTypeId = Number(row.original.fileTypeId);
                const isDeleting = deletedRows.includes(fileTypeId);
                return (
                  <tr
                    key={row.id}
                    className={cx(
                      "border-b transition-opacity duration-700",
                      isDeleting ? "opacity-0" : "opacity-100"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === "fileTypeId") return null;
                      return (
                        <td key={cell.id} className="border px-2 py-1">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      );
                    })}
                    <td className="border px-2 py-1 text-center">
                      <ConfirmAction
                        title="Delete File Type?"
                        body={
                          <table className="w-full border-collapse border border-gray-300 text-left text-sm">
                            <tbody>
                              {[
                                { label: "Pattern", value: row.original.filenamePattern },
                                { label: "Parser", value: row.original.parserKey },
                                { label: "Default Source ID", value: row.original.defaultSourceId || "—" },
                              ].map(({ label, value }) => (
                                <tr key={label} className="border-b border-gray-200">
                                  <td className="px-4 py-2 font-medium">{label}</td>
                                  <td className="px-4 py-2">{value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        }
                        onConfirm={() => deleteFileType(fileTypeId)}
                      >
                        <WithTooltip text="Delete file type">
                          <MdDeleteForever className="text-red-500 hover:text-red-700 cursor-pointer text-xl" />
                        </WithTooltip>
                      </ConfirmAction>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center gap-2 text-sm">
          <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} className="p-1 disabled:opacity-40">
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1 disabled:opacity-40">
            <MdKeyboardArrowLeft />
          </button>
          <span>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1 disabled:opacity-40">
            <MdKeyboardArrowRight />
          </button>
          <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} className="p-1 disabled:opacity-40">
            <MdKeyboardDoubleArrowRight />
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border rounded px-1 py-0.5"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>Show {size}</option>
            ))}
          </select>
        </div>
      </div>
    </ErrorBoundary>
  );
};
