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
import { Rule } from '../../db/WesterhamDatabase';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdDeleteForever
} from "react-icons/md";
import { IoDuplicate } from "react-icons/io5";
import { RowData } from "@tanstack/react-table";
import Filter from '../components/Filter';
import ErrorBoundary from '../components/ErrorBoundary';
import { cx, formatAmount, getPossibleValuesFromCol, prettyPrintString } from '../util/util';
import EditableInput from '../components/EditableInput';
import ConfirmAction from '../components/ConfirmAction';
import WithTooltip from '../components/WithTooltip';
import TransactionDetails from '../components/TransactionDetails';
import { customFormatDate, epochToDateStr } from '../util/time';
import DatabaseService from "../util/DatabaseService";
import { RuleForm } from '../components/RuleForm';
import RuleDetails from '../components/RuleDetails';


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

const CATEGORIES = [
  "01 - Deposit",
  "02 - Education",
  "03 - Music",
  "04 - Utilities",
  "05 - Cellphone",
  "06 - Home",
  "07 - Mortgage",
  "08 - Transfer",
  "09 - Tax",
  "10 - Donation",
  "11 - Medical",
  "12 - ATM",
  "13 - CC Payment",
  "14 - Misc Exp",
  "15 - Groceries",
  "16 - Restaurant",
  "17 - Auto",
  "18 - Entertainment",
  "19 - Fitness",
  "20 - Haircut",
  "21 - Clothes",
  "22 - Travel",
  "23 - Internet",
  "24 - Gift",
  "25 - Investments",
  "26 - Insurance",
  "27 - Venmo Transfer",
  "28 - Donation",
  "29 - Electronics",
  "30 - Fraud",
  "31 - Subscription",
  "32 - Balance Transfer",
  "33 - Restringing Payment"
];

const updateRule = async (ruleId: string, rule: Rule) => {
  const result = await DatabaseService.updateRuleInDatabase({
    ruleId,
    rule,
  });
  console.log(result);
};

const columnHelper = createColumnHelper<Rule>();

const columns = [
  columnHelper.accessor('matchingExpression', {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();

      // Handle changes to the input field
      const onChange = async (val: any) => {
        let isBlank = false;
        if(val == null || val == undefined) {
          console.warn(`${prettyPrintString(column.id)} is blank. Setting to randome string.`);
          isBlank = true;
        }
        const str = isBlank ? String(Math.random()) : String(val);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRule(row.original.ruleId, {
          ...row.original,
          matchingExpression: str
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
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'search',
    },
  }),
  columnHelper.accessor('category', {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();

      // Handle changes to the input field
      const onChange = async (val: any) => {
        let isBlank = false;
        if(val == null || val == undefined) {
          console.warn(`${prettyPrintString(column.id)} is blank. Setting to random string.`);
          isBlank = true;
        }
        const str = isBlank ? String(Math.random()) : String(val);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRule(row.original.ruleId, {
          ...row.original,
          category: str
        });
      };

      return <>
        <EditableInput
          value={value}
          type="text"
          displayBody={<>{value}</>}
          suggestions={CATEGORIES}
          onChange={onChange}
        />
      </>;
    },
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
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
      const value = getValue();

      // Handle changes to the input field
      const onChange = async (val: any) => {
        let isBlank = false;
        if(val == null || val == undefined) {
          console.warn(`${prettyPrintString(column.id)} is blank. Setting to null.`);
          isBlank = true;
        }
        const str = isBlank ? undefined : String(val);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
        await updateRule(row.original.ruleId, {
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
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'search',
    },
  }),
  columnHelper.accessor('ruleId', {
    cell: info => info.getValue(),
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'select',
    },
  }),
];

export interface RuleManagerProps {
}

export const RuleManager = (props: RuleManagerProps) => {
  const [ruleData, setRuleData] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletedRows, setDeletedRows] = useState<number[]>([]);

  useEffect(() => {
    fetchDatabaseRules();
  }, []);

  const writeRule = async (rule: Rule) => {
    const result = await DatabaseService.writeRuleToDatabase({
      rule,
    });
    console.log(result);
  };

  const fetchDatabaseRules = async () => {
    DatabaseService.readDatabaseRules().then((values) => {
      console.log("Database rules read result length:", values.rules.length);
      setRuleData(values.rules);
    });
  };

  const deleteRule = async (ruleId: number) => {
      console.log("Deleting rule with ID:", ruleId);
      setTimeout(async () => {
        const result = await DatabaseService.deleteRuleFromDatabase({ ruleId });
        console.log(result);
        setDeletedRows([]);
        fetchDatabaseRules();
      }, 1000);
      setDeletedRows([ruleId])
    };

  const [columnVisibility, setColumnVisibility] = useState({
    ruleId: false,
  });
  const [columnSizing, setColumnSizing] = useState<{ [key: string]: number }>({});
  const [sorting, setSorting] = useState([
    { id: "matchingExpression", desc: false }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  );
  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data: ruleData,
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
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
        // Skip page index reset until after next rerender
        skipAutoResetPageIndex();
        setRuleData(old =>
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
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => setShowModal(true)}
        >
          + New Rule
        </button>
      </div>

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
                  `${deletedRows.includes(Number(row.original.ruleId)) ? 'delete-animation' : ''}`
                )}
              >
                <td key={`${row.id}-custom-1`} className="px-4 py-2 border-r border-gray-300">
                  <span className="flex flex-grow items-center justify-center space-x-2">
                    <WithTooltip text='Delete' position='top'>
                      <ConfirmAction
                        onConfirm={() => deleteRule(Number(row.original.ruleId))}
                        title={`Delete transaction forever?`}
                        body={<RuleDetails rule={row.original} />}
                      >
                        <MdDeleteForever
                          className="text-red-500 cursor-pointer hover:text-red-700 min-w-5 min-h-5"
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
      {showModal  && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
            <h1 className="text-xl font-semibold pb-4">Create Rule</h1>
            
            <RuleForm
              onSubmit={async (newRule) => {
                await DatabaseService.writeRuleToDatabase({ rule: newRule });
                setShowModal(false);
                fetchDatabaseRules();
              }}
              onCancel={() => setShowModal(false)}
              categories={CATEGORIES}
            />

          </div>
        </div>
      )}
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