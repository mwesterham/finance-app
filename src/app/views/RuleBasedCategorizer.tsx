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
import { FinanceSheetRow, Rule } from '../../db/WesterhamDatabase';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GoArrowDown, GoArrowUp, GoArrowSwitch } from "react-icons/go";
import {
  MdKeyboardDoubleArrowRight,
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdAssignmentAdd
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
import RuleDetails from '../components/RuleDetails';
import { RuleForm } from '../components/RuleForm';


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

const ruleFromFinanceRow = (row: FinanceSheetRow) => {
  return {
    ruleId: "N/A",
    matchingExpression: row.transactionInfo,
    category: row.category,
    providedDetail: row.providedDetail,
  } as Rule;
}

const columnHelper = createColumnHelper<FinanceSheetRow>();

const columns = [
  columnHelper.accessor(row => row.epoch, {
    id: 'epoch',
    cell: info => epochToDateStr(info.getValue()),
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'daterange',
    },
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    cell: info => <div className={info.getValue() < 0 ? "text-red-500" : ""}>{formatAmount(info.getValue())}</div>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'range',
    },
  }),
  columnHelper.accessor('category', {
    cell: ({ getValue, row, column, table }) => {
      const value = getValue();

      // Handle changes to the input field
      const onChange = async (val: any) => {
        let isBlank = false;
        if (val == null || val == undefined) {
          console.warn(`${prettyPrintString(column.id)} is blank. Setting to undefined.`);
          isBlank = true;
        }
        const str = isBlank ? undefined : String(val);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
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
        if (val == null || val == undefined) {
          console.warn(`${prettyPrintString(column.id)} is blank. Setting to null.`);
          isBlank = true;
        }
        const str = isBlank ? undefined : String(val);
        table.options.meta?.updateData(row.index, column.id, str); // Update data on change
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
  columnHelper.accessor('transactionId', {
    cell: info => info.getValue(),
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'select',
    },
  }),
  columnHelper.accessor('transactionInfo', {
    cell: info => info.getValue(),
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'search',
    },
  }),
  columnHelper.accessor('source', {
    cell: info => info.getValue(),
    header: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    footer: ({ column }) => <span>{prettyPrintString(column.id)}</span>,
    meta: {
      filterVariant: 'select',
    },
  }),
];

export interface RuleBasedCategorizerProps {
}

export const RuleBasedCategorizer = (props: RuleBasedCategorizerProps) => {
  const [rowData, setRowData] = useState<FinanceSheetRow[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleToShow, setRuleToShow] = useState<Rule>(null);

  useEffect(() => {
    fetchDatabaseRows();
    fetchDatabaseRules();
  }, []);


  const updateRows = async () => {
    rowData.forEach(async (row: FinanceSheetRow) => {
      if (row.transactionId && row.category) {
        const result = DatabaseService.updateRowInDatabase({
          transactionId: row.transactionId,
          row,
        });
        console.log(result);
      }
    })
  };

  const applyRules = async () => {
    let newRowData = rowData;
    for (let row of newRowData) {
      const matchedRule = rules.find(rule =>
        row.transactionInfo?.toLowerCase().includes(rule.matchingExpression.toLowerCase())
      );

      if (matchedRule && row.category !== matchedRule.category) {
        // const updatedRow = { ...row, category: matchedRule.category };
        // await updateRow(row.transactionId, updatedRow);
        row.category = matchedRule.category;
        row.providedDetail = matchedRule.providedDetail;
      }
    }
    setRowData([...newRowData]);
  };

  const fetchDatabaseRows = async () => {
    DatabaseService.readEmptyCategoryDatabaseRows().then((values) => {
      console.log("Database rinance rows read result length:", values.rows.length);
      setRowData(values.rows);
    });
  };

  const fetchDatabaseRules = async () => {
    DatabaseService.readDatabaseRules().then((values) => {
      console.log("Database rules read result length:", values.rules.length);
      setRules(values.rules);
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
      updateData: (rowIndex: number, columnId: string, value: unknown) => {
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

  return (<>
    <div className="p-4 bg-white shadow-md rounded-lg">
      <div className='flex space-x-4'>
        <button
          onClick={applyRules}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
        >
          Fill Database Using Rules (found {rules.length} rules)
        </button>
        <button
          onClick={async () => {
            await updateRows();
            fetchDatabaseRows();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
        >
          Submit changes
        </button>
      </div>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-gray-300">
              <th key={`${headerGroup.id}-custom-1`} className="px-4 py-2 text-left">
                Manage
              </th>
              {headerGroup.headers.map(header => (<>
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
              </>))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <ErrorBoundary key={`boundary-${row.id}`}>
              <tr
                key={row.id}
                className={cx(
                  "border-b"
                )}
              >
                <td key={`${row.id}-custom-1`} className="px-4 py-2 border-r border-gray-300">
                  <span className="flex flex-grow items-center justify-center space-x-2">
                    <WithTooltip text='Create Rule' position='left'>
                      <MdAssignmentAdd
                        className="text-blue-500 cursor-pointer hover:text-blue-700 min-w-5 min-h-5"
                        onClick={() => setRuleToShow(ruleFromFinanceRow(row.original))}
                      />
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
    {ruleToShow && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl w-full">
          <h1 className="text-xl font-semibold pb-4">Create Rule</h1>
          <RuleForm
            defaultRule={ruleToShow}
            onSubmit={async (newRule) => {
              await DatabaseService.writeRuleToDatabase({ rule: newRule });
              setRuleToShow(null);
              fetchDatabaseRules();
            }}
            onCancel={() => setRuleToShow(null)}
            categories={CATEGORIES}
          />
        </div>
      </div>
    )}
  </>
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