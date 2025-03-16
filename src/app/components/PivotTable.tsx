import PivotTableUI from "react-pivottable/PivotTableUI";
import "react-pivottable/pivottable.css";
import TableRenderers from 'react-pivottable/TableRenderers';
import Plot from 'react-plotly.js';
import createPlotlyRenderers from 'react-pivottable/PlotlyRenderers';
import { useState } from "react";

// create Plotly renderers via dependency injection
const PlotlyRenderers = createPlotlyRenderers(Plot);

const PivotTable = ({ data }: { data: any[] }) => {
  const [pivotState, setPivotState] = useState({});

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-bold mb-2">Pivot Table</h2>
      <PivotTableUI
        data={data}
        onChange={(s) => setPivotState(s)} {...pivotState}
        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
      />
    </div>
  );
};

export default PivotTable;