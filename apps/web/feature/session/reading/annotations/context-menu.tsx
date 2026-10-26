"use client";

import type { LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type MenuPosition = { x: number; y: number };

export type MenuAction = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  onSelect: () => void;
};

/**
 * Right-click menu for the passage and questions, like IELTS on computer:
 * highlight or annotate selected text, or remove an existing highlight.
 */
export function ContextMenu({
  position,
  actions,
  onClose,
}: {
  position: MenuPosition;
  actions: MenuAction[];
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) onClose();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", onClose, true);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", onClose, true);
    };
  }, [onClose]);

  // Rendered into <body> with an inline fixed position, so neither a parent's
  // styles nor a stylesheet still loading can move it away from the pointer.
  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Text options"
      style={{ position: "fixed", left: position.x, top: position.y }}
      className="z-50 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      // Keep the text selection while clicking a menu item.
      onMouseDown={(event) => event.preventDefault()}
    >
      {actions.map(({ label, icon: Icon, iconClassName, onSelect }) => (
        <button
          key={label}
          type="button"
          role="menuitem"
          onClick={onSelect}
          className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
        >
          <Icon className={`h-4 w-4 ${iconClassName}`} aria-hidden />
          {label}
        </button>
      ))}
    </div>,
    document.body,
  );
}
