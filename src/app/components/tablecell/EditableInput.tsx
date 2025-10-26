import { ReactNode, useEffect, useState, useRef } from "react";
import { GoCheck, GoX } from "react-icons/go";
import { cx } from "../../util/util";

interface EditableInputProps {
  value: any;
  type: string;
  suggestions?: any[];
  displayBody: ReactNode;
  onChange: (newValue: any) => void;
}

const EditableInput = ({
  value,
  type,
  suggestions = [],
  displayBody,
  onChange,
}: EditableInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [initialValue, setInitialValue] = useState(value);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>(suggestions);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    setIsEditing(false);
    setInputValue(value);
    setInitialValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Scroll highlighted suggestion into view
    if (highlightedIndex >= 0 && suggestionRefs.current[highlightedIndex]) {
      suggestionRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  const handleClickEdit = () => {
    setIsEditing(true);
    setFilteredSuggestions(suggestions);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(initialValue);
    setFilteredSuggestions(suggestions);
    setHighlightedIndex(-1);
  };

  const handleSave = () => {
    onChange(inputValue === "" ? undefined : inputValue);
    setIsEditing(false);
    setInitialValue(inputValue === "" ? undefined : inputValue);
    setHighlightedIndex(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setHighlightedIndex(-1);

    if (suggestions.length > 0) {
      const filtered = suggestions.filter((s) =>
        String(s).toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion);
    setFilteredSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
        handleSuggestionClick(filteredSuggestions[highlightedIndex]);
      } else {
        handleSave();
      }
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div
      className={cx("relative flex items-center w-full group h-16 px-2", !isEditing ? "cursor-pointer" : "")}
      onClick={!isEditing ? handleClickEdit : undefined}
    >
      {isEditing ? (
        <div className="flex flex-col w-full">
          <div className="flex items-center space-x-2">
            <input
              ref={inputRef}
              value={inputValue}
              type={type}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="border rounded px-2 py-1 flex-grow"
            />
            <GoCheck
              className="text-green-500 cursor-pointer"
              onClick={handleSave}
            />
            <GoX
              className="text-red-500 cursor-pointer"
              onClick={handleCancel}
            />
          </div>

          {filteredSuggestions.length > 0 && (
            <ul className="absolute top-full mt-1 z-10 w-full bg-white border rounded shadow max-h-40 overflow-y-auto">
              {filteredSuggestions.map((s, idx) => (
                <li
                  key={idx}
                  ref={(el) => { suggestionRefs.current[idx] = el; }}
                  className={`px-3 py-1 cursor-pointer ${
                    highlightedIndex === idx ? "bg-blue-200" : "hover:bg-blue-100"
                  }`}
                  onMouseDown={() => handleSuggestionClick(s)}
                  onMouseUp={() => setFilteredSuggestions([])}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex items-center w-full justify-between h-full">
          <span>{displayBody}</span>
        </div>
      )}
    </div>
  );
};

export default EditableInput;
