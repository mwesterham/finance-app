import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { useState } from "react";
import { PivotTableProps } from "react-pivottable";

// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);

const PivotTable = ({ data }: { data: any[] }) => {
  const [pivotState, setPivotState] = useState({
    rendererName: "Table Heatmap",
    rows: ["year", "month"],
    cols: [],
    aggregatorName: "Sum",
    vals: ["amount"],
  } as PivotTableProps);

  // Custom color scale generator for table
  const tableColorScaleGenerator = (values: number[]) => {
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Generate a color based on value (simple gradient from blue to red)
    return (x: number) => {
      const scale = (x - min) / (max - min); // Normalize between 0 and 1
      var red = 0, green = 0;
      if (x < 0) {
        red = Math.floor(255 * (1 - scale));
      }
      else {
        green = Math.floor(255 * (scale));
      }

      return { backgroundColor: `rgb(${red}, ${green}, 0, ${0.15})` };
    };
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-bold mb-2">Pivot Table</h2>
      <PivotTableUI
        data={data}
        onChange={(s) => setPivotState(s)}
        {...pivotState}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
        tableColorScaleGenerator={tableColorScaleGenerator}  // Use custom color scale here
      />
    </div>
  );
};

export default PivotTable;
