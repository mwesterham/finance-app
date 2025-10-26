import React from "react";

type TableCellProps = {
  children?: React.ReactNode;
  className?: string;
};

export const TableCell = ({
  children,
  className = "",
  ...rest
}: TableCellProps) => {
  return (
    <div
      className={`flex items-center px-4 py-2 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};
