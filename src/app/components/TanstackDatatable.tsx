import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  getSortedRowModel
} from '@tanstack/react-table';
import { FinanceSheetRow } from '../../db/WesterhamDatabase';
import { useEffect, useReducer, useState } from 'react';
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import { customFormatDate } from '../util/time';

const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => row.epoch, {
    id: 'epoch',
    cell: info => <i>{customFormatDate(info.getValue())}</i>,
    header: () => <span>Date</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('transactionId', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('amount', {
    header: () => 'Amount',
    cell: info => info.renderValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('source', {
    header: 'Source',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('transactionInfo', {
    header: 'Transaction Info',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('providedDetail', {
    header: 'Provided Detail',
    footer: info => info.column.id,
  }),
];

export interface TanstackDataTableProps {
  data: FinanceSheetRow[];
}

export const TanstackDataTable = ({ data }: TanstackDataTableProps) => {
  const [filters, setFilters] = useState<{ [key: string]: string | null }>({});
  const [columnVisibility, setColumnVisibility] = useState({
    transactionId: false,
  });
  const [allRowData, _setAllRowData] = useState<FinanceSheetRow[]>([...data]);
  const [filteredData, _setFilteredData] = useState<FinanceSheetRow[]>([...data]);
  const [columnSizing, setColumnSizing] = useState<{ [key: string]: number }>({});
  const [sorting, setSorting] = useState([]);
  
  const rerender = useReducer(() => ({}), {})[1];

  useEffect(() => {
    _setAllRowData(data);
  }, [data]);

  useEffect(() => {
    const filteredData = allRowData.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return row[key as keyof FinanceSheetRow]?.toString() === value;
      });
    });

    _setFilteredData(filteredData);
  }, [allRowData, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { columnSizing, sorting, columnVisibility },
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    initialState: { pagination: { pageSize: 20 } },
    defaultColumn: {
      size: 200, //starting column size
      minSize: 50, //enforced during column resizing
      maxSize: 500, //enforced during column resizing
    },
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-gray-700">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="flex justify-center mt-2">
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="border p-1 rounded"
        >
          {[5, 10, 20, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="h-4 py-2" />
      <button
        onClick={() => rerender()}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-all"
      >
        Rerender
      </button>
      <div className="h-4 py-2" />


      <table className="w-full border-collapse border border-gray-200">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="bg-gray-100 text-left">
              {headerGroup.headers.map(header => {
                const columnId = header.column.id;
                const uniqueValues = [...new Set(data.map(row => row[columnId as keyof FinanceSheetRow]?.toString()))];

                return (
                  <th
                    key={header.id}
                    className="relative p-3 border border-gray-300 text-gray-700 font-semibold"
                    style={{ width: columnSizing[columnId] ?? 'auto' }}
                  >
                    <button className="flex items-center justify-between space-x-2" onClick={() => {
                      header.column.toggleSorting(undefined); // Toggle sorting direction
                    }}>
                      {header.column.getIsSorted() === 'asc' && <GoArrowUp />}
                      {header.column.getIsSorted() === 'desc' && <GoArrowDown />}
                      {header.column.getIsSorted() !== 'asc' && header.column.getIsSorted() !== 'desc' && <GoArrowSwitch />}
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </button>
                    <select
                      className="mt-1 w-full border rounded p-1 text-sm"
                      value={filters[columnId] ?? ""}
                      onChange={e => setFilters(prev => ({ ...prev, [columnId]: e.target.value || null }))}
                    >
                      <option value="">All</option>
                      {uniqueValues.map(value => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-100 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="p-3 border border-gray-300 text-gray-600"
                  style={{ 
                    width: columnSizing[cell.column.id] ?? 'auto',
                    overflow: 'hidden', 
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
