import { ReactNode } from "react";

interface WithTooltipProps {
  text: string;
  children: ReactNode;
  position?: "top" | "right" | "bottom" | "left";
  tooltipClassName?: string;
}

export default function WithTooltip({ text, children, position = "top", tooltipClassName = "" }: WithTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2",
    right: "left-full top-1/2 transform -translate-y-1/2",
    bottom: "top-full left-1/2 transform -translate-x-1/2",
    left: "right-full top-1/2 transform -translate-y-1/2",
  };

  return (
    <div className="relative group inline-block">
      {/* Wrapped Element */}
      {children}

      {/* Tooltip */}
      <div
        className={`absolute ${positionClasses[position]} bg-gray-800 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${tooltipClassName}`}
      >
        {text}
      </div>
    </div>
  );
}
