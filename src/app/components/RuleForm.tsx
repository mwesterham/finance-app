import React, { useEffect, useState } from "react";
import { Rule } from "../../db/WesterhamDatabase";
import DatabaseService from "../util/DatabaseService";
import { cx, fetchUniqueCategoriesForTable, fetchUniqueDetailsForTable } from "../util/util";

interface RuleFormProps {
  onSubmit: (rule: Rule) => void;
  onCancel?: () => void;
  defaultRule?: Rule;
}

export const RuleForm: React.FC<RuleFormProps> = ({ onSubmit, onCancel, defaultRule }) => {
  const [matchingExpression, setMatchingExpression] = useState(defaultRule ? defaultRule.matchingExpression : "");
  const [category, setCategory] = useState(defaultRule && defaultRule.category ? defaultRule.category : "");
  const [providedDetail, setProvidedDetail] = useState(defaultRule && defaultRule.providedDetail ? defaultRule.providedDetail : "");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState<boolean>(false);
  const [providedDetailOptions, setProvidedDetailOptions] = useState<string[]>([]);
  const [showDetailSuggestions, setShowDetailSuggestions] = useState<boolean>(false);

  useEffect(() => {
    populateOptions();  
  }, []);

  const populateOptions = async () => {
      setCategoryOptions(await fetchUniqueCategoriesForTable());
      setProvidedDetailOptions(await fetchUniqueDetailsForTable());
  }

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
          <input
            type="text"
            value={category}
            onFocus={() => setShowCategorySuggestions(true)}
            onBlur={() => setShowCategorySuggestions(false)}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
            list={"id"}
          />
          {showCategorySuggestions && categoryOptions.length > 0 && (
            <ul className="absolute top-1/2 translate-y-[0.2rem] mt-1 z-10 bg-white border rounded shadow max-h-40 overflow-y-auto">
              {categoryOptions.map((s, idx) => (
                <li
                  key={idx}
                  className={cx(
                    "px-3 py-1 hover:bg-blue-100 cursor-pointer",
                    category.length > 0 && !s.toLowerCase().includes(category.toLowerCase()) ? "hidden" : ""
                  )}
                  onMouseDown={() => setCategory(s)}
                  onMouseUp={() => setCategoryOptions([])}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Provided Detail (Optional)
          </label>
          <input
            type="text"
            value={providedDetail}
            onFocus={() => setShowDetailSuggestions(true)}
            onBlur={() => setShowDetailSuggestions(false)}
            onChange={(e) => setProvidedDetail(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          {showDetailSuggestions && providedDetailOptions.length > 0 && (
            <ul className="absolute top-1/2 translate-y-[5.3rem] mt-1 z-10 bg-white border rounded shadow max-h-40 overflow-y-auto">
              {providedDetailOptions.map((s, idx) => (
                <li
                  key={idx}
                  className={cx(
                    "px-3 py-1 hover:bg-blue-100 cursor-pointer",
                    providedDetail.length > 0 && !s.toLowerCase().includes(providedDetail.toLowerCase()) ? "hidden" : ""
                  )}
                  onMouseDown={() => setProvidedDetail(s)}
                  onMouseUp={() => setProvidedDetailOptions([])}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
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
