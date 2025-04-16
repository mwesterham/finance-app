import { useEffect, useState } from "react";
import { FinanceSheetRow } from "../db/WesterhamDatabase";
import MultiFileUploader from "./views/MultiFileUploader";
import { TanstackDataTable } from "./views/TanstackDatatable";
import { TanstackExploreTable } from "./views/TanstackExploreTable";
import { prettyPrintString } from "./util/util";
import DatabaseService from "./util/DatabaseService";
import { RuleBasedCategorizer } from "./views/RuleBasedCategorizer";
import { RuleManager } from "./views/RuleManager";

const App = () => {
  useEffect(() => {
    DatabaseService.getDbLocalPath().then((r) => console.log(r));
  }, []);

  const [activeTab, setActiveTab] = useState<string>("pivotTable");

  return (
    <div className="p-4 space-y-4">
      {/* Tab Navigation */}
      <div className="mb-4 flex border-b">
        {["pivotTable", "tanstackTable", "fillTable", "ruleManager", "multiFileUploader"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            {prettyPrintString(tab)} {/* Format tab names */}
          </button>
        ))}
      </div>

      {activeTab === "pivotTable" && <TanstackExploreTable />}
      {activeTab === "multiFileUploader" && <MultiFileUploader />}
      {activeTab === "fillTable" && <RuleBasedCategorizer />}
      {activeTab === "ruleManager" && <RuleManager />}
      {activeTab === "tanstackTable" && <TanstackDataTable />}
    </div>
  );
};

export default App;
