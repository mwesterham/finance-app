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
import { getFacetedUniqueValues, GroupingState, Row } from "@tanstack/table-core";
import { FinanceSheetRow } from '../../db/WesterhamDatabase';
import { useEffect, useState } from 'react';
import { cx, formatAmount, getColumnDisplayName, prettyPrintString } from '../util/util';
import { getAbbreviatedMonth } from '../util/time';
import DraggableList, { ItemType } from '../components/DraggableList';
import { MdOutlinePivotTableChart } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import DatabaseService from "../util/DatabaseService";
import { RowVisualizer } from '../components/RowVisualizer';
import ExploreTableDimensionDisplay from '../components/ExploreTableDimensionDisplay';
import { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

const multiSelectFilter = (row: Row<FinanceSheetRow>, columnId: string, filterValue: string[]) => {
  if (!filterValue?.length) return false; // Show none if no filters
  const stringFilters = filterValue.map(e => String(e));
  const value = row.getValue(columnId);
  return stringFilters.includes(String(value));
};

const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => new Date(row.epoch).getFullYear(), {
    id: 'year',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor(row => new Date(row.epoch).getMonth(), {
    id: 'month',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{getAbbreviatedMonth(initialValue)}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor(row => new Date(row.epoch).getDate(), {
    id: 'day',
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor('transactionId', {
    cell: info => info.getValue(),
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
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
      const rows = table.getGroupedRowModel().rows;
      const total = table.getFilteredRowModel().rows.reduce((sum, row) => sum + Number(row.getValue('amount')), 0);
      const avg = rows.length > 0 ? total / rows.length : 0;
      return <>
        <div>
          {`Total: ${formatAmount(total)}`}
        </div>
        <div>
          {`Average: ${formatAmount(avg)}`}
        </div>
      </>;
    },
    aggregationFn: 'sum',
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor('source', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor('transactionInfo', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
  columnHelper.accessor('category', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    filterFn: multiSelectFilter,
    aggregationFn: undefined,
  }),
  columnHelper.accessor('providedDetail', {
    cell: ({ getValue, row, column, table }) => {
      const initialValue = getValue();

      return <>{initialValue}</>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    aggregationFn: undefined,
    filterFn: multiSelectFilter,
  }),
];

// this also decides the initial ordering
const defaultPivotedKeys = [
  'year',
  'month',
  'category',
];
const orderedTableCols: string[] = [
  ...defaultPivotedKeys,
  'day',
  'amount',
  'providedDetail',
  'transactionInfo',
  'source',
  'transactionId',
];

const getHierarchy = (row: Row<FinanceSheetRow>): {k: string; v: string;}[] => {
  const thisElement = {k: prettyPrintString(row.groupingColumnId), v: getColumnDisplayName(row.groupingValue, row.groupingColumnId)};
  if (!row.getParentRow()) {
    return [thisElement];
  }
  else {
    return [...getHierarchy(row.getParentRow()), thisElement]
  }
}

export interface TanstackExploreTableProps {
}

export const TanstackExploreTable = (props: TanstackExploreTableProps) => {
  const [rowData, setRowData] = useState<FinanceSheetRow[]>([]);

  useEffect(() => {
    DatabaseService.readDatabaseRows().then((values) => {
      console.log("Database read result length:", values.rows.length);
      setRowData(values.rows);
    });
  }, []);

  const [columnVisibility, setColumnVisibility] = useState<{ [key: string]: boolean }>({
    year: true,
    month: true,
    day: false,
    amount: true,
    transactionId: false,
    source: false,
    transactionInfo: true,
    category: true,
    providedDetail: false,
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

  const toggleVisibility = (col: string, override?: boolean) => {
    const originalColVisibility = columnVisibility[col];
    const newColVis = !originalColVisibility;
    columnVisibility[col] = override != undefined ? override : newColVis;
    setColumnVisibility({
      ...columnVisibility
    });
  }

  const allItems: ItemType[] = orderedTableCols.map((item, idx) => {
    return {
      id: idx,
      text: item,
    }
  });

  const [grouping, setGrouping] = useState<GroupingState>([...defaultPivotedKeys]);
  const initialSelectedItems = allItems.filter(i => defaultPivotedKeys.includes(i.text));
  const initialAvailableItems = allItems.filter(i => !defaultPivotedKeys.includes(i.text));

  const onDragEndCallback = (selectedItems: ItemType[], availableItems: ItemType[]) => {
    const newColumnOrder = [...selectedItems, ...availableItems].map(i => i.text);
    const newGrouping = selectedItems.map(i => i.text);
    setGrouping(newGrouping);
    newGrouping.forEach(col => toggleVisibility(col, true))
    table.setColumnOrder(newColumnOrder);
  }

  const onColToggleCallback = (col: string) => {
    if (!grouping.includes(col)) {
      toggleVisibility(col);
    }
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
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGroupingChange: setGrouping,
  });

  const [visualizeRows, setVisualizeRows] = useState(table.getFilteredRowModel().rows.map(r => r.original));

  useEffect(() => {
    setVisualizeRows(table.getFilteredRowModel().rows.map(r => r.original));
  }, [table.getFilteredRowModel()])

  return (<>
    <div className="flex flex-col items-center">
      <div className='w-1/2'>
        <DraggableList selectedItems={initialSelectedItems} availableItems={initialAvailableItems} onDragEndCallback={onDragEndCallback}
          renderItem={(item: ItemType, listeners: SyntheticListenerMap) => <>
            <ExploreTableDimensionDisplay 
              item={item}
              listeners={listeners}
              grouping={grouping}
              table={table}
              columnVisibility={columnVisibility}
              onColToggleCallback={onColToggleCallback}
            />
          </>}
        />
        {/** End of draggable list */}
      </div>
    </div>
    <div className="flex flex-col items-center">
      <div className='w-3/4'>

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
                          <span className='flex flex-row space-x-4'>
                            <div className={cx(row.getIsExpanded() && cell.getValue() ? "font-bold" : '')}>
                              {
                                flexRender(
                                  cell.column.columnDef.aggregatedCell ??
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )
                              }
                            </div>
                            <div className={cx(row.getIsExpanded() && cell.getValue() ? "" : 'hidden')}>
                              {getHierarchy(row).map((e) => `${e.v}`).join(" / ")}
                            </div>
                          </span>
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
    {visualizeRows.length > 0 && 
      <RowVisualizer
        rows={visualizeRows}
        pivotKey="category"
      />
    }
  </>
  );
};