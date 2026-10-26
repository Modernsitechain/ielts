"use client";

import { StickyNote, X } from "lucide-react";

import type { Annotation } from "@/core/models/annotation";

/** Side panel listing every note, to jump back to the text it belongs to. */
export function NotesPanel({
  notes,
  quoteOf,
  onSelect,
  onClose,
}: {
  notes: Annotation[];
  quoteOf: (annotation: Annotation) => string;
  onSelect: (annotation: Annotation) => void;
  onClose: () => void;
}) {
  return (
    <aside
      aria-label="Notes"
      className="absolute inset-y-0 right-0 z-30 flex w-80 max-w-full flex-col border-l border-slate-200 bg-white shadow-lg"
    >
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <h2 className="font-semibold">Notes</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notes"
          className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      {notes.length === 0 ? (
        <p className="p-4 text-sm text-slate-500">
          No notes yet. Select text, right-click it and choose <strong>Add note</strong>.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
          {notes.map((note) => (
            <li key={`${note.blockId}:${note.start}`}>
              <button
                type="button"
                onClick={() => onSelect(note)}
                className="w-full space-y-1.5 px-4 py-3 text-left hover:bg-slate-50"
              >
                <span className="line-clamp-2 block rounded-xs bg-yellow-100 px-1.5 py-0.5 text-xs text-slate-600">
                  {quoteOf(note)}
                </span>
                <span className="flex gap-1.5 text-sm text-slate-800">
                  <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden />
                  <span className="line-clamp-3 whitespace-pre-line">{note.note}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
