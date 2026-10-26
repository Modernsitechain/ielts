"use client";

import { FIXED_CHOICES, type Question, type QuestionGroup } from "@/core/models/test";

const BLANK = /_{3,}/;

type Props = {
  group: QuestionGroup;
  /** Labels of the passage paragraphs (A, B, …), for matching information. */
  paragraphLabels: string[];
  answers: Record<string, string>;
  currentNumber: number;
  disabled: boolean;
  onAnswer: (questionId: string, value: string) => void;
  onFocusQuestion: (number: number) => void;
};

export function QuestionGroupView({
  group,
  paragraphLabels,
  answers,
  currentNumber,
  disabled,
  onAnswer,
  onFocusQuestion,
}: Props) {
  const payload = group.payload;

  const renderInput = (question: Question) => {
    const value = answers[question.id] ?? "";

    switch (payload.type) {
      case "true_false_not_given":
      case "yes_no_not_given":
        return (
          <ChoiceList
            question={question}
            options={FIXED_CHOICES[payload.type].map((option) => ({ key: option, text: option }))}
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
      case "matching_headings":
        return (
          <ChoiceSelect
            question={question}
            choices={payload.headings.map((heading) => heading.key)}
            value={value}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        );
      case "matching_information":
        return (
          <ChoiceSelect
            question={question}
            choices={paragraphLabels}
            value={value}
            disabled={disabled}
            onAnswer={onAnswer}
          />
        );
      case "sentence_completion":
      case "summary_completion":
      case "form_completion":
        return (
          <GapSentence question={question} value={value} disabled={disabled} onAnswer={onAnswer} />
        );
      default: {
        const unhandled: never = payload;
        return unhandled;
      }
    }
  };

  // Choice and matching questions show the prompt above the input; completion
  // questions put the input inside the prompt sentence.
  const showPrompt =
    payload.type !== "sentence_completion" &&
    payload.type !== "summary_completion" &&
    payload.type !== "form_completion";

  return (
    <section className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">
          Questions {group.numberFrom}–{group.numberTo}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{group.instructions}</p>
        {payload.type === "matching_headings" && (
          <div className="mt-3 rounded-lg bg-slate-50 p-3">
            <p className="text-sm font-semibold">List of Headings</p>
            <ul className="mt-1.5 space-y-1 text-sm">
              {payload.headings.map((heading) => (
                <li key={heading.key} className="flex gap-3">
                  <span className="w-6 shrink-0 font-semibold">{heading.key}</span>
                  {heading.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {payload.type === "summary_completion" ? (
        // A summary reads as one paragraph with numbered gaps.
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          {payload.title && <p className="mb-2 font-semibold">{payload.title}</p>}
          <p className="leading-loose">
            {group.questions.map((question) => {
              const [before, after] = question.prompt.split(BLANK);
              return (
                <span
                  key={question.id}
                  id={`question-${question.number}`}
                  onFocus={() => onFocusQuestion(question.number)}
                >
                  {before}
                  <GapInput
                    question={question}
                    value={answers[question.id] ?? ""}
                    disabled={disabled}
                    highlighted={question.number === currentNumber}
                    onAnswer={onAnswer}
                  />
                  {after}{" "}
                </span>
              );
            })}
          </p>
        </div>
      ) : (
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
      )}
    </section>
  );
}

type InputProps = {
  question: Question;
  value: string;
  disabled: boolean;
  onAnswer: (questionId: string, value: string) => void;
};

function GapSentence(props: InputProps) {
  const [before, after] = props.question.prompt.split(BLANK);
  return (
    <p className="leading-loose">
      {before}
      <GapInput {...props} highlighted={false} />
      {after}
    </p>
  );
}

function GapInput({
  question,
  value,
  disabled,
  highlighted,
  onAnswer,
}: InputProps & { highlighted: boolean }) {
  return (
    <input
      type="text"
      value={value}
      disabled={disabled}
      placeholder={String(question.number)}
      aria-label={`Question ${question.number}`}
      autoComplete="off"
      spellCheck={false}
      onChange={(event) => onAnswer(question.id, event.target.value)}
      className={`mx-1 w-44 rounded-md border bg-white px-2.5 py-1 text-sm shadow-xs transition placeholder:text-center placeholder:font-semibold placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden ${
        highlighted ? "border-indigo-400" : "border-slate-300"
      }`}
    />
  );
}

function ChoiceSelect({
  question,
  choices,
  value,
  disabled,
  onAnswer,
}: InputProps & { choices: string[] }) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={`Question ${question.number}`}
      onChange={(event) => onAnswer(question.id, event.target.value)}
      className="w-28 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm shadow-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
    >
      <option value="">Choose…</option>
      {choices.map((choice) => (
        <option key={choice} value={choice}>
          {choice}
        </option>
      ))}
    </select>
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
