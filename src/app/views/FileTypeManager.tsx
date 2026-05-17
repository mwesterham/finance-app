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
import React, { useCallback, useEffect, useRef, useState } from "react";
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
        <div className="px-2">
          <select
            value={value}
            onChange={onChange}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            {ALL_PARSER_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
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
        <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
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

export const FileTypeManager = (_props: FileTypeManagerProps) => {
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
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const columns = getColumns();

  const table = useReactTable({
    data: fileTypeData,
    columns,
    state: { columnVisibility, columnSizing, sorting, columnFilters },
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
    meta: {
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        skipAutoResetPageIndex();
        setFileTypeData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: value } : row
          )
        );
      },
    },
  });

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + New File Type
        </button>
      </div>

      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-gray-300">
              <th key={`${headerGroup.id}-custom-1`} className="px-4 py-2 text-left">
                Manage
              </th>
              {headerGroup.headers.map((header) => {
                if (header.column.id === "fileTypeId") return null;
                return (
                  <th key={header.id} colSpan={header.colSpan} className="px-4 py-2 text-left">
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
                        <span
                          className={cx(`${header.column.getCanSort() ? "cursor-pointer" : ""}`, "pr-2")}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.column.getIsSorted() === "asc" ? <GoArrowUp /> : header.column.getIsSorted() === "desc" ? <GoArrowDown /> : <GoArrowSwitch />}
                        </span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                    {header.column.getCanFilter() && (
                      <div className="mt-1">
                        <Filter column={header.column} />
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => {
            const fileTypeId = Number(row.original.fileTypeId);
            const isDeleting = deletedRows.includes(fileTypeId);
            return (
              <ErrorBoundary key={`boundary-${row.id}`}>
                <tr
                  key={row.id}
                  className={cx(
                    "border-b",
                    isDeleting ? "delete-animation" : ""
                  )}
                >
                  <td key={`${row.id}-custom-1`} className="border-r border-gray-300">
                    <span className="flex flex-grow items-center justify-center space-x-2">
                      <WithTooltip text="Delete" position="top">
                        <ConfirmAction
                          onConfirm={() => deleteFileType(fileTypeId)}
                          title="Delete file type?"
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
                        >
                          <MdDeleteForever
                            className="text-red-500 cursor-pointer hover:text-red-700 min-w-5 min-h-5"
                          />
                        </ConfirmAction>
                      </WithTooltip>
                    </span>
                  </td>
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === "fileTypeId") return null;
                    return (
                      <td key={cell.id} className="border-r border-gray-300 group hover:bg-gray-50">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              </ErrorBoundary>
            );
          })}
        </tbody>
      </table>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <MdKeyboardArrowLeft />
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <MdKeyboardArrowRight />
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <MdKeyboardDoubleArrowRight />
          </button>
        </div>
        <span className="text-sm">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <select
          className="border rounded px-2 py-1"
          value={table.getState().pagination.pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 40, 50, 100, 200].map((pageSize) => (
            <option key={pageSize} value={pageSize}>Show {pageSize}</option>
          ))}
        </select>
      </div>
      <div className="mt-2 text-sm">{table.getPrePaginationRowModel().rows.length} Rows</div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
            <h1 className="text-xl font-semibold pb-4">Create File Type</h1>
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
    </div>
  );
};

function useSkipper() {
  const shouldSkipRef = useRef(true);
  const shouldSkip = shouldSkipRef.current;

  const skip = useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}
