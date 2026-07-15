import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger" | "nav";
  isActive?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isActive = false,
  className = "",
  ...props
}) => {
  // Buttons use a 0.5rem (8px) radius = rounded-default. Transitions use cubic-bezier(0.4, 0, 0.2, 1).
  const baseStyles =
    "px-4 py-2 rounded-default font-medium text-sm transition-all duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  let variantStyles = "";

  if (variant === "primary") {
    // Solid Electric Blue with white text, or theme primary color.
    variantStyles =
      "bg-primary hover:bg-[#9cbbf5] text-on-primary shadow-sm hover:shadow-[0_0_12px_rgba(173,198,255,0.3)] active:scale-[0.98]";
  } else if (variant === "ghost") {
    // Transparent background with white/10 border. High-contrast white text.
    variantStyles =
      "border border-white/10 hover:border-white/20 bg-transparent text-on-surface hover:bg-white/5 active:bg-white/10";
  } else if (variant === "danger") {
    // Solid Red (#EF4444)
    variantStyles =
      "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-sm active:scale-[0.98]";
  } else if (variant === "nav") {
    // Navigation items with smooth transitions
    variantStyles = `text-on-surface-variant hover:text-on-surface hover:bg-white/5 w-full justify-start py-2.5 px-4 ${
      isActive
        ? "bg-white/5 text-on-surface font-semibold border-l-2 border-primary rounded-l-none"
        : ""
    }`;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
