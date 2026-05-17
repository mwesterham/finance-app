import { useEffect, useState } from "react";
import MultiFileUploader from "./views/MultiFileUploader";
import { TanstackDataTable } from "./views/TanstackDatatable";
import { TanstackExploreTable } from "./views/TanstackExploreTable";
import { prettyPrintString } from "./util/util";
import DatabaseService from "./util/DatabaseService";
import { RuleBasedCategorizer } from "./views/RuleBasedCategorizer";
import { RuleManager } from "./views/RuleManager";
import { FileTypeManager } from "./views/FileTypeManager";
import { DatabaseManager } from "./components/DatabaseManager";

const App = () => {
  const [version, setVersion] = useState(0);

  const forceRerender = () => {
    setVersion((v) => v + 1);
  };
  useEffect(() => {
    DatabaseService.getDbLocalPath().then((r) => console.log(r));
  }, []);

  const [activeTab, setActiveTab] = useState<string>("pivotTable");

  return (
    <div className="p-4 space-y-4">
      <div>
        <DatabaseManager onSelect={() => {
          forceRerender();
        }}/>
      </div>
      <div className="mb-4 flex border-b">
        {["pivotTable", "transactionTable", "categorizeItems", "ruleManager", "fileTypeManager", "importFiles"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            {prettyPrintString(tab)} {/* Format tab names */}
          </button>
        ))}
      </div>

      {activeTab === "pivotTable" && <TanstackExploreTable key={version} />}
      {activeTab === "importFiles" && <MultiFileUploader key={version} />}
      {activeTab === "categorizeItems" && <RuleBasedCategorizer key={version} />}
      {activeTab === "ruleManager" && <RuleManager key={version} />}
      {activeTab === "fileTypeManager" && <FileTypeManager key={version} />}
      {activeTab === "transactionTable" && <TanstackDataTable key={version} />}
    </div>
  );
};

export default App;
