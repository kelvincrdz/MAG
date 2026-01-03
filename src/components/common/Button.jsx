import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  icon,
  onClick,
  disabled,
  className = "",
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary hover:bg-primaryHover text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-secondary hover:bg-secondaryHover text-white border border-border",
    ghost:
      "bg-transparent hover:bg-primary/10 text-primary border-2 border-primary",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    icon: "bg-surface hover:bg-surfaceHover text-text",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    icon: "w-10 h-10 p-0",
  };

  const isIcon = variant === "icon" || size === "icon";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${
          isIcon
            ? "rounded-full flex items-center justify-center"
            : "rounded-lg"
        }
        font-semibold
        transition-all duration-200
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center gap-2
        ${className}
      `}
      {...props}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
