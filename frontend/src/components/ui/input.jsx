import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Input = ({
  label,
  type = "text",
  error,
  success,
  hint,
  icon: Icon,
  disabled = false,
  required = false,
  className = "",
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Icon className="h-5 w-5" />
          </div>
        )}

        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          className={`
            w-full
            px-3 py-2
            ${Icon ? "pl-10" : ""}
            ${type === "password" ? "pr-10" : ""}
            rounded-md
            border
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }
            ${
              success
                ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                : ""
            }
            ${
              !error && !success
                ? "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                : ""
            }
            ${
              disabled
                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                : "bg-white"
            }
            outline-none
            transition-all
            focus:ring-2
            focus:ring-opacity-50
            ${className}
          `}
          disabled={disabled}
          required={required}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}

      {success && <p className="mt-1.5 text-sm text-green-500">{success}</p>}
    </div>
  );
};

export default Input;
