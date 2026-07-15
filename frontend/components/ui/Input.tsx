import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className="relative w-full flex items-center">
      {icon && (
        <div className="absolute left-3.5 text-on-surface-variant/60 pointer-events-none flex items-center justify-center">
          {icon}
        </div>
      )}
      <input
        className={`w-full py-2.5 ${
          icon ? "pl-11" : "pl-3.5"
        } pr-3.5 rounded-default bg-surface-container border border-white/5 focus:border-primary/50 outline-none text-on-surface text-sm placeholder:text-on-surface-variant/40 transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] focus:shadow-[0_0_12px_rgba(173,198,255,0.15)] focus:bg-surface-container-high ${className}`}
        {...props}
      />
    </div>
  );
};
