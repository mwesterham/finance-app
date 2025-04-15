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
import Filter from '../components/Filter';
import ErrorBoundary from '../components/ErrorBoundary';
import { cx, formatAmount, getPossibleValuesFromCol, prettyPrintString } from '../util/util';
import EditableInput from '../components/EditableInput';
import ConfirmAction from '../components/ConfirmAction';
import WithTooltip from '../components/WithTooltip';
import TransactionDetails from '../components/TransactionDetails';
import { customFormatDate, epochToDateStr } from '../util/time';
import DatabaseService from "../util/DatabaseService";


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


interface Rule {
  matchingExpression: string;
  category: string;
  providedDetail?: string;
}

const rules = [
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
        if(val == null || val == undefined) {
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
        if(val == null || val == undefined) {
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
];

export interface RuleBasedCategorizerProps {
}

export const RuleBasedCategorizer = (props: RuleBasedCategorizerProps) => {
  const [rowData, setRowData] = useState<FinanceSheetRow[]>([]);

  useEffect(() => {
    fetchDatabaseRows();
  }, []);
  

  const updateRow = async (transactionId: string, row: FinanceSheetRow) => {
    const result = await DatabaseService.updateRowInDatabase({
      transactionId,
      row,
    });
    console.log(result);
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

    // await fetchDatabaseRows();
  };

  const fetchDatabaseRows = async () => {
    DatabaseService.readEmptyCategoryDatabaseRows().then((values) => {
      console.log("Database read result length:", values.rows.length);
      setRowData(values.rows);
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

  return (
    <div className="p-4 bg-white shadow-md rounded-lg">
      <button
        onClick={applyRules}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Fill Database Using Rules
      </button>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} className="border-b border-gray-300">
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
                  "border-b"
                )}
              >
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
      <div className="p-4">
        <h2 className="text-xl font-bold mb-2">Defined Rules</h2>
        <div className="mt-4">
          <ul className="list-disc list-inside space-y-1">
            {rules.map((rule, idx) => (
              <li key={idx}>
                <span className="font-medium">"{rule.matchingExpression}"</span> ➝{" "}
                <span className="italic">{rule.category}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
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