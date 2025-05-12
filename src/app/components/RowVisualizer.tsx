import { Chart, AxisOptions } from "react-charts";
import { useMemo } from "react";
import { FinanceSheetRow } from "../../db/WesterhamDatabase";

type Datum = { 
  primary: string; 
  secondary: number 
}

function groupFinanceData(
  rowData: FinanceSheetRow[],
  pivotKey: keyof FinanceSheetRow
) {
  const grouped = new Map<string, Map<string, Datum>>();

  for (const row of rowData.sort((a, b) => a.epoch - b.epoch)) {
    const key = String(row[pivotKey] ?? "Uncategorized");

    const date = new Date(row.epoch);
    date.setUTCDate(15);         // first of the month
    date.setUTCHours(0, 0, 0, 0); // reset time to midnight UTC

    if (!grouped.has(key)) {
      grouped.set(key, new Map());
    }

    const primary = date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
    const groupMap = grouped.get(key)!;
    const existing = groupMap.get(primary);

    if (existing) {
      existing.secondary += row.amount;
    } else {
      groupMap.set(primary, { 
        primary, 
        secondary: row.amount 
      });
    }
  }

  const items = Array.from(grouped.entries()).map(([label, map]) => ({
    label,
    data: Array.from(map.values()),
  }));
  return items;
}


interface RowVisualizerProps {
  rows: FinanceSheetRow[];
  pivotKey?: keyof FinanceSheetRow;
}

export const RowVisualizer = ({ rows, pivotKey = "category", }: RowVisualizerProps) => {
  const data = useMemo(() => groupFinanceData(rows, pivotKey), [rows, pivotKey]);

  const primaryAxis = useMemo<AxisOptions<any>>(
      () => ({
        getValue: (datum) => datum.primary,
      }),
      []
    );
  
  const secondaryAxes = useMemo<AxisOptions<any>[]>(
    () => [
      {
        getValue: (datum) => datum.secondary,
        elementType: "bar",
      },
    ],
    []
  );

  return (
    <div className="w-full h-96">
      <Chart
        options={{
          data,
          primaryAxis,
          secondaryAxes,
        }}
      />
    </div>
  );
}