import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ItemType } from "./DraggableList";
import { GroupingState, Table, VisibilityState } from "@tanstack/react-table";
import { FinanceSheetRow } from "../../db/WesterhamDatabase";
import { cx, getColumnDisplayName, prettyPrintString } from "../util/util";
import { FaRegCircle, FaRegDotCircle } from "react-icons/fa";
import { IoFilterCircleOutline } from 'react-icons/io5';
import { MdFilterList } from "react-icons/md";
import { useEffect, useRef, useState } from "react";

interface ExploreTableDimensionDisplayProps {
  item: ItemType;
  listeners: SyntheticListenerMap;
  grouping: GroupingState;
  table: Table<FinanceSheetRow>;
  columnVisibility: VisibilityState;
  onColToggleCallback: (col: string) => void;
}

const ExploreTableDimensionDisplay = (props: ExploreTableDimensionDisplayProps) => {
  const colId = props.item.text;
  const isGrouped = props.grouping.includes(colId);
  const valuesMap = props.table.getColumn(colId)?.getFacetedUniqueValues();
  const allValues: string[] = [];
  
  const [filterDropdownCol, setFilterDropdownCol] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string | null>(null);
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

  if (valuesMap) {
    for (const [val] of valuesMap.entries()) {
      const value = val === null || val === undefined ? null : val;
      allValues.push(value);
    }
  }
  const activeFilterValues =
    (props.table.getColumn(colId)?.getFilterValue() as string[] | undefined) ?? allValues;

  const toggleFilterValue = (value: string) => {
    const current = new Set(activeFilterValues);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    props.table.getColumn(colId)?.setFilterValue(Array.from(current));
  };

  const selectAll = () => {
    if (valuesMap) {
      props.table.getColumn(colId)?.setFilterValue(Array.from(valuesMap.keys()));
    }
  };

  const unselectAll = () => {
    props.table.getColumn(colId)?.setFilterValue([]);
  };

  return (
    <div className="p-1 justify-between text-center min-w-24 relative">
      <div className="flex flex-row bg-blue-500 text-white rounded-lg cursor-grab shadow-md">
        <div {...props.listeners} className="flex flex-grow p-1 pl-4">
          {prettyPrintString(props.item.text)}
        </div>
        {!isGrouped && (
          <>
            <button className="p-1" onClick={() => props.onColToggleCallback(colId)}>
              {props.columnVisibility[colId] === false ? <FaRegCircle /> : <FaRegDotCircle />}
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
        <div ref={dropdownRef} className="absolute z-50 top-full mt-2 left-0 bg-white text-black shadow-lg p-2 rounded border max-h-96 min-w-48 max-w-72 overflow-x-auto overflow-y-auto">
          <span className="flex flex-col">
            <div className="flex justify-between gap-2 mb-2 text-sm">
              <button onClick={selectAll} className="text-blue-600 hover:underline">Select All</button>
              <button onClick={unselectAll} className="text-red-600 hover:underline">Unselect All</button>
            </div>
            <div className="py-2">
              <input
                type={"text"}
                onChange={(e) => setInputValue(e.target.value)}
                className="border rounded px-2 py-1"
              />
            </div>
          </span>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto text-sm">
            {valuesMap &&
              Array.from(valuesMap.entries())
                .sort()
                .map(([val, count]) => (
                  <label key={val} className={cx(
                    "flex items-center gap-2 whitespace-nowrap", 
                    inputValue != null && inputValue.length != 0 && !getColumnDisplayName(val, colId).toLowerCase().includes(inputValue.toLowerCase()) ? "hidden" : ""
                    )}>
                    <input
                      type="checkbox"
                      checked={activeFilterValues?.includes(val as string)}
                      onChange={() => toggleFilterValue(val as string)}
                    />
                    <span>{getColumnDisplayName(val, colId)} <span className="text-gray-400 text-xs">({count})</span></span>
                  </label>
                ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ExploreTableDimensionDisplay;