"use client";

import { Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Annotation } from "@/core/models/annotation";

const MAX_NOTE_LENGTH = 1000;

/** Dialog to write, change or delete the note on a highlight. */
export function NoteEditor({
  annotation,
  quote,
  onSave,
  onRemove,
  onClose,
}: {
  annotation: Annotation;
  /** The highlighted text, shown for context. */
  quote: string;
  onSave: (note: string) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [note, setNoteText] = useState(annotation.note ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-editor-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="note-editor-title" className="font-semibold">
            {annotation.note ? "Edit note" : "Add note"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <blockquote className="mt-3 line-clamp-3 rounded-md bg-yellow-100 px-3 py-2 text-sm text-slate-700">
          {quote}
        </blockquote>
        <textarea
          ref={textareaRef}
          value={note}
          maxLength={MAX_NOTE_LENGTH}
          onChange={(event) => setNoteText(event.target.value)}
          rows={4}
          placeholder="Write a note…"
          className="mt-3 w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm outline-hidden focus:border-slate-500"
        />
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove highlight
          </button>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(note)}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
