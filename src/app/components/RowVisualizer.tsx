import { Chart, AxisOptions } from "react-charts";
import { useMemo } from "react";

export interface FinanceSheetRow {
  transactionId?: string;
  epoch: number;
  amount: number;
  source: string;
  transactionInfo: string;
  category?: string;
  providedDetail?: string;
}

type Datum = { 
  primary: Date; 
  secondary: number 
}

function groupFinanceData(
  rowData: FinanceSheetRow[],
  pivotKey: keyof FinanceSheetRow
) {
  const grouped = rowData.reduce((acc, row) => {
    const key = row[pivotKey] ?? "Uncategorized";
    const date = new Date(row.epoch);
    const primary = date;
    if (!acc[key]) {
      acc[key] = [];
    }

    const element = acc[key].find(e => e.primary == primary);
    if (element == undefined) {
      acc[key].push({ primary: primary, secondary: row.amount });
    }
    else {
      element.secondary += row.amount;
    }
    return acc;
  }, {} as Record<string, Datum[]>);

  return Object.entries(grouped).map(([label, data]) => ({ label, data }));
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
        scaleType: "linear",
        elementType: "bar",
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