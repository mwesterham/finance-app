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
import { FinanceSheetRow } from '../../../db/WesterhamDatabase';
import { useEffect, useReducer, useState } from 'react';
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import { RowData } from "@tanstack/react-table";
import { customFormatDate } from '../../util/time';
import Filter from './Filter';
import ErrorBoundary from '../ErrorBoundary';

declare module '@tanstack/react-table' {
  //allows us to define custom properties for our columns
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: 'text' | 'range' | 'select'
  }
}

const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => row.epoch, {
    id: 'epoch',
    cell: info => <i>{customFormatDate(info.getValue())}</i>,
    header: () => <span>Date</span>,
    footer: info => info.column.id,
    meta: {
      filterVariant: 'range',
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
    cell: info => info.renderValue(),
    footer: info => info.column.id,
    meta: {
      filterVariant: 'range',
    },
  }),
  columnHelper.accessor('source', {
    header: 'Source',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('transactionInfo', {
    header: 'Transaction Info',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('category', {
    header: 'Category',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('providedDetail', {
    header: 'Provided Detail',
    footer: info => info.column.id,
    meta: {
      filterVariant: 'select',
    },
  }),
];

export interface TanstackDataTableProps {
  data: FinanceSheetRow[];
}

export const TanstackDataTable = ({ data }: TanstackDataTableProps) => {
  const [columnVisibility, setColumnVisibility] = useState({
    transactionId: false,
  });
  const [columnSizing, setColumnSizing] = useState<{ [key: string]: number }>({});
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )

  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    state: { columnSizing, sorting, columnVisibility, columnFilters },
    initialState: { pagination: { pageSize: 20 } },
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
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
  });

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-gray-300">
              {headerGroup.headers.map(header => (
                <th key={header.id} colSpan={header.colSpan} className="px-4 py-2 text-left">
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer flex items-center' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <span className='pr-2'>
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
              <tr key={row.id} className="border-b hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-2 border-r border-gray-300">
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
          <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()}> {'<<'} </button>
          <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}> {'<'} </button>
          <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}> {'>'} </button>
          <button className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50" onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()}> {'>>'} </button>
        </div>
        <span className="text-sm">Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <select className="border rounded px-2 py-1" value={table.getState().pagination.pageSize} onChange={e => table.setPageSize(Number(e.target.value))}>
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}> Show {pageSize} </option>
          ))}
        </select>
      </div>
      <div className="mt-2 text-sm">{table.getPrePaginationRowModel().rows.length} Rows</div>
    </div>
  );
};
