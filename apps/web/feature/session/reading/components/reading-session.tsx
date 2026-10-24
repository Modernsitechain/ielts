"use client";

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
  // Urutan soal 1..N beserta passage tempatnya berada.
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

  // Autosave ke server setelah jawaban berhenti berubah sebentar.
  useEffect(() => {
    if (answers === session.answers) return;
    setSaveState("saving");
    const timeout = setTimeout(async () => {
      const ok = await saveAnswersAction(session.id, answers).catch(() => false);
      setSaveState(ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [answers, session.id, session.answers]);

  // Bawa soal yang aktif ke area terlihat (misalnya setelah klik di nav).
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
        ? `Masih ada ${unanswered} soal yang belum dijawab. Submit sekarang?`
        : "Submit jawaban sekarang? Jawaban tidak bisa diubah setelah submit.";
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

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-slate-300 bg-slate-100 px-4 py-2">
        <h1 className="truncate font-semibold">{test.title}</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500" aria-live="polite">
            {saveState === "saving" && "Menyimpan…"}
            {saveState === "saved" && "Tersimpan"}
            {saveState === "error" && "Gagal menyimpan"}
          </span>
          <Timer endsAt={session.endsAt} onExpire={submit} />
          <button
            type="button"
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {isSubmitting ? "Mengirim…" : "Submit"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-2">
        <div className="overflow-y-auto border-r border-slate-300 p-6">
          <Passage section={section} />
        </div>
        <div className="space-y-8 overflow-y-auto p-6">
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
