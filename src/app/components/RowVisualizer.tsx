import { Chart, AxisOptions } from "react-charts";
import { useMemo } from "react";
import { FinanceSheetRow } from "../../db/WesterhamDatabase";

type Datum = { 
  primary: Date; 
  secondary: number 
}

function groupFinanceData(
  rowData: FinanceSheetRow[],
  pivotKey: keyof FinanceSheetRow
) {
  const grouped = new Map<string, Map<number, Datum>>();

  for (const row of rowData) {
    const key = String(row[pivotKey] ?? "Uncategorized");

    const date = new Date(row.epoch);
    date.setUTCDate(1);         // first of the month
    date.setUTCHours(0, 0, 0, 0); // reset time to midnight UTC
    const timestamp = date.getTime();

    if (!grouped.has(key)) {
      grouped.set(key, new Map());
    }

    const groupMap = grouped.get(key)!;
    const existing = groupMap.get(timestamp);

    if (existing) {
      existing.secondary += row.amount;
    } else {
      groupMap.set(timestamp, { primary: new Date(timestamp), secondary: row.amount });
    }
  }

  const items = Array.from(grouped.entries()).map(([label, map]) => ({
    label,
    data: Array.from(map.values()).sort((a, b) => a.primary.getTime() - b.primary.getTime()),
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
        scaleType: "time",
      }),
      []
    );
  
  const secondaryAxes = useMemo<AxisOptions<any>[]>(
    () => [
      {
        getValue: (datum) => datum.secondary,
        scaleType: "linear",
        elementType: "line",
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
          tooltip: true,
        }}
      />
    </div>
  );
}