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

const updateRule = async (ruleId: string, rule: Rule) => {
  const result = await DatabaseService.updateRuleInDatabase({
    ruleId,
    rule,
  });
};

const columnHelper = createColumnHelper<Rule>();

const getColumns = (
  suggestedCategories: string[], 
  providedDetailOptions: string[]
) => [
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
          suggestions={suggestedCategories}
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
          suggestions={providedDetailOptions}
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

const rules: Rule[] = [
  { matchingExpression: "AMAZON.COM SVCS DIRECT DEP", category: "01 - Deposit", providedDetail: "Paycheck" },
  { matchingExpression: "WELLS FARGO REWARDS", category: "01 - Deposit", providedDetail: "Cash Rewards" },
  { matchingExpression: "STARBUCKS", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "CHIPOTLE 2859 PHOENIX AZ", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "THE STREET BOBA CAFE", category: "16 - Restaurant" },
  { matchingExpression: "EOS FITNESS ABC CLUB FEES", category: "19 - Fitness", providedDetail: "Gym Membership + Annual Fee" },
  { matchingExpression: "COSTCO WHSE", category: "15 - Groceries" },
  { matchingExpression: "WF Credit Card AUTO PAY", category: "13 - CC Payment", providedDetail: "CC Pmt - MATTHEW" },
  { matchingExpression: "SCHWAB BROKERAGE MONEYLINK", category: "25 - Investments", providedDetail: "Cash Acct" },
  { matchingExpression: "EVERYDAY CHECKING MONTHLY CAR PAYMENT", category: "17 - Auto", providedDetail: "Rav4 XLE Car Payment" },
  { matchingExpression: "FRYS-MKTPLACE", category: "15 - Groceries", providedDetail: "Grocery Shopping" },
  { matchingExpression: "SAFEWAY", category: "15 - Groceries", providedDetail: "Grocery Shopping" },
  { matchingExpression: "FRYS-FOOD-DRG", category: "15 - Groceries", providedDetail: "Grocery Shopping" },
  { matchingExpression: "AMAZON GROCE*", category: "15 - Groceries", providedDetail: "Grocery Shopping" },
  { matchingExpression: "LEE LEE INTERNATIONAL", category: "15 - Groceries", providedDetail: "Grocery Shopping" },
  { matchingExpression: "Amazon Tips", category: "15 - Groceries", providedDetail: "Grocery tips" },
  { matchingExpression: "AUTOMATIC PAYMENT - THANK YOU", category: "13 - CC Payment", providedDetail: "CC PMT" },
  { matchingExpression: "8680 EOS FITNESS", category: "19 - Fitness", providedDetail: "EoS Gym Membership" },
  { matchingExpression: "ARIZONA BADMINTON CENT MESA AZ", category: "19 - Fitness", providedDetail: undefined },
  { matchingExpression: "COSTCO GAS", category: "17 - Auto", providedDetail: "Gas" },
  { matchingExpression: "TST* AHIPOKI", category: "16 - Restaurant", providedDetail: "Hawaiian Food" },
  { matchingExpression: "PANERA BREAD", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "CAFE ZUPAS", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "PERFECT PEAR BISTRO", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "RAISING CANES", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "TST*ANGIES LOBSTER", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "JASON'S DELI", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "TST* CAFE 86-CHANDLER", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "THE KICKIN CRAB", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "GOLDEN CORRAL", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "TST*JOES REAL BBQ", category: "16 - Restaurant", providedDetail: "American Food" },
  { matchingExpression: "LA MADELENINE", category: "16 - Restaurant", providedDetail: "French Food" },
  { matchingExpression: "SAKURA SUSHI", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "SUSHI SAN", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "TASTY POT", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "SQ *SO GONG DONG", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "CHODANG RESTAURANT", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "PACIFIC SEAFOOD BUFFET", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "MOCHINUT", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "SQ *A MA'S KITCHEN AND", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "85C BAKERY CAFE", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "POP POT & TEA.", category: "16 - Restaurant", providedDetail: "Asian Food" },
  { matchingExpression: "DAVES HOT CHICKEN", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "SQ *CAIRO'S GYROS", category: "16 - Restaurant", providedDetail: "Mediterranean Food" },
  { matchingExpression: "SQ *GREEN CORNER", category: "16 - Restaurant", providedDetail: "Mediterranean Food" },
  { matchingExpression: "SNOWTIME", category: "16 - Restaurant", providedDetail: "Dessert" },
  { matchingExpression: "MEET FRESH", category: "16 - Restaurant", providedDetail: "Dessert" },
  { matchingExpression: "GDP*Gelato Cimmino", category: "16 - Restaurant", providedDetail: "Dessert" },
  { matchingExpression: "SALAD AND GO", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "WENDY'S", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "SONIC DRIVE IN", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "SQ *SHAKE SHACK", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "ARBYS", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "MCDONALD", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "JACK IN THE BOX", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "PANDA EXPRESS", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "FIVE BELOW", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "TWO HANDS", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "CHICK-FIL-A", category: "16 - Restaurant", providedDetail: "Fast Food" },
  { matchingExpression: "DABOBA", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "SQ *ZERO DEGREES", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "THE ALLEY", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "CARIBOU COFFEE", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "KADA VIETNAMESE COFFEE", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "POLBA TEA", category: "16 - Restaurant", providedDetail: "Drink" },
  { matchingExpression: "Amazon Prime*", category: "31 - Subscription", providedDetail: "Amazon Prime" },
  { matchingExpression: "GOOGLE *Ellation 855-836-3987 CA", category: "31 - Subscription", providedDetail: "Crunchyroll subscription" },
  { matchingExpression: "GOOGLE *Crunchyroll", category: "31 - Subscription", providedDetail: "Crunchyroll subscription" },
  { matchingExpression: "FRYS FUEL", category: "17 - Auto", providedDetail: "Gas" },
  { matchingExpression: "STATE FARM INSURANCE", category: "17 - Auto", providedDetail: "Insurance" },
  { matchingExpression: "BIG O TIRES", category: "17 - Auto", providedDetail: undefined },
  { matchingExpression: "FSP*DOWNTOWN TEMPE", category: "17 - Auto", providedDetail: "Parking Pass" },
  { matchingExpression: "DTA-PM COT parkmobilecomAZ", category: "17 - Auto", providedDetail: "Parking Fee" },
  { matchingExpression: "PARKING - SE HFG", category: "17 - Auto", providedDetail: "Parking Fee" },
  { matchingExpression: "DAISO", category: "14 - Misc Exp", providedDetail: undefined },
];

export interface RuleManagerProps {
}

export const RuleManager = (props: RuleManagerProps) => {
  const [ruleData, setRuleData] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [deletedRows, setDeletedRows] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [providedDetailOptions, setProvidedDetailOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchDatabaseRules();
    populateOptions();
  }, []);

  const populateOptions = async () => {
    const categoriesResult = await DatabaseService.getDistinctValuesOfColumn({
      table: "finance_sheet",
      column: "category"
    });
    const detailsResult = await DatabaseService.getDistinctValuesOfColumn({
      table: "finance_sheet",
      column: "provided_detail"
    })
    setCategoryOptions(categoriesResult.distinctValues.sort());
    setProvidedDetailOptions(detailsResult.distinctValues.sort());
  }

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
    columns: getColumns(categoryOptions, providedDetailOptions),
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