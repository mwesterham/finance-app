import { Column } from "@tanstack/table-core/build/lib";
import { useEffect, useMemo, useState } from "react";
import { getPossibleValuesFromCol } from "../util/util";

interface FilterProps { 
  column: Column<any, unknown> 
}

const Filter = (props: FilterProps) => {
  const column = props.column;
  const { filterVariant } = column.columnDef.meta ?? {}

  const columnFilterValue = column.getFilterValue()

  const sortedUniqueValues = useMemo(
    () =>
      filterVariant === 'range'
        ? []
        : getPossibleValuesFromCol(column),
    [column.getFacetedUniqueValues(), filterVariant]
  )

  switch(filterVariant) {
    case 'range': {
      return (
        <div>
          <div className="flex space-x-2">
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[0] ?? ''}
              onChange={value =>
                column.setFilterValue((old: [number, number]) => [value, old?.[1]])
              }
              placeholder={"Min"}
              className="w-24 border shadow rounded p-1"
            />
            <DebouncedInput
              type="number"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={(columnFilterValue as [number, number])?.[1] ?? ''}
              onChange={value =>
                column.setFilterValue((old: [number, number]) => [old?.[0], value])
              }
              placeholder={"Max"}
              className="w-24 border shadow rounded p-1"
            />
          </div>
        </div>
      )
    }
    case "daterange": {
      return (
        <div>
          <div className="flex space-x-2">
            <DebouncedInput
              type="date"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={
                columnFilterValue && !isNaN(Number(columnFilterValue))
                  ? new Date(Number(columnFilterValue)).toISOString().split('T')[0]
                  : ""
              }
              onChange={value => {
                const epochSeconds = value ? Math.floor(new Date(value).getTime()) : null;
                console.log(epochSeconds)
                column.setFilterValue((old: [number, number]) => [epochSeconds, old?.[1]]);
              }}
              className="w-36 border shadow rounded p-1"
            />
            <DebouncedInput
              type="date"
              min={Number(column.getFacetedMinMaxValues()?.[0] ?? '')}
              max={Number(column.getFacetedMinMaxValues()?.[1] ?? '')}
              value={
                columnFilterValue && !isNaN(Number(columnFilterValue))
                  ? new Date(Number(columnFilterValue)).toISOString().split('T')[0]
                  : ""
              }
              onChange={value => {
                const epochSeconds = value ? Math.floor(new Date(value).getTime()) : null;
                column.setFilterValue((old: [number, number]) => [old?.[0], epochSeconds]);
              }}
              className="w-36 border shadow rounded p-1"
            />
          </div>
        </div>
      );
    }
    case 'select': {
      return (
        <select
          className="p-1"
          onChange={e => column.setFilterValue(e.target.value)}
          value={columnFilterValue?.toString()}
        >
          <option value="">All</option>
          <option value={"only_null"}>Only Missing</option>
          {sortedUniqueValues.filter((s) => s != null).map(value => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      )
    }
    case 'search':
    default: {
      return (
        <>
          {/* Autocomplete suggestions from faceted values feature */}
          <datalist id={column.id + 'list'}>
            {sortedUniqueValues.map((value: any) => (
              <option value={value} key={value} />
            ))}
          </datalist>
          <div className="flex space-x-2">
            <DebouncedInput
              type="text"
              value={(columnFilterValue ?? '') as string}
              onChange={value => column.setFilterValue(value)}
              placeholder={"Search..."}
              className="w-36 border shadow rounded p-1 flex flex-grow"
              list={column.id + 'list'}
            />
          </div>
        </>
      )
    }
  }
}

interface DebounceInputProps {
  value: string | number
  onChange: (value: string | number) => void
  debounce?: number
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: DebounceInputProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>)  =>{
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <input {...props} value={value} onChange={e => setValue(e.target.value)} />
  )
}

export default Filter;