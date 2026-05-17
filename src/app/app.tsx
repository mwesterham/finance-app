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
import WithTooltip from "./components/WithTooltip";
import { MdInfoOutline } from "react-icons/md";

const tabDescriptions: Record<string, string> = {
  pivotTable: "Explore transactions grouped by source, category, and date ranges.",
  transactionTable: "View and edit all imported transactions in a flat table.",
  categorizeItems: "Apply rules to auto-categorize uncategorized transactions.",
  ruleManager: "Create, edit, and delete categorization rules.",
  fileTypeManager: "Configure filename patterns, parsers, and default source IDs for file imports.",
  importFiles: "Upload CSV files to import transactions into the database.",
};

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
            className={`py-2 px-4 flex items-center gap-1 ${activeTab === tab ? "border-b-2 border-blue-500" : ""}`}
          >
            {prettyPrintString(tab)}
            <WithTooltip text={tabDescriptions[tab]} position="top" tooltipClassName="w-64 whitespace-normal" delay>
              <MdInfoOutline className="text-gray-400 hover:text-gray-600 text-sm" />
            </WithTooltip>
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
