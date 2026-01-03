import React from "react";

const Badge = ({
  children,
  color,
  variant = "solid",
  size = "md",
  className = "",
}) => {
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  // Calcular contraste automático
  const getContrastColor = (hexColor) => {
    if (!hexColor) return "#ffffff";
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  const style = color
    ? {
        backgroundColor: variant === "solid" ? color : `${color}20`,
        color: variant === "solid" ? getContrastColor(color) : color,
        borderColor: variant === "outline" ? color : "transparent",
      }
    : {};

  return (
    <span
      className={`
        inline-flex items-center gap-1
        ${sizes[size]}
        rounded-full
        font-semibold
        ${variant === "outline" ? "border-2" : ""}
        ${!color ? "bg-primary/20 text-primaryLight" : ""}
        ${className}
      `}
      style={style}
    >
      {children}
    </span>
  );
};

export default Badge;
