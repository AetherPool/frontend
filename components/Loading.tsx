import React from "react";

interface LoadingProps {
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
  color?: string;
  show: boolean;
  children?: React.ReactNode;
}

const Loading = ({
  fullScreen = true,
  size = "md",
  color = "#F9F1E2",
  show,
  children,
}: LoadingProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const containerClasses = fullScreen
    ? "flex items-center justify-center h-[90vh]"
    : "flex items-center justify-center p-4";

  if (!show) return <>{children}</>;

  return (
    <div className={containerClasses}>
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]}`}
        style={{ borderColor: color }}
      />
    </div>
  );
};

export default Loading;
