import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "glass" | "highest" | "lowest";
  glowOnHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "surface",
  glowOnHover = false,
  className = "",
  ...props
}) => {
  // Card base styles: radius-lg (1rem/16px), 1px solid white/5 border
  const baseStyles =
    "rounded-lg border-glow-subtle transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] p-6 shadow-sm";

  let variantStyles = "";
  if (variant === "surface") {
    variantStyles = "bg-surface-container";
  } else if (variant === "glass") {
    variantStyles = "bg-surface-container-low/70 backdrop-blur-lg";
  } else if (variant === "highest") {
    variantStyles = "bg-surface-container-high";
  } else if (variant === "lowest") {
    variantStyles = "bg-surface-container-lowest";
  }

  // Hover styles: increased border luminosity (white/10) and soft shadow
  const hoverStyles = glowOnHover
    ? "hover:border-[rgba(255,255,255,0.15)] hover:shadow-md hover:translate-y-[-1px]"
    : "";

  return (
    <div
      className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
