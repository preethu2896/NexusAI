"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div
      className={`animate-pulse rounded-default bg-surface-container-highest/60 ${className}`}
      style={{
        animationDuration: "1.5s",
      }}
    />
  );
};
