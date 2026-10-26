"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import type { AdminSection, Paragraph } from "@/core/models/test";
import { Button, Field, IconButton, Select, TextArea, TextInput } from "@/shared/components/form";
import { QUESTION_TYPE_LABEL } from "@/shared/utils/format";
import { move, newGroup, READING_TYPES, type ReadingType, removeAt, replaceAt } from "../editor-defaults";
import { GroupEditor } from "./group-editor";

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

type Props = {
  section: AdminSection;
  passageNumber: number;
  /** Number of the first question in this passage. */
  startNumber: number;
  onChange: (section: AdminSection) => void;
  onRemove: () => void;
};

export function PassageEditor({ section, passageNumber, startNumber, onChange, onRemove }: Props) {
  const [newType, setNewType] = useState<ReadingType>("true_false_not_given");
  const labels = section.paragraphs.flatMap((p) => (p.label ? [p.label] : []));

  const setParagraphs = (paragraphs: Paragraph[]) => onChange({ ...section, paragraphs });

  /** Splits pasted text into paragraphs at blank lines. */
  const pasteText = (text: string) => {
    const pasted = text
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => ({ label: null, text: part }));
    setParagraphs([...section.paragraphs.filter((p) => p.text), ...pasted]);
  };

  // First question number of each group, continuing from the previous group.
  const groupStarts: number[] = [];
  let nextNumber = startNumber;
  for (const group of section.groups) {
    groupStarts.push(nextNumber);
    nextNumber += group.questions.length;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <Field label={`Passage ${passageNumber} title`} className="flex-1">
            <TextInput
              value={section.title}
              maxLength={200}
              placeholder="e.g. Bees in the City"
              onChange={(event) => onChange({ ...section, title: event.target.value })}
            />
          </Field>
          <Button variant="danger" onClick={onRemove} className="mt-6">
            <Trash2 className="h-4 w-4" aria-hidden />
            Remove passage
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium text-slate-700">Paragraphs</h3>
              <p className="text-xs text-slate-500">
                Label paragraphs (A, B, C…) when questions refer to them, e.g. matching headings or
                matching information.
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() =>
                setParagraphs(section.paragraphs.map((p, i) => ({ ...p, label: LETTERS[i] ?? null })))
              }
              disabled={section.paragraphs.length === 0}
            >
              Label A, B, C…
            </Button>
          </div>

          {section.paragraphs.length === 0 && (
            <TextArea
              rows={6}
              placeholder="Paste the whole passage here. Blank lines separate paragraphs."
              onBlur={(event) => event.target.value.trim() && pasteText(event.target.value)}
            />
          )}

          <ol className="space-y-2">
            {section.paragraphs.map((paragraph, index) => (
              <li key={index} className="flex items-start gap-2">
                <Select
                  aria-label={`Label of paragraph ${index + 1}`}
                  value={paragraph.label ?? ""}
                  onChange={(event) =>
                    setParagraphs(
                      replaceAt(section.paragraphs, index, {
                        ...paragraph,
                        label: event.target.value || null,
                      }),
                    )
                  }
                  className="w-16 shrink-0"
                >
                  <option value="">—</option>
                  {LETTERS.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </Select>
                <TextArea
                  aria-label={`Paragraph ${index + 1}`}
                  rows={4}
                  value={paragraph.text}
                  onChange={(event) =>
                    setParagraphs(
                      replaceAt(section.paragraphs, index, { ...paragraph, text: event.target.value }),
                    )
                  }
                />
                <div className="flex shrink-0 flex-col">
                  <IconButton
                    label="Move paragraph up"
                    disabled={index === 0}
                    onClick={() => setParagraphs(move(section.paragraphs, index, -1))}
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Move paragraph down"
                    disabled={index === section.paragraphs.length - 1}
                    onClick={() => setParagraphs(move(section.paragraphs, index, 1))}
                  >
                    <ArrowDown className="h-4 w-4" aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Remove paragraph"
                    onClick={() => setParagraphs(removeAt(section.paragraphs, index))}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </IconButton>
                </div>
              </li>
            ))}
          </ol>
          <Button
            variant="ghost"
            onClick={() => setParagraphs([...section.paragraphs, { label: null, text: "" }])}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add paragraph
          </Button>
        </div>
      </div>

      {section.groups.map((group, index) => {
        const firstNumber = groupStarts[index] ?? startNumber;
        return (
          <GroupEditor
            key={group.id}
            group={group}
            startNumber={firstNumber}
            paragraphLabels={labels}
            canMoveUp={index > 0}
            canMoveDown={index < section.groups.length - 1}
            onChange={(updated) => onChange({ ...section, groups: replaceAt(section.groups, index, updated) })}
            onMove={(offset) => onChange({ ...section, groups: move(section.groups, index, offset) })}
            onRemove={() => {
              if (window.confirm("Remove this question group and its questions?")) {
                onChange({ ...section, groups: removeAt(section.groups, index) });
              }
            }}
          />
        );
      })}

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white p-4">
        <span className="text-sm font-medium text-slate-700">Add question group:</span>
        <Select
          aria-label="Question type"
          value={newType}
          onChange={(event) => setNewType(event.target.value as ReadingType)}
          className="w-auto"
        >
          {READING_TYPES.map((type) => (
            <option key={type} value={type}>
              {QUESTION_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <Button onClick={() => onChange({ ...section, groups: [...section.groups, newGroup(newType)] })}>
          <Plus className="h-4 w-4" aria-hidden />
          Add
        </Button>
      </div>
    </div>
  );
}
