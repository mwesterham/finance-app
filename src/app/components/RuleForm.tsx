import React, { useState } from "react";
import { Rule } from "../../db/WesterhamDatabase";

interface RuleFormProps {
  onSubmit: (rule: Rule) => void;
  onCancel?: () => void;
  categories?: string[];
  defaultRule?: Rule;
}

export const RuleForm: React.FC<RuleFormProps> = ({ onSubmit, onCancel, categories, defaultRule }) => {
  const [matchingExpression, setMatchingExpression] = useState(defaultRule ? defaultRule.matchingExpression : "");
  const [category, setCategory] = useState(defaultRule && defaultRule.category ? defaultRule.category : "");
  const [providedDetail, setProvidedDetail] = useState(defaultRule && defaultRule.providedDetail ? defaultRule.providedDetail : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchingExpression.trim() || !category.trim()) {
      alert("Matching expression and category are required.");
      return;
    }

    const newRule: Rule = {
      matchingExpression: matchingExpression.trim(),
      category: category.trim(),
      providedDetail: providedDetail.trim() || undefined,
    };

    onSubmit(newRule);
    // Optionally reset the form
    setMatchingExpression("");
    setCategory("");
    setProvidedDetail("");
  };

  return (
    <>

      <form onSubmit={handleSubmit} className="space-y-4 p-4 max-w-md mx-auto">
        <div>
          <label className="block text-sm font-medium mb-1">
            Matching Expression
          </label>
          <input
            type="text"
            value={matchingExpression}
            onChange={(e) => setMatchingExpression(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          {categories && (
            <datalist id={"id"}>
              {categories.map((value: any, idx: number) => (
                <option value={value} key={idx} />
              ))}
            </datalist>
          )}
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            list={"id"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Provided Detail (Optional)
          </label>
          <input
            type="text"
            value={providedDetail}
            onChange={(e) => setProvidedDetail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Save Rule
        </button>
      </form>
      <button onClick={onCancel} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
        Cancel
      </button>
    </>
  );
};
