"use client";

import { GripVertical } from "lucide-react";
import { type RefObject, useRef } from "react";

import { clampPassageWidth, MAX_PASSAGE_WIDTH, MIN_PASSAGE_WIDTH } from "../settings/exam-settings";

const KEYBOARD_STEP = 5;

/**
 * Draggable line between the passage and the questions. Arrow keys move it
 * too. Reports the passage width while dragging and once more when done.
 */
export function PaneDivider({
  containerRef,
  passageWidth,
  onResize,
  onResizeEnd,
}: {
  containerRef: RefObject<HTMLDivElement | null>;
  passageWidth: number;
  onResize: (percent: number) => void;
  onResizeEnd: (percent: number) => void;
}) {
  const lastWidth = useRef(passageWidth);

  const widthAt = (clientX: number) => {
    const box = containerRef.current?.getBoundingClientRect();
    if (!box || box.width === 0) return passageWidth;
    return clampPassageWidth(((clientX - box.left) / box.width) * 100);
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize the passage and questions"
      aria-valuenow={passageWidth}
      aria-valuemin={MIN_PASSAGE_WIDTH}
      aria-valuemax={MAX_PASSAGE_WIDTH}
      tabIndex={0}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        lastWidth.current = passageWidth;
      }}
      onPointerMove={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        lastWidth.current = widthAt(event.clientX);
        onResize(lastWidth.current);
      }}
      onPointerUp={(event) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        event.currentTarget.releasePointerCapture(event.pointerId);
        onResizeEnd(lastWidth.current);
      }}
      onKeyDown={(event) => {
        const step = event.key === "ArrowLeft" ? -KEYBOARD_STEP : event.key === "ArrowRight" ? KEYBOARD_STEP : 0;
        if (!step) return;
        event.preventDefault();
        onResizeEnd(clampPassageWidth(passageWidth + step));
      }}
      className="group relative z-10 flex w-2 shrink-0 cursor-col-resize touch-none items-center justify-center border-x border-slate-200 bg-slate-100 outline-hidden transition-colors hover:bg-slate-200 focus-visible:bg-slate-300"
    >
      <GripVertical className="h-4 w-4 text-slate-400 group-hover:text-slate-600" aria-hidden />
    </div>
  );
}
