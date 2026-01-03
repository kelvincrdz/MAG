import React from "react";

const Card = ({
  children,
  className = "",
  hover = false,
  highlight = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-surface 
        border border-border
        rounded-lg 
        shadow-xl
        p-6
        transition-all duration-200
        ${hover ? "hover:border-borderHover cursor-pointer" : ""}
        ${
          highlight
            ? "border-4 border-primary shadow-[0_0_30px_rgba(216,38,62,0.4)] animate-glow"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
