import React from "react";
import { ChevronDown } from "lucide-react";

export const Select = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative w-full">
      <SelectTrigger onClick={() => setIsOpen(!isOpen)}>
        <SelectValue>{value ? value.label : placeholder}</SelectValue>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </SelectTrigger>

      {isOpen && (
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      )}
    </div>
  );
};

export const SelectTrigger = ({ children, onClick }) => (
  <button
    className="flex items-center justify-between w-full p-2 border rounded-md bg-white cursor-pointer"
    onClick={onClick}
  >
    {children}
  </button>
);

export const SelectValue = ({ children }) => (
  <span className="text-gray-700">{children}</span>
);

export const SelectContent = ({ children }) => (
  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
    {children}
  </div>
);

export const SelectItem = ({ children, onClick }) => (
  <div className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    {children}
  </div>
);

export default Select;
