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
  const baseStyles =
    "px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ease-out focus:outline-none flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  let variantStyles = "";

  if (variant === "primary") {
    variantStyles =
      "bg-primary hover:bg-primary/90 text-on-primary hover:shadow-[0_0_12px_rgba(173,198,255,0.4)]";
  } else if (variant === "ghost") {
    variantStyles =
      "border border-white/10 hover:border-white/20 bg-transparent text-on-surface hover:bg-white/5";
  } else if (variant === "danger") {
    variantStyles = "bg-error text-on-error hover:bg-error/90";
  } else if (variant === "nav") {
    variantStyles = `text-on-surface-variant hover:text-on-surface hover:bg-white/5 w-full justify-start ${
      isActive ? "bg-white/5 text-on-surface font-semibold border-l-2 border-primary rounded-l-none" : ""
    }`;
  }

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};
