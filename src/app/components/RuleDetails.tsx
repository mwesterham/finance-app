import React from "react";
import { formatAmount } from "../util/util";
import { Rule } from "../../db/WesterhamDatabase";

interface RuleDetailsProps {
  rule: Rule;
}

const RuleDetails: React.FC<RuleDetailsProps> = ({ rule }) => {
  return (
    <table className="w-full border-collapse border border-gray-300 text-left">
      <tbody>
        {[
          { label: "Rule ID", value: rule.ruleId || "N/A" },
          { label: "Matching Expressions", value: rule.matchingExpression },
          { label: "Category", value: rule.category },
          { label: "Provided Details", value: rule.providedDetail || "N/A" },
        ].map(({ label, value }) => (
          <tr key={label} className="border-b border-gray-200">
            <td className="px-4 py-2 font-medium">{label}</td>
            <td className="px-4 py-2">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RuleDetails;
