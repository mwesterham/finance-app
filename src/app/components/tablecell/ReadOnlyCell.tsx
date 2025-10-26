import React from "react";

type ReadOnlyCellProps = {
  children?: React.ReactNode;
  className?: string;
};

export const ReadOnlyCell = ({
  children,
  className = "",
  ...rest
}: ReadOnlyCellProps) => {
  return (
    <div
      className={`relative flex flex-col w-full group h-16 px-2 overflow-auto scrollbar-hide ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
