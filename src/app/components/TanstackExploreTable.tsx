import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  ColumnFiltersState,
  getFacetedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel
} from '@tanstack/react-table';
import { filterFns, GroupingState } from "@tanstack/table-core";
import { FinanceSheetRow } from '../../db/WesterhamDatabase';
import { useEffect, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { cx, formatAmount } from '../util/util';
import { customFormatDate, epochToDateStr, getAbbreviatedMonth } from '../util/time';
import DraggableList, { ItemType } from './DraggableList';
import { MdOutlinePivotTableChart } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";



const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => new Date(row.epoch).getFullYear(), {
    id: 'year',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: () => <span>Year</span>,
    footer: info => info.column.id,
    aggregationFn: 'count',
  }),
  columnHelper.accessor(row => new Date(row.epoch).getMonth(), {
    id: 'month',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{getAbbreviatedMonth(initialValue)}</>;
    },
    header: () => <span>Month</span>,
    footer: info => info.column.id,
    aggregationFn: 'count',
  }),
  columnHelper.accessor(row => new Date(row.epoch).getDate(), {
    id: 'day',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: () => <span>Day</span>,
    footer: info => info.column.id,
  }),
  columnHelper.accessor('transactionId', {
    cell: info => info.getValue(),
    footer: info => info.column.id,
  }),
  columnHelper.accessor('amount', {
    header: () => 'Amount',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      const amt = formatAmount(initialValue);

      return <div className={initialValue < 0 ? "text-red-500" : ""}>{amt}</div>;
    },
    aggregatedCell({ getValue, row, column, table }) {
      const initialValue = getValue();

      const amt = formatAmount(initialValue);

      return <div className={initialValue < 0 ? "text-red-500" : ""}>{amt}</div>;
    },
    footer: ({ table }) => {
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + Number(row.getValue('amount')), 0);
      return `Total: ${formatAmount(total)}`;
    },
    aggregationFn: 'sum',
  }),
  columnHelper.accessor('source', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: 'Source',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('transactionInfo', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: 'Transaction Info',
    footer: info => info.column.id,
  }),
  columnHelper.accessor('category', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: 'Category',
    footer: info => info.column.id,
    filterFn: (row, columnId, filterValue, addMeta) => {
      if (filterValue === "only_null") {
        return row.getValue(columnId) === null || row.getValue(columnId) === undefined;
      }
      return filterFns.includesString(row, columnId, filterValue, addMeta); // Return all rows if filter is not active
    },
  }),
  columnHelper.accessor('providedDetail', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: 'Provided Detail',
    footer: info => info.column.id,
  }),
];

export interface TanstackExploreTableProps {
  data: FinanceSheetRow[];
}

export const TanstackExploreTable = ({ data }: TanstackExploreTableProps) => {
  const [rowData, setRowData] = useState<FinanceSheetRow[]>(data);
  useEffect(() => {
    setRowData(data);
  }, [data]);

  const [columnVisibility, setColumnVisibility] = useState({
    transactionId: false,
    day: false,
    source: false,
  });
  const [sorting, setSorting] = useState([
    { id: "year", desc: true },
    { id: "month", desc: true },
    { id: "day", desc: true },
    { id: "category", desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [grouping, setGrouping] = useState<GroupingState>(['year', 'month', 'category']);

  const initialItems: ItemType[] = grouping.map((item, idx) => {
    return {
      id: idx,
      text: item,
    }
  });

  const onDragEndCallback = (selectedItems: ItemType[], availableItems: ItemType[]) => {
    setGrouping(selectedItems.map(i => i.text));
  }

  const table = useReactTable({
    data: rowData,
    columns,
    state: { grouping, sorting, columnVisibility, columnFilters },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    getFacetedRowModel: getFacetedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGroupingChange: setGrouping,
  });

  return (
    <div className="flex flex-row justify-center">
      <DraggableList selectedItems={initialItems} availableItems={[]} onDragEndCallback={onDragEndCallback} renderItem={
        (item) => (
          <div className="p-1 justify-between text-center min-w-24">
            <div className="p-1 bg-blue-500 text-white rounded-lg cursor-grab shadow-md">
              {item.text}
            </div>
          </div>
        )
      } />
      <div className="">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div className='flex flex-row justify-center'>
                          {header.column.getIsGrouped() &&
                            <div className='flex flex-col justify-center px-1'>
                              <MdOutlinePivotTableChart />
                            </div>
                          }
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </div>
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td id={cell.id} className={cx(
                        cell.getIsGrouped() ? "border-2" : "",
                        cell.getIsAggregated() ? "border-x-2" : "",
                        cell.getIsPlaceholder() ? "border-4" : "",
                        !cell.getIsGrouped() && !cell.getIsAggregated() && !cell.getIsPlaceholder() ? "border-y-2" : ""
                      )}>
                        {cell.getIsGrouped() ? (
                          // If it's a grouped cell, add an expander and row count
                          <>
                            <button
                              onClick={row.getToggleExpandedHandler()}
                              className={cx(row.getCanExpand() ? "pointer" : "normal")}
                            >
                              <span className='flex flex-row justify-center text-center p-1'>
                                <div className='flex flex-col justify-center'>
                                  {row.getIsExpanded() ? <IoMdArrowDropdown /> : <IoMdArrowDropright />}{' '}
                                </div>
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}{' '}
                              </span>
                            </button>
                          </>
                        ) : cell.getIsAggregated() ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          flexRender(
                            cell.column.columnDef.aggregatedCell ??
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              {table.getFooterGroups().map(footerGroup =>
                footerGroup.headers.map(footer => (
                  <td key={footer.id} className="border-gray-500 p-1">
                    {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.footer, footer.getContext())}
                  </td>
                ))
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};