"use client";

import {
  CircleAlert,
  CircleCheck,
  GraduationCap,
  Highlighter,
  LoaderCircle,
  Send,
  StickyNote,
  Trash2,
} from "lucide-react";
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  addHighlight,
  type Annotation,
  isHighlighted,
  paragraphBlockId,
  promptBlockId,
  promptParts,
  removeAnnotation,
  removeHighlights,
  setNote,
  textBlocks,
} from "@/core/models/annotation";
import type { AttemptSession } from "@/core/models/attempt";
import type { TestDetail } from "@/core/models/test";
import {
  saveAnnotationsAction,
  saveAnswersAction,
  saveFlagsAction,
  submitAttemptAction,
} from "@/feature/session/actions";

import { AnnotationsProvider } from "../annotations/annotations-context";
import { NoteEditor } from "../annotations/note-editor";
import { NotesPanel } from "../annotations/notes-panel";
import { ContextMenu, type MenuAction, type MenuPosition } from "../annotations/context-menu";
import { clearSelection, highlightAt, readSelection } from "../annotations/selection";
import { TEXT_SIZE_ZOOM, useExamSettings } from "../settings/exam-settings";
import { SettingsMenu } from "../settings/settings-menu";
import { Passage } from "./passage";
import { QuestionGroupView } from "./question-group-view";
import { type NavPart, QuestionNav } from "./question-nav";
import { Timer } from "./timer";

const AUTOSAVE_DELAY_MS = 800;

type SaveState = "saved" | "saving" | "error";

/** The open right-click menu and what it acts on. */
type OpenMenu = { position: MenuPosition; actions: MenuAction[] };

const MENU_WIDTH = 176;

/** Keeps the menu inside the window. */
function menuPosition(x: number, y: number): MenuPosition {
  return {
    x: Math.max(8, Math.min(x, window.innerWidth - MENU_WIDTH - 8)),
    y: Math.max(8, Math.min(y, window.innerHeight - 140)),
  };
}

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
  const [flaggedIds, setFlaggedIds] = useState(session.flaggedQuestionIds);
  const [flagSaveState, setFlagSaveState] = useState<SaveState>("saved");
  const [currentNumber, setCurrentNumber] = useState(questions[0]?.number ?? 1);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [annotations, setAnnotations] = useState(session.annotations);
  const [annotationSaveState, setAnnotationSaveState] = useState<SaveState>("saved");
  const [menu, setMenu] = useState<OpenMenu | null>(null);
  const [editing, setEditing] = useState<Annotation | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [isSubmitting, startSubmit] = useTransition();
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useExamSettings();
  // Text size scales the passage and questions (text, inputs and spacing).
  const zoom = { zoom: TEXT_SIZE_ZOOM[settings.textSize] };

  // Text of every highlightable block, and the question each block belongs to
  // (paragraphs: the first question of their part), for notes and navigation.
  const blocks = useMemo(() => textBlocks(test), [test]);
  const blockQuestion = useMemo(() => {
    const map = new Map<string, number>();
    test.sections.forEach((section, sectionIndex) => {
      const first = questions.find((question) => question.sectionIndex === sectionIndex)?.number ?? 1;
      (section.paragraphs ?? []).forEach((_, index) => {
        map.set(paragraphBlockId(section.id, index), first);
      });
    });
    for (const question of questions) {
      promptParts(question.prompt).forEach((_, part) => {
        map.set(promptBlockId(question.id, part), question.number);
      });
    }
    return map;
  }, [test, questions]);

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
  // ("saving" is set by handleAnswer, when the change happens.)
  useEffect(() => {
    if (answers === session.answers) return;
    const timeout = setTimeout(async () => {
      const ok = await saveAnswersAction(session.id, answers).catch(() => false);
      setSaveState(ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [answers, session.id, session.answers]);

  // Flags are saved the same way; the nav works with question numbers.
  const flaggedNumbers = useMemo(
    () => new Set(questions.filter((q) => flaggedIds.includes(q.id)).map((q) => q.number)),
    [questions, flaggedIds],
  );
  useEffect(() => {
    if (flaggedIds === session.flaggedQuestionIds) return;
    const timeout = setTimeout(async () => {
      const ok = await saveFlagsAction(session.id, flaggedIds).catch(() => false);
      setFlagSaveState(ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [flaggedIds, session.id, session.flaggedQuestionIds]);

  // Autosave highlights and notes the same way.
  useEffect(() => {
    if (annotations === session.annotations) return;
    const timeout = setTimeout(async () => {
      const ok = await saveAnnotationsAction(session.id, annotations).catch(() => false);
      setAnnotationSaveState(ok ? "saved" : "error");
    }, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [annotations, session.id, session.annotations]);

  const updateAnnotations = (change: (previous: Annotation[]) => Annotation[]) => {
    setAnnotations(change);
    setAnnotationSaveState("saving");
  };

  const quoteOf = (annotation: Annotation) =>
    (blocks.get(annotation.blockId) ?? "").slice(annotation.start, annotation.end);

  const closeMenu = useCallback(() => setMenu(null), []);

  /** Runs a menu action, then closes the menu and drops the text selection. */
  const act = (run: () => void) => () => {
    run();
    clearSelection();
    setMenu(null);
  };

  // Right-click, like IELTS on computer: on selected text, highlight or
  // annotate it; on an existing highlight, remove it or edit its note.
  // Anywhere else the browser's own menu opens.
  const openContextMenu = (event: MouseEvent) => {
    if (isSubmitting || !workspaceRef.current) return;
    const selected = readSelection(workspaceRef.current);
    const position = menuPosition(event.clientX, event.clientY);

    if (selected) {
      event.preventDefault();
      const { ranges } = selected;
      const actions: MenuAction[] = [
        {
          label: "Highlight",
          icon: Highlighter,
          iconClassName: "text-yellow-500",
          onSelect: act(() =>
            updateAnnotations((previous) => ranges.reduce((list, range) => addHighlight(list, range), previous)),
          ),
        },
        {
          label: "Add note",
          icon: StickyNote,
          iconClassName: "text-amber-600",
          onSelect: act(() => {
            const next = ranges.reduce((list, range) => addHighlight(list, range), annotations);
            updateAnnotations(() => next);
            // Edit the highlight that now covers the start of the selection.
            const [first] = ranges;
            const target =
              first &&
              next.find((a) => a.blockId === first.blockId && a.start <= first.start && a.end > first.start);
            if (target) setEditing(target);
          }),
        },
      ];
      if (ranges.some((range) => isHighlighted(annotations, range))) {
        // Removes every highlight the selection touches, whole.
        actions.push({
          label: "Remove highlight",
          icon: Trash2,
          iconClassName: "text-red-500",
          onSelect: act(() =>
            updateAnnotations((previous) =>
              ranges.reduce((list, range) => removeHighlights(list, range), previous),
            ),
          ),
        });
      }
      setMenu({ position, actions });
      return;
    }

    const at = highlightAt(event.target);
    const annotation = at && annotations.find((a) => a.blockId === at.blockId && a.start === at.start);
    if (!annotation) return;
    event.preventDefault();
    setMenu({
      position,
      actions: [
        {
          label: annotation.note ? "Edit note" : "Add note",
          icon: StickyNote,
          iconClassName: "text-amber-600",
          onSelect: act(() => setEditing(annotation)),
        },
        {
          label: "Remove highlight",
          icon: Trash2,
          iconClassName: "text-red-500",
          onSelect: act(() => updateAnnotations((previous) => removeAnnotation(previous, annotation))),
        },
      ],
    });
  };

  const openNote = (annotation: Annotation) => {
    const number = blockQuestion.get(annotation.blockId);
    if (number) setCurrentNumber(number);
    setNotesOpen(false);
    setEditing(annotation);
  };

  const notes = annotations.filter((annotation) => annotation.note);
  const saveStates = [saveState, annotationSaveState, flagSaveState];
  const shownSaveState: SaveState = saveStates.includes("error")
    ? "error"
    : saveStates.includes("saving")
      ? "saving"
      : "saved";

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
    setSaveState("saving");
  };

  const goToIndex = (index: number) => {
    const question = questions[index];
    if (question) setCurrentNumber(question.number);
  };

  const toggleFlag = () => {
    const question = questions[currentIndex];
    if (!question) return;
    setFlaggedIds((previous) =>
      previous.includes(question.id)
        ? previous.filter((id) => id !== question.id)
        : [...previous, question.id],
    );
    setFlagSaveState("saving");
  };

  if (!section) return null;

  const partNumbers = parts[sectionIndex]?.numbers ?? [];
  const paragraphLabels = (section.paragraphs ?? []).flatMap((p) => (p.label ? [p.label] : []));

  return (
    <div className="flex h-screen flex-col" data-contrast={settings.contrast}>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
          <GraduationCap className="h-4.5 w-4.5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-slate-500">Academic Reading</p>
          <h1 className="truncate text-sm font-semibold">{test.title}</h1>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <SaveIndicator state={shownSaveState} />
          <SettingsMenu settings={settings} onChange={setSettings} />
          <button
            type="button"
            onClick={() => setNotesOpen((open) => !open)}
            aria-pressed={notesOpen}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <StickyNote className="h-4 w-4 text-amber-600" aria-hidden />
            Notes{notes.length > 0 && ` (${notes.length})`}
          </button>
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

      <AnnotationsProvider value={annotations}>
        <div
          ref={workspaceRef}
          className="relative grid min-h-0 flex-1 grid-cols-2"
          onContextMenu={openContextMenu}
        >
          <div className="overflow-y-auto border-r border-slate-200 bg-white px-8 py-8">
            <div style={zoom}>
              <Passage section={section} />
            </div>
          </div>
          <div className="overflow-y-auto bg-slate-50/60 px-6 py-8">
            <div className="space-y-8" style={zoom}>
              {section.groups.map((group) => (
                <QuestionGroupView
                  key={group.id}
                  group={group}
                  paragraphLabels={paragraphLabels}
                  answers={answers}
                  currentNumber={currentNumber}
                  disabled={isSubmitting}
                  onAnswer={handleAnswer}
                  onFocusQuestion={setCurrentNumber}
                />
              ))}
            </div>
          </div>

          {notesOpen && (
            <NotesPanel
              notes={notes}
              quoteOf={quoteOf}
              onSelect={openNote}
              onClose={() => setNotesOpen(false)}
            />
          )}
        </div>
      </AnnotationsProvider>

      {menu && <ContextMenu position={menu.position} actions={menu.actions} onClose={closeMenu} />}

      {editing && (
        <NoteEditor
          key={`${editing.blockId}:${editing.start}`}
          annotation={editing}
          quote={quoteOf(editing)}
          onSave={(note) => {
            updateAnnotations((previous) => setNote(previous, editing, note));
            setEditing(null);
          }}
          onRemove={() => {
            updateAnnotations((previous) => removeAnnotation(previous, editing));
            setEditing(null);
          }}
          onClose={() => setEditing(null)}
        />
      )}

      <QuestionNav
        parts={parts}
        currentNumber={currentNumber}
        answeredNumbers={answeredNumbers}
        flaggedNumbers={flaggedNumbers}
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
