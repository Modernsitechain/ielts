"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { type AdminQuestion, FIXED_CHOICES, type GroupPayload } from "@/core/models/test";
import { Field, IconButton, Select, TextArea, TextInput } from "@/shared/components/form";
import { removeAt, replaceAt } from "../editor-defaults";

type Props = {
  question: AdminQuestion;
  number: number;
  payload: GroupPayload;
  paragraphLabels: string[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (question: AdminQuestion) => void;
  onMove: (offset: -1 | 1) => void;
  onRemove: () => void;
};

/** Label, placeholder and hint for the question text, per type. */
function promptCopy(payload: GroupPayload): { label: string; placeholder: string; hint?: string } {
  switch (payload.type) {
    case "true_false_not_given":
    case "yes_no_not_given":
    case "matching_information":
      return { label: "Statement", placeholder: "e.g. City planners once considered beekeeping unusual." };
    case "multiple_choice_single":
      return { label: "Question", placeholder: "e.g. According to paragraph D, solitary bees…" };
    case "matching_headings":
      return { label: "Paragraph", placeholder: "e.g. Paragraph B", hint: "The paragraph that needs a heading." };
    case "sentence_completion":
    case "form_completion":
      return {
        label: "Sentence",
        placeholder: "e.g. A honeybee colony may contain ___ workers.",
        hint: "Mark the gap with three or more underscores: ___",
      };
    case "summary_completion":
      return {
        label: "Summary text up to this gap",
        placeholder: "e.g. Urban beekeeping has become popular in cities such as ___.",
        hint: "Mark the gap with ___. The parts of all questions are joined into one summary paragraph.",
      };
    default: {
      const unhandled: never = payload;
      return unhandled;
    }
  }
}

export function QuestionEditor({
  question,
  number,
  payload,
  paragraphLabels,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
}: Props) {
  const copy = promptCopy(payload);

  return (
    <li className="flex gap-3 rounded-md border border-slate-200 p-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
        {number}
      </span>

      <div className="min-w-0 flex-1 space-y-3">
        <Field label={copy.label} hint={copy.hint}>
          <TextArea
            rows={2}
            value={question.prompt}
            placeholder={copy.placeholder}
            onChange={(event) => onChange({ ...question, prompt: event.target.value })}
          />
        </Field>

        {payload.type === "multiple_choice_single" && (
          <OptionsEditor question={question} onChange={onChange} />
        )}

        <AnswerEditor question={question} payload={payload} paragraphLabels={paragraphLabels} onChange={onChange} />
      </div>

      <div className="flex shrink-0 flex-col">
        <IconButton label={`Move question ${number} up`} disabled={!canMoveUp} onClick={() => onMove(-1)}>
          <ArrowUp className="h-4 w-4" aria-hidden />
        </IconButton>
        <IconButton label={`Move question ${number} down`} disabled={!canMoveDown} onClick={() => onMove(1)}>
          <ArrowDown className="h-4 w-4" aria-hidden />
        </IconButton>
        <IconButton label={`Remove question ${number}`} onClick={onRemove}>
          <Trash2 className="h-4 w-4" aria-hidden />
        </IconButton>
      </div>
    </li>
  );
}

function OptionsEditor({
  question,
  onChange,
}: {
  question: AdminQuestion;
  onChange: (question: AdminQuestion) => void;
}) {
  const options = question.options ?? [];

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-slate-700">Options</span>
      {options.map((option, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="w-5 shrink-0 text-sm font-semibold">{option.key}</span>
          <TextInput
            aria-label={`Option ${option.key}`}
            value={option.text}
            onChange={(event) =>
              onChange({ ...question, options: replaceAt(options, index, { ...option, text: event.target.value }) })
            }
          />
          <IconButton
            label={`Remove option ${option.key}`}
            onClick={() =>
              onChange({
                ...question,
                // Re-letter the remaining options A, B, C… and drop an answer that no longer exists.
                options: removeAt(options, index).map((o, i) => ({ ...o, key: String.fromCharCode(65 + i) })),
                answers: [],
              })
            }
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </IconButton>
        </div>
      ))}
      {options.length < 8 && (
        <button
          type="button"
          onClick={() =>
            onChange({
              ...question,
              options: [...options, { key: String.fromCharCode(65 + options.length), text: "" }],
            })
          }
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:underline"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
          Add option
        </button>
      )}
    </div>
  );
}

function AnswerEditor({
  question,
  payload,
  paragraphLabels,
  onChange,
}: {
  question: AdminQuestion;
  payload: GroupPayload;
  paragraphLabels: string[];
  onChange: (question: AdminQuestion) => void;
}) {
  const answer = question.answers[0] ?? "";
  const setAnswer = (value: string) => onChange({ ...question, answers: value ? [value] : [] });

  switch (payload.type) {
    case "true_false_not_given":
    case "yes_no_not_given":
      return (
        <fieldset className="space-y-1">
          <legend className="text-sm font-medium text-slate-700">Correct answer</legend>
          <div className="flex flex-wrap gap-2">
            {FIXED_CHOICES[payload.type].map((choice) => (
              <label
                key={choice}
                className="flex cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1 text-sm has-checked:border-emerald-500 has-checked:bg-emerald-50"
              >
                <input
                  type="radio"
                  name={`answer-${question.id}`}
                  checked={answer === choice}
                  onChange={() => setAnswer(choice)}
                  className="accent-emerald-600"
                />
                {choice}
              </label>
            ))}
          </div>
        </fieldset>
      );
    case "multiple_choice_single":
    case "matching_headings":
    case "matching_information": {
      const choices =
        payload.type === "multiple_choice_single"
          ? (question.options ?? []).map((o) => ({ value: o.key, label: o.text ? `${o.key} — ${o.text}` : o.key }))
          : payload.type === "matching_headings"
            ? payload.headings.map((h) => ({ value: h.key, label: h.text ? `${h.key} — ${h.text}` : h.key }))
            : paragraphLabels.map((label) => ({ value: label, label: `Paragraph ${label}` }));
      return (
        <Field
          label="Correct answer"
          hint={
            payload.type === "matching_information" && paragraphLabels.length === 0
              ? "Label the paragraphs of this passage first."
              : undefined
          }
        >
          <Select value={answer} onChange={(event) => setAnswer(event.target.value)} className="w-full max-w-md">
            <option value="">Choose…</option>
            {choices.map((choice) => (
              <option key={choice.value} value={choice.value}>
                {choice.label}
              </option>
            ))}
          </Select>
        </Field>
      );
    }
    case "sentence_completion":
    case "summary_completion":
    case "form_completion":
      return <AcceptedAnswers key={payload.type} question={question} onChange={onChange} />;
    default: {
      const unhandled: never = payload;
      return unhandled;
    }
  }
}

/** One accepted answer per line, e.g. "16" and "sixteen". */
function AcceptedAnswers({
  question,
  onChange,
}: {
  question: AdminQuestion;
  onChange: (question: AdminQuestion) => void;
}) {
  // Raw text is kept locally so a new empty line can be typed.
  const [text, setText] = useState(question.answers.join("\n"));

  return (
    <Field
      label="Accepted answers"
      hint="One per line, e.g. 50,000 / 50000. Capital letters don't matter; spelling does."
    >
      <TextArea
        rows={2}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          onChange({
            ...question,
            answers: event.target.value
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean),
          });
        }}
        className="w-full max-w-md font-mono"
      />
    </Field>
  );
}
