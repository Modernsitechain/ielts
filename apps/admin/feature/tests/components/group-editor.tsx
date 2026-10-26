"use client";

import { ArrowDown, ArrowUp, Plus, RotateCcw, Trash2 } from "lucide-react";

import type { AdminGroup, GroupPayload } from "@/core/models/test";
import { Button, Field, IconButton, Select, TextArea, TextInput } from "@/shared/components/form";
import { QUESTION_TYPE_LABEL } from "@/shared/utils/format";
import {
  defaultInstructions,
  defaultPayload,
  move,
  newQuestion,
  nextHeadingKey,
  READING_TYPES,
  type ReadingType,
  removeAt,
  replaceAt,
  wordLimitText,
} from "../editor-defaults";
import { QuestionEditor } from "./question-editor";

type Props = {
  group: AdminGroup;
  startNumber: number;
  paragraphLabels: string[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (group: AdminGroup) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

export function GroupEditor({
  group,
  startNumber,
  paragraphLabels,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const { payload } = group;
  const endNumber = startNumber + group.questions.length - 1;

  const setPayload = (next: GroupPayload) => onChange({ ...group, payload: next });

  const changeType = (type: ReadingType) => {
    const hasAnswers = group.questions.some((q) => q.answers.length > 0);
    if (hasAnswers && !window.confirm("Changing the type clears the answers of these questions. Continue?")) {
      return;
    }
    const next = defaultPayload(type);
    onChange({
      ...group,
      payload: next,
      instructions: defaultInstructions(next),
      // Keep the question text; options and answers depend on the type.
      questions: group.questions.map((q) => ({ ...newQuestion(type), id: q.id, prompt: q.prompt })),
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-semibold">
          {group.questions.length > 0 ? `Questions ${startNumber}–${endNumber}` : "No questions yet"}
        </h3>
        <Select
          aria-label="Question type"
          value={payload.type}
          onChange={(event) => changeType(event.target.value as ReadingType)}
          className="w-auto"
        >
          {READING_TYPES.map((type) => (
            <option key={type} value={type}>
              {QUESTION_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex items-center">
          <IconButton label="Move group up" disabled={!canMoveUp} onClick={() => onMove(-1)}>
            <ArrowUp className="h-4 w-4" aria-hidden />
          </IconButton>
          <IconButton label="Move group down" disabled={!canMoveDown} onClick={() => onMove(1)}>
            <ArrowDown className="h-4 w-4" aria-hidden />
          </IconButton>
          <IconButton label="Remove group" onClick={onRemove}>
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      <Field
        label="Instructions"
        hint={
          <button
            type="button"
            onClick={() => onChange({ ...group, instructions: defaultInstructions(payload) })}
            className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Use the standard instructions for these settings
          </button>
        }
      >
        <TextArea
          rows={3}
          value={group.instructions}
          onChange={(event) => onChange({ ...group, instructions: event.target.value })}
        />
      </Field>

      {"maxWords" in payload && (
        <div className="flex flex-wrap items-end gap-4 rounded-md bg-slate-50 p-3">
          <Field label="Word limit">
            <Select
              value={payload.maxWords}
              onChange={(event) => setPayload({ ...payload, maxWords: Number(event.target.value) })}
              className="w-24"
            >
              {[1, 2, 3, 4, 5].map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </Select>
          </Field>
          <label className="flex items-center gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={payload.allowNumber}
              onChange={(event) => setPayload({ ...payload, allowNumber: event.target.checked })}
              className="accent-indigo-600"
            />
            and/or a number
          </label>
          <p className="pb-2 text-xs text-slate-500">
            {wordLimitText(payload.maxWords, payload.allowNumber)}. Longer answers are marked wrong.
          </p>
        </div>
      )}

      {payload.type === "summary_completion" && (
        <Field label="Summary title (optional)">
          <TextInput
            value={payload.title ?? ""}
            maxLength={200}
            onChange={(event) => setPayload({ ...payload, title: event.target.value || null })}
          />
        </Field>
      )}

      {payload.type === "matching_headings" && (
        <div className="space-y-2 rounded-md bg-slate-50 p-3">
          <h4 className="text-sm font-medium text-slate-700">List of headings</h4>
          <p className="text-xs text-slate-500">
            Add more headings than questions; candidates choose one for each paragraph.
          </p>
          {payload.headings.map((heading, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-right text-sm font-semibold">{heading.key}</span>
              <TextInput
                aria-label={`Heading ${heading.key}`}
                value={heading.text}
                onChange={(event) =>
                  setPayload({
                    ...payload,
                    headings: replaceAt(payload.headings, index, { ...heading, text: event.target.value }),
                  })
                }
              />
              <IconButton
                label={`Remove heading ${heading.key}`}
                onClick={() =>
                  setPayload({
                    ...payload,
                    // Renumber so the list stays i, ii, iii… without gaps.
                    headings: removeAt(payload.headings, index).map((h, i) => ({
                      ...h,
                      key: nextHeadingKey(i),
                    })),
                  })
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </IconButton>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={() =>
              setPayload({
                ...payload,
                headings: [...payload.headings, { key: nextHeadingKey(payload.headings.length), text: "" }],
              })
            }
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add heading
          </Button>
        </div>
      )}

      <ol className="space-y-3">
        {group.questions.map((question, index) => (
          <QuestionEditor
            key={question.id}
            question={question}
            number={startNumber + index}
            payload={payload}
            paragraphLabels={paragraphLabels}
            canMoveUp={index > 0}
            canMoveDown={index < group.questions.length - 1}
            onChange={(updated) => onChange({ ...group, questions: replaceAt(group.questions, index, updated) })}
            onMove={(offset) => onChange({ ...group, questions: move(group.questions, index, offset) })}
            onRemove={() => onChange({ ...group, questions: removeAt(group.questions, index) })}
          />
        ))}
      </ol>

      <Button
        variant="ghost"
        onClick={() => onChange({ ...group, questions: [...group.questions, newQuestion(payload.type)] })}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Add question
      </Button>
    </div>
  );
}
