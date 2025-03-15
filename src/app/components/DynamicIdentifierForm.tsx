import React, { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

export interface FormEntry {
  id: string;
  value: string;
}

export interface DynamicUPCFormProps {
  submitCallback?: (fields: FormEntry[]) => void;
}

const DynamicIdentifierForm = (props: DynamicUPCFormProps) => {
  const submitKey = "\\";
  const [formEntrys, setFormEntrys] = useState<FormEntry[]>([
    { id: uuidv4(), value: "" },
  ]);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if(event.key == submitKey) {
        formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {window.removeEventListener('keydown', handleKeyDown);};
  }, []);

  const removeField = (id: string) => {
    setFormEntrys((prevFields) => prevFields.filter((field) => field.id !== id));
  };

  const handleInputChange = (id: string, value: string) => {
    setFormEntrys((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, value } : field
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      setFormEntrys((prevFields) => [
        ...prevFields,
        { id: uuidv4(), value: "" },
      ]);
    }
    if (e.key === submitKey) {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (props.submitCallback) {
      props.submitCallback(formEntrys);
    }
    inputRefs.current = []; // Clear all refs
    setFormEntrys([{ id: uuidv4(), value: "" }]);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {formEntrys.map((field, index) => (
        <div key={field.id} className="flex space-x-2">
          <input
            id={`${index}-input`}
            disabled={index == formEntrys.length - 1 ? false : true}
            type="text"
            value={field.value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onKeyDown={(e) => handleKeyPress(e)}
            placeholder={`Identifier ${index + 1}`}
            ref={(el) => {
              inputRefs.current[index] = el; // Assign ref dynamically
              if(el && formEntrys.length - 1 == index) {
                el.focus();
              }
            }}
            className="p-2 border rounded-md w-full"
          />
          {formEntrys.length != 1 && 
            <button
              type="button"
              onClick={() => removeField(field.id)}
              className="p-2 rounded-md focus:bg-slate-200"
            >
              X
            </button>
          }
        </div>
      ))}
      <button
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {`Press '${submitKey}' to Submit`}
      </button>
    </form>
  );
};

export default DynamicIdentifierForm;
