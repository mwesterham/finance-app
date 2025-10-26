import { ReactNode, useEffect, useState, useRef } from "react";
import { GoCheck, GoX } from "react-icons/go";

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

  const inputRef = useRef<HTMLInputElement>(null);

  // Update values when prop changes
  useEffect(() => {
    setIsEditing(false);
    setInputValue(value);
    setInitialValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Optional: select text
    }
  }, [isEditing]);

  const handleClickEdit = () => {
    setIsEditing(true);
    setFilteredSuggestions(suggestions);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(initialValue);
    setFilteredSuggestions(suggestions);
  };

  const handleSave = () => {
    onChange(inputValue === "" ? undefined : inputValue);
    setIsEditing(false);
    setInitialValue(inputValue === "" ? undefined : inputValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    if (suggestions.length > 0) {
      const filtered = suggestions.filter((s) =>
        String(s).toLowerCase().includes(val.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    }
  };

  const handleSuggestionClick = (suggestion: any) => {
    setInputValue(suggestion);
  };

  return (
    <div
      className="relative flex items-center w-full group h-16 px-2"
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
                  className="px-3 py-1 hover:bg-blue-100 cursor-pointer"
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
