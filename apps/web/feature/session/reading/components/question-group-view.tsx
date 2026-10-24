"use client";

import type { Question, QuestionGroup } from "@/core/models/test";

const TFNG_OPTIONS = ["TRUE", "FALSE", "NOT GIVEN"];
const BLANK = /_{3,}/;

type Props = {
  group: QuestionGroup;
  answers: Record<string, string>;
  currentNumber: number;
  disabled: boolean;
  onAnswer: (questionId: string, value: string) => void;
  onFocusQuestion: (number: number) => void;
};

export function QuestionGroupView({
  group,
  answers,
  currentNumber,
  disabled,
  onAnswer,
  onFocusQuestion,
}: Props) {
  const renderInput = (question: Question) => {
    const value = answers[question.id] ?? "";
    const payload = group.payload;

    switch (payload.type) {
      case "true_false_not_given":
        return (
          <ChoiceList
            question={question}
            options={TFNG_OPTIONS.map((option) => ({ key: option, text: option }))}
            showKey={false}
            value={value}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        );
      case "multiple_choice_single":
        return (
          <ChoiceList
            question={question}
            options={question.options ?? []}
            showKey
            value={value}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        );
      case "sentence_completion":
      case "form_completion": {
        const [before, after] = question.prompt.split(BLANK);
        return (
          <p className="leading-loose">
            {before}
            <input
              type="text"
              value={value}
              disabled={disabled}
              aria-label={`Question ${question.number}`}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => onAnswer(question.id, event.target.value)}
              className="mx-1 w-44 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm shadow-xs transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
            {after}
          </p>
        );
      }
      default: {
        const unhandled: never = payload;
        return unhandled;
      }
    }
  };

  // Choice questions show the prompt above the options; completion questions
  // put the input inside the prompt sentence.
  const showPrompt =
    group.payload.type === "true_false_not_given" ||
    group.payload.type === "multiple_choice_single";

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">
          Questions {group.numberFrom}–{group.numberTo}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{group.instructions}</p>
      </header>

      <ol className="space-y-2">
        {group.questions.map((question) => (
          <li
            key={question.id}
            id={`question-${question.number}`}
            onFocus={() => onFocusQuestion(question.number)}
            onClick={() => onFocusQuestion(question.number)}
            className={`flex gap-3 rounded-xl p-3 transition ${
              question.number === currentNumber
                ? "bg-indigo-50/70 ring-1 ring-indigo-200"
                : "hover:bg-white"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-900 text-xs font-semibold text-white">
              {question.number}
            </span>
            <div className="flex-1 space-y-2">
              {showPrompt && <p>{question.prompt}</p>}
              {renderInput(question)}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ChoiceList({
  question,
  options,
  showKey,
  value,
  disabled,
  onAnswer,
}: {
  question: Question;
  options: { key: string; text: string }[];
  showKey: boolean;
  value: string;
  disabled: boolean;
  onAnswer: (questionId: string, value: string) => void;
}) {
  return (
    <div className="grid gap-1.5">
      {options.map((option) => (
        <label
          key={option.key}
          className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-slate-300 has-checked:border-indigo-500 has-checked:bg-indigo-50"
        >
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option.key}
            checked={value === option.key}
            disabled={disabled}
            onChange={() => onAnswer(question.id, option.key)}
            className="mt-0.5 accent-indigo-600"
          />
          <span>
            {showKey && <span className="mr-2 font-semibold">{option.key}</span>}
            {option.text}
          </span>
        </label>
      ))}
    </div>
  );
}
