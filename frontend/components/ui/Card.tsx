import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "surface" | "glass" | "highest";
  glowOnHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "surface",
  glowOnHover = false,
  className = "",
  ...props
}) => {
  const baseStyles = "rounded-lg border-glow-subtle transition-all duration-200 ease-in-out p-5";

  let variantStyles = "";
  if (variant === "surface") {
    variantStyles = "bg-surface-container-low";
  } else if (variant === "glass") {
    variantStyles = "bg-[#171b26]/60 backdrop-blur-md";
  } else if (variant === "highest") {
    variantStyles = "bg-surface-container-high";
  }

  const hoverStyles = glowOnHover
    ? "hover:border-white/10 hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
    : "";

  return (
    <div className={`${baseStyles} ${variantStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
