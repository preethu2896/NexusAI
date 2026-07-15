import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "default";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
  ...props
}) => {
  const baseStyles =
    "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 border border-white/5 select-none";
  let variantStyles = "";

  if (variant === "primary") {
    variantStyles = "bg-primary-container/15 text-primary border-primary/20";
  } else if (variant === "secondary") {
    variantStyles = "bg-secondary-container/15 text-secondary border-secondary/20";
  } else if (variant === "success") {
    // Desaturated semantic green
    variantStyles = "bg-[rgba(74,222,128,0.1)] text-green-400 border-[rgba(74,222,128,0.15)]";
  } else if (variant === "warning") {
    // Desaturated semantic yellow
    variantStyles = "bg-[rgba(250,204,21,0.1)] text-yellow-400 border-[rgba(250,204,21,0.15)]";
  } else if (variant === "error") {
    variantStyles = "bg-error-container/15 text-error border-error/20";
  } else {
    variantStyles = "bg-white/5 text-on-surface-variant border-white/10";
  }

  return (
    <span
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
