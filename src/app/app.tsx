import { useEffect, useState } from "react";
import { FinanceSheetRow } from "../db/WesterhamDatabase";
import MultiFileUploader from "./views/MultiFileUploader";
import { TanstackDataTable } from "./views/TanstackDatatable";
import { TanstackExploreTable } from "./views/TanstackExploreTable";
import { prettyPrintString } from "./util/util";
import DatabaseService from "./util/DatabaseService";

const App = () => {
  useEffect(() => {
    DatabaseService.getDbLocalPath().then((r) => console.log(r));
  }, []);

  const [activeTab, setActiveTab] = useState<string>("pivotTable");

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="mb-4 flex border-b">
        {["pivotTable", "tanstackTable", "fillTable", "multiFileUploader"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            {prettyPrintString(tab)} {/* Format tab names */}
          </button>
        ))}
      </div>

      <div className={activeTab !== "pivotTable" ? "hidden" : ""}>
        <TanstackExploreTable />
      </div>

      <div className={activeTab !== "multiFileUploader" ? "hidden" : ""}>
        <MultiFileUploader />
      </div>

      <div className={activeTab !== "fillTable" ? "hidden" : ""}>
        New View
      </div>

      <div className={activeTab !== "tanstackTable" ? "hidden" : ""}>
        <TanstackDataTable />
      </div>
    </div>
  );
};

export default App;
