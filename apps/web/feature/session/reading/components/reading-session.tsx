"use client";

import { CircleAlert, CircleCheck, GraduationCap, LoaderCircle, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

import type { AttemptSession } from "@/core/models/attempt";
import type { TestDetail } from "@/core/models/test";
import { saveAnswersAction, submitAttemptAction } from "@/feature/session/actions";
import { Passage } from "./passage";
import { QuestionGroupView } from "./question-group-view";
import { type NavPart, QuestionNav } from "./question-nav";
import { Timer } from "./timer";

const AUTOSAVE_DELAY_MS = 800;

type SaveState = "saved" | "saving" | "error";

export function ReadingSession({
  test,
  session,
}: {
  test: TestDetail;
  session: AttemptSession;
}) {
  // Questions 1..N, each with the passage it belongs to.
  const questions = useMemo(
    () =>
      test.sections.flatMap((section, sectionIndex) =>
        section.groups.flatMap((group) =>
          group.questions.map((question) => ({ ...question, sectionIndex })),
        ),
      ),
    [test],
  );
  const parts: NavPart[] = useMemo(
    () =>
      test.sections.map((section, index) => ({
        title: `Part ${index + 1}`,
        numbers: questions
          .filter((question) => question.sectionIndex === index)
          .map((question) => question.number),
      })),
    [test, questions],
  );

  const [answers, setAnswers] = useState(session.answers);
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());
  const [currentNumber, setCurrentNumber] = useState(questions[0]?.number ?? 1);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [isSubmitting, startSubmit] = useTransition();

  const currentIndex = questions.findIndex((q) => q.number === currentNumber);
  const sectionIndex = questions[currentIndex]?.sectionIndex ?? 0;
  const section = test.sections[sectionIndex];

  const answeredNumbers = useMemo(
    () =>
      new Set(
        questions
          .filter((question) => (answers[question.id] ?? "").trim() !== "")
          .map((question) => question.number),
      ),
    [questions, answers],
  );

  // Autosave to the server once answers stop changing for a moment.
  useEffect(() => {
    if (answers === session.answers) return;
    setSaveState("saving");
    const timeout = setTimeout(async () => {
      const ok = await saveAnswersAction(session.id, answers).catch(() => false);
      setSaveState(ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [answers, session.id, session.answers]);

  // Scroll the active question into view (e.g. after clicking in the nav).
  useEffect(() => {
    document
      .getElementById(`question-${currentNumber}`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentNumber]);

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const submit = useCallback(() => {
    startSubmit(async () => {
      await submitAttemptAction(session.id, answersRef.current);
    });
  }, [session.id]);

  const handleSubmitClick = () => {
    const unanswered = questions.length - answeredNumbers.size;
    const message =
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit now?`
        : "Submit your answers now? You won't be able to change them afterwards.";
    if (window.confirm(message)) submit();
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
  };

  const goToIndex = (index: number) => {
    const question = questions[index];
    if (question) setCurrentNumber(question.number);
  };

  const toggleFlag = () => {
    setFlagged((previous) => {
      const next = new Set(previous);
      if (next.has(currentNumber)) next.delete(currentNumber);
      else next.add(currentNumber);
      return next;
    });
  };

  if (!section) return null;

  const partNumbers = parts[sectionIndex]?.numbers ?? [];

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          <GraduationCap className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Academic Reading</p>
          <h1 className="truncate text-sm font-semibold">{test.title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <SaveIndicator state={saveState} />
          <Timer endsAt={session.endsAt} onExpire={submit} />
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {isSubmitting ? "Submitting…" : "Submit"}
          </button>
        </div>
      </header>

      <div className="shrink-0 border-b border-slate-200 bg-slate-50 px-6 py-2.5">
        <p className="text-sm font-semibold">Part {sectionIndex + 1}</p>
        <p className="text-sm text-slate-600">
          Read the text and answer questions {partNumbers[0]}–{partNumbers.at(-1)}.
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="overflow-y-auto border-r border-slate-200 bg-white px-8 py-8">
          <Passage section={section} />
        </div>
        <div className="space-y-8 overflow-y-auto bg-slate-50/60 px-6 py-8">
          {section.groups.map((group) => (
            <QuestionGroupView
              key={group.id}
              group={group}
              answers={answers}
              currentNumber={currentNumber}
              disabled={isSubmitting}
              onAnswer={handleAnswer}
              onFocusQuestion={setCurrentNumber}
            />
          ))}
        </div>
      </div>

      <QuestionNav
        parts={parts}
        currentNumber={currentNumber}
        answeredNumbers={answeredNumbers}
        flaggedNumbers={flagged}
        onSelect={setCurrentNumber}
        onPrevious={() => goToIndex(currentIndex - 1)}
        onNext={() => goToIndex(currentIndex + 1)}
        onToggleFlag={toggleFlag}
      />
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  return (
    <span
      className="hidden items-center gap-1 text-xs text-slate-500 sm:inline-flex"
      aria-live="polite"
    >
      {state === "saving" && (
        <>
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
          Saving…
        </>
      )}
      {state === "saved" && (
        <>
          <CircleCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
          Saved
        </>
      )}
      {state === "error" && (
        <span className="inline-flex items-center gap-1 text-red-600">
          <CircleAlert className="h-3.5 w-3.5" aria-hidden />
          Couldn&apos;t save
        </span>
      )}
    </span>
  );
}
