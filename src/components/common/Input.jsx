import React from "react";

const Input = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  className = "",
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textMuted mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full px-4 py-2
          bg-background
          border border-border
          rounded-lg
          text-text
          placeholder:text-textDim
          focus:outline-none
          focus:border-primary
          focus:ring-2 focus:ring-primary/20
          transition-all duration-200
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const Textarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  className = "",
  error,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-textMuted mb-2">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={`
          w-full px-4 py-2
          bg-background
          border border-border
          rounded-lg
          text-text
          placeholder:text-textDim
          resize-y
          focus:outline-none
          focus:border-primary
          focus:ring-2 focus:ring-primary/20
          transition-all duration-200
          custom-scrollbar
          ${error ? "border-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
