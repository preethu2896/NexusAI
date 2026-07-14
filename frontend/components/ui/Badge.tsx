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
  const baseStyles = "px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 border-glow-subtle";
  let variantStyles = "";

  if (variant === "primary") {
    variantStyles = "bg-primary-container/20 text-primary border border-primary/20";
  } else if (variant === "secondary") {
    variantStyles = "bg-secondary-container/20 text-secondary border border-secondary/20";
  } else if (variant === "success") {
    variantStyles = "bg-green-500/10 text-green-400 border border-green-500/20";
  } else if (variant === "warning") {
    variantStyles = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
  } else if (variant === "error") {
    variantStyles = "bg-error-container/20 text-error border border-error/20";
  } else {
    variantStyles = "bg-white/5 text-on-surface-variant";
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
};
