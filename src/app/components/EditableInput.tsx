import { useState } from 'react';
import { GoPencil, GoCheck, GoX } from 'react-icons/go';
import { customFormatDate } from '../util/time';

interface EditableInputProps {
  value: any;
  type: string;
  suggestions?: any[];
  onChange: (newValue: any) => void;
}

const EditableInput = ({ value, type, suggestions, onChange }: EditableInputProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [initialValue, setInitialValue] = useState(value);

  const handleClickEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setInputValue(initialValue); // Revert to the initial value
  };

  const handleSave = () => {
    onChange(inputValue); // Commit the change
    setIsEditing(false);
    setInitialValue(inputValue); // Set new initial value
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
              {suggestions.map((value: any) => (
                <option value={value} key={value} />
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
          <span>{type == "date" ? customFormatDate(value) : value}</span>
          <GoPencil
            className="text-blue-500 cursor-pointer hover:text-blue-700 min-w-5"
            onClick={handleClickEdit}
          />
        </div>
      )}
    </div>
  );
};

export default EditableInput;
