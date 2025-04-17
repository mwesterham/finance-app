import { ReactNode, useEffect, useState } from 'react';
import { GoPencil, GoCheck, GoX } from 'react-icons/go';

interface EditableInputProps {
  value: any;
  type: string;
  suggestions?: any[];
  displayBody: ReactNode;
  onChange: (newValue: any) => void;
}

const EditableInput = ({ value, type, suggestions, displayBody, onChange }: EditableInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [initialValue, setInitialValue] = useState(value);

  useEffect(() => {
    setIsEditing(false);
    setInputValue(value);
    setInitialValue(value);
  }, [value])

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(initialValue); // Revert to the initial value
  };

  const handleSave = () => {
    onChange(inputValue === "" ? undefined : inputValue); // Commit the change
    setIsEditing(false);
    setInitialValue(inputValue === "" ? undefined : inputValue); // Set new initial value
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value); // Update input value while editing
  };

  return (
    <div className="relative flex items-center w-full">
      {isEditing ? (
        <div className="flex items-center w-full space-x-2">
          {suggestions && (
            <datalist id={"id"}>
              {suggestions.map((value: any, idx: number) => (
                <option value={value} key={idx} />
              ))}
            </datalist>
          )}
          <input
            value={inputValue}
            type={type}
            onChange={handleChange}
            className="border rounded px-2 py-1 flex-grow"
            list={"id"}
          />
          <GoCheck className="text-green-500 cursor-pointer" onClick={handleSave} />
          <GoX className="text-red-500 cursor-pointer" onClick={handleCancel} />
        </div>
      ) : (
        <div className="flex items-center w-full justify-between">
          <span>{displayBody}</span>
          <GoPencil
            className="opacity-0 group-hover:opacity-100 text-blue-500 cursor-pointer hover:text-blue-700 min-w-5"
            onClick={handleClickEdit}
          />
        </div>
      )}
    </div>
  );
};

export default EditableInput;
