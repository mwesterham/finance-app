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
  getFilteredRowModel
} from '@tanstack/react-table';
import { filterFns } from "@tanstack/table-core";
import { FinanceSheetRow } from '../../db/WesterhamDatabase';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import {
  MdDeleteForever,
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft
} from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { RowData } from "@tanstack/react-table";
import Filter from './Filter';
import ErrorBoundary from './ErrorBoundary';
import { cx, formatAmount, getPossibleValuesFromCol } from '../util/util';
import EditableInput from './EditableInput';
import { OnDeleteRowFromDatabaseResult, OnUpdateRowInDatabaseResult, OnWriteRowToDatabaseIfMissingResult, OnWriteRowToDatabaseResult } from '../../preload';
import ConfirmAction from './ConfirmAction';
import WithTooltip from './WithTooltip';
import TransactionDetails from './TransactionDetails';
import { customFormatDate, epochToDateStr } from '../util/time';


declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select' | 'search' | 'daterange'
  }
}

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void
  }
}

const updateRow = async (transactionId: string, row: FinanceSheetRow) => {
  await window.electronAPI.updateRowInDatabase({
    transactionId,
    row,
  });
};

const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => row.epoch, {
    id: 'epoch',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const localDate = new Date(val + 'T00:00:00');
        const num = localDate.getTime();
        setValue(num);
        table.options.meta?.updateData(row.index, column.id, num); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          epoch: num
        });
      };

      return <>
        <EditableInput
          value={epochToDateStr(value)}
          type="date"
          displayBody={<>{customFormatDate(value)}</>}
          onChange={onChange}
        />
      </>;
    },
    header: () => <span>Date</span>,
    footer: info => info.column.id,
    meta: {
      filterVariant: 'daterange',
    },
  }),
  columnHelper.accessor('transactionId', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('amount', {
    header: () => 'Amount',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const num = Number(val);
        setValue(num);
        table.options.meta?.updateData(row.index, column.id, num); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          amount: num
        });
      };

      const amt = formatAmount(value);

      return <>
        <EditableInput
          value={value}
          type="number"
          displayBody={<div className={value < 0 ? "text-red-500" : ""}>{amt}</div>}
          onChange={onChange}
        />
      </>;
    },
    footer: info => info.column.id,
    meta: {
      filterVariant: 'range',
    },
  }),
  columnHelper.accessor('source', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const str = String(val);
        setValue(str);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          source: str
        });
      };

      return <>
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          suggestions={getPossibleValuesFromCol(column)}
          onChange={onChange}
        />
      </>;
    },
    header: 'Source',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('transactionInfo', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const str = String(val);
        setValue(str);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          transactionInfo: str
        });
      };

      return <>
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          onChange={onChange}
        />
      </>;
    },
    header: 'Transaction Info',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'search',
    },
  }),
  columnHelper.accessor('category', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const str = String(val);
        setValue(str);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          category: str
        });
      };

      return <>
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          suggestions={getPossibleValuesFromCol(column)}
          onChange={onChange}
        />
      </>;
    },
    header: 'Category',
    footer: info => info.column.id,
    filterFn: (row, columnId, filterValue, addMeta) => {
      if (filterValue === "only_null") {
        return row.getValue(columnId) === null || row.getValue(columnId) === undefined;
      }
      return filterFns.includesString(row, columnId, filterValue, addMeta); // Return all rows if filter is not active
    },
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('providedDetail', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();
      const [value, setValue] = useState(initialValue);

      // Handle changes to the input field
      const onChange = async (val: any) => {
        const str = String(val);
        setValue(str);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRow(row.original.transactionId, {
          ...row.original,
          providedDetail: str
        });
      };

      return <>
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          onChange={onChange}
        />
      </>;
    },
    header: 'Provided Detail',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'search',
    },
  }),
];

export interface TanstackDataTableProps {
  data: FinanceSheetRow[];
}

export const TanstackDataTable = ({ data }: TanstackDataTableProps) => {
  const [rowData, setRowData] = useState<FinanceSheetRow[]>(data);
  const [highlightedRow, setHighlightedRows] = useState<number[]>([]);
  const [deletedRows, setDeletedRows] = useState<number[]>([]);
  useEffect(() => {
    setRowData(data);
  }, [data]);

  useEffect(() => {
    window.electronAPI.onUpdateRowInDatabase((event, values: OnUpdateRowInDatabaseResult) => {
      console.log("Database update result:", values);
    });
  }, []);

  useEffect(() => {
    window.electronAPI.onWriteRowToDatabase((event, values: OnWriteRowToDatabaseResult) => {
      console.log("Database write result:", values);
      setHighlightedRows([values.newTransactionId]);

      // Wait 2 seconds and then remove the highlight
      setTimeout(() => {
        setHighlightedRows([]);
      }, 2000);

      fetchDatabaseRows();
    });
    window.electronAPI.onWriteRowToDatabaseIfMissing((event, result: OnWriteRowToDatabaseIfMissingResult) => {
      console.log(`Attempting to write ${result.requestedRowCount} rows, wrote ${result.writtenRowCount} rows. Found ${result.requestedRowCount - result.writtenRowCount} duplicates.`,);
      fetchDatabaseRows();
    });
    window.electronAPI.onDeleteRowFromDatabase((event, result: OnDeleteRowFromDatabaseResult) => {
      console.log("Result of delete: " + result.data);
      setDeletedRows([]);
      fetchDatabaseRows();
    });
  }, []);

  const fetchDatabaseRows = async () => {
    await window.electronAPI.readDatabaseRows();
  };

  const deleteRow = async (transactionId: number) => {
    console.log("Deleting transaction with ID:", transactionId);
    setTimeout(async () => {
      await window.electronAPI.deleteRowFromDatabase({ transactionId });
    }, 1000);
    setDeletedRows([transactionId])
  };

  const writeNewRow = async (row: FinanceSheetRow) => {
    await window.electronAPI.writeRowToDatabase({
      row,
    });
  };

  const [columnVisibility, setColumnVisibility] = useState({
    transactionId: false,
  });
  const [columnSizing, setColumnSizing] = useState<{ [key: string]: number }>({});
  const [sorting, setSorting] = useState([
    { id: "epoch", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data: rowData,
    columns,
    state: { columnSizing, sorting, columnVisibility, columnFilters },
    initialState: { pagination: { pageSize: 20 } },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setRowData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return {
                ...old[rowIndex]!,
                [columnId]: value,
              }
            }
            return row
          })
        );
      },
    },
  });

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-gray-300">
              <th key={`${headerGroup.id}-custom-1`} className="px-4 py-2 text-left">
                Manage
              </th>
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan} className="px-4 py-2 text-left">
                  {header.isPlaceholder ? null : (
                    <div className='flex items-center'>
                      <span className={cx(`${header.column.getCanSort() ? 'cursor-pointer' : ''}`, 'pr-2')} onClick={header.column.getToggleSortingHandler()}>
                        {header.column.getIsSorted() === 'asc' ? <GoArrowUp /> : header.column.getIsSorted() === 'desc' ? <GoArrowDown /> : <GoArrowSwitch />}
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
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <ErrorBoundary key={`boundary-${row.id}`}>
              <tr
                key={row.id}
                className={cx(
                  "border-b",
                  `${highlightedRow.includes(Number(row.original.transactionId)) ? 'highlightGreenEasy' : ''}`,
                  `${deletedRows.includes(Number(row.original.transactionId)) ? 'delete-animation' : ''}`
                )}
              >
                <td key={`${row.id}-custom-1`} className="px-4 py-2 border-r border-gray-300">
                  <span className="flex flex-grow items-center justify-center space-x-2">
                    <WithTooltip text='Delete' position='top'>
                      <ConfirmAction
                        onConfirm={() => deleteRow(Number(row.original.transactionId))}
                        title={`Delete transaction forever?`}
                        body={<TransactionDetails transaction={row.original} />}
                      >
                        <MdDeleteForever
                          className="text-red-500 cursor-pointer hover:text-red-700 min-w-5 min-h-5"
                        />
                      </ConfirmAction>
                    </WithTooltip>

                    <WithTooltip text='Duplicate' position='top'>
                      <ConfirmAction
                        onConfirm={() => writeNewRow(row.original)}
                        confirmClassName="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        title={`Duplicate this transaction?`}
                        body={<TransactionDetails transaction={row.original} />}
                      >
                        <IoDuplicate
                          className="text-blue-300 cursor-pointer hover:text-blue-700 min-w-3 min-h-3"
                        />
                      </ConfirmAction>
                    </WithTooltip>
                  </span>
                </td>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border-r border-gray-300 group hover:bg-gray-50">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </ErrorBoundary>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}
          >
            <MdKeyboardDoubleArrowLeft />
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
          >
            <MdKeyboardArrowLeft />
          </button>
          <button
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
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
        <select className="border rounded px-2 py-1" value={table.getState().pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))}>
          {[10, 20, 30, 40, 50, 100, 200].map(pageSize => (
            <option key={pageSize} value={pageSize}> Show {pageSize} </option>
          ))}
        </select>
      </div>
      <div className="mt-2 text-sm">{table.getPrePaginationRowModel().rows.length} Rows</div>
    </div>
  );
};

function useSkipper() {
  const shouldSkipRef = useRef(true)
  const shouldSkip = shouldSkipRef.current

  // Wrap a function with this to skip a pagination reset temporarily
  const skip = useCallback(() => {
    shouldSkipRef.current = false
  }, [])

  useEffect(() => {
    shouldSkipRef.current = true
  })

  return [shouldSkip, skip] as const
}