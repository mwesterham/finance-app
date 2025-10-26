// SuggestionDropdown.tsx
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { cx } from "../util/util";

interface SuggestionDropdownProps {
  inputRef: React.RefObject<HTMLInputElement>;
  suggestions: string[];
  highlightedIndex: number;
  onSelect: (value: string) => void;
}

export const SuggestionDropdown = ({
  inputRef,
  suggestions,
  highlightedIndex,
  onSelect,
}: SuggestionDropdownProps) => {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  // Position dropdown below input
  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setPos({
          top: rect.bottom + window.scrollY,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [inputRef, suggestions.length]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (
      highlightedIndex >= 0 &&
      itemRefs.current[highlightedIndex] &&
      listRef.current
    ) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [highlightedIndex]);

  if (suggestions.length === 0) return null;

  return createPortal(
    <ul
      ref={listRef}
      className="absolute bg-white border rounded shadow max-h-40 overflow-y-auto z-[9999]"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width,
        position: "absolute",
      }}
    >
      {suggestions.map((s, idx) => (
        <li
          key={idx}
          ref={(el) => {
            itemRefs.current[idx] = el;
          }}
          className={cx(
            "px-3 py-1 cursor-pointer select-none",
            highlightedIndex === idx
              ? "bg-blue-200"
              : "hover:bg-blue-100"
          )}
          onMouseDown={() => onSelect(s)}
        >
          {s}
        </li>
      ))}
    </ul>,
    document.body
  );
};
