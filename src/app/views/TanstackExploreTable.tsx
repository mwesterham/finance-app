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
import { useEffect, useRef, useState } from 'react';
import { cx, formatAmount, prettyPrintString } from '../util/util';
import { getAbbreviatedMonth } from '../util/time';
import DraggableList, { ItemType } from '../components/DraggableList';
import { MdFilterList, MdOutlinePivotTableChart } from "react-icons/md";
import { IoMdArrowDropdown, IoMdArrowDropright } from "react-icons/io";
import { FaRegCircle, FaRegDotCircle } from "react-icons/fa";
import { IoFilterCircleOutline } from 'react-icons/io5';
import DatabaseService from "../util/DatabaseService";

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
    transactionInfo: false,
    category: true,
    providedDetail: true,
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

  const [filterDropdownCol, setFilterDropdownCol] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownCol(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (<>
    <div className="flex flex-col items-center">
      <div className='w-1/2'>
        <DraggableList selectedItems={initialSelectedItems} availableItems={initialAvailableItems} onDragEndCallback={onDragEndCallback}
          renderItem={(item, listeners) => {
            const colId = item.text;
            const isGrouped = grouping.includes(colId);
            const valuesMap = table.getColumn(colId)?.getFacetedUniqueValues();
            const allValues: string[] = [];

            if (valuesMap) {
              for (const [val] of valuesMap.entries()) {
                const value = val === null || val === undefined ? null : val;
                allValues.push(value);
              }
            }
            const activeFilterValues =
              (table.getColumn(colId)?.getFilterValue() as string[] | undefined) ?? allValues;

            const toggleFilterValue = (value: string) => {
              const current = new Set(activeFilterValues);
              if (current.has(value)) {
                current.delete(value);
              } else {
                current.add(value);
              }
              table.getColumn(colId)?.setFilterValue(Array.from(current));
            };

            const selectAll = () => {
              if (valuesMap) {
                table.getColumn(colId)?.setFilterValue(Array.from(valuesMap.keys()));
              }
            };

            const unselectAll = () => {
              table.getColumn(colId)?.setFilterValue([]);
            };

            return (
              <div className="p-1 justify-between text-center min-w-24 relative">
                <div className="flex flex-row bg-blue-500 text-white rounded-lg cursor-grab shadow-md">
                  <div {...listeners} className="flex flex-grow p-1 pl-4">
                    {prettyPrintString(item.text)}
                  </div>
                  {!isGrouped && (
                    <>
                      <button className="p-1" onClick={() => onColToggleCallback(colId)}>
                        {columnVisibility[colId] === false ? <FaRegCircle /> : <FaRegDotCircle />}
                      </button>
                    </>
                  )}

                  <button className="p-1 flex flex-row" onClick={() => setFilterDropdownCol(filterDropdownCol === colId ? null : colId)}>
                    {allValues.length == activeFilterValues.length ?
                      <span className='p-1'><MdFilterList /></span> :
                      <span><IoFilterCircleOutline size={24} /></span>
                    }
                  </button>
                </div>

                {filterDropdownCol === colId && (
                  <div ref={dropdownRef} className="absolute z-50 top-full mt-2 left-0 bg-white text-black shadow-lg p-2 rounded border w-48 max-h-64 overflow-auto">
                    <div className="flex justify-between gap-2 mb-2 text-sm">
                      <button onClick={selectAll} className="text-blue-600 hover:underline">Select All</button>
                      <button onClick={unselectAll} className="text-red-600 hover:underline">Unselect All</button>
                    </div>
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto text-sm">
                      {valuesMap &&
                        Array.from(valuesMap.entries())
                          .sort()
                          .map(([val, count]) => (
                            <label key={val} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={activeFilterValues?.includes(val as string)}
                                onChange={() => toggleFilterValue(val as string)}
                              />
                              <span>{colId == "month" ? getAbbreviatedMonth(val) : String(val)} <span className="text-gray-400 text-xs">({count})</span></span>
                            </label>
                          ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }}
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
  </>
  );
};