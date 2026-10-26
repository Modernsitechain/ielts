"use client";

import {
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";

import { type AdminTest, checkPublishReadiness } from "@/core/models/test";
import { Button, Field, TextInput } from "@/shared/components/form";
import { StatusBadge } from "@/shared/components/status-badge";
import { formatDateTime } from "@/shared/utils/format";
import {
  deleteTestAction,
  type EditorActionResult,
  publishTestAction,
  saveTestAction,
  unpublishTestAction,
} from "../actions";
import { newId, removeAt, replaceAt } from "../editor-defaults";
import { PassageEditor } from "./passage-editor";

const MAX_PASSAGES = 3;

type Feedback = { kind: "success" | "error"; message: string; errors: string[] };

/**
 * Edits a whole test locally and saves it in one request (PUT /admin/tests/:id).
 * Published and Listening tests are shown read-only.
 */
export function TestEditor({ initialTest }: { initialTest: AdminTest }) {
  const [saved, setSaved] = useState(initialTest);
  const [test, setTest] = useState(initialTest);
  const [activeIndex, setActiveIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDirty = useMemo(() => JSON.stringify(test) !== JSON.stringify(saved), [test, saved]);
  const check = useMemo(() => checkPublishReadiness(test), [test]);
  const isPublished = saved.status === "published";
  const readOnly = isPublished || saved.skill !== "reading";
  const activeSection = test.sections[Math.min(activeIndex, test.sections.length - 1)];

  // First question number of each passage (numbers run 1–40 across the test).
  const startNumbers: number[] = [];
  let nextNumber = 1;
  for (const section of test.sections) {
    startNumbers.push(nextNumber);
    nextNumber += section.groups.reduce((sum, group) => sum + group.questions.length, 0);
  }

  useEffect(() => {
    if (!isDirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const run = (action: () => Promise<EditorActionResult>, successMessage: string) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setSaved(result.test);
        setTest(result.test);
        setFeedback({ kind: "success", message: successMessage, errors: [] });
      } else {
        setFeedback({ kind: "error", message: result.message, errors: result.errors });
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${saved.title}"? This can't be undone.`)) return;
    startTransition(async () => {
      // Redirects to the test list on success.
      const result = await deleteTestAction(saved.id);
      if (!result.ok) setFeedback({ kind: "error", message: result.message, errors: result.errors });
    });
  };

  const addPassage = () => {
    setTest({
      ...test,
      sections: [...test.sections, { id: newId(), title: "", paragraphs: [], groups: [] }],
    });
    setActiveIndex(test.sections.length);
  };

  const removePassage = (index: number) => {
    if (!window.confirm(`Remove Passage ${index + 1} and all its questions?`)) return;
    setTest({ ...test, sections: removeAt(test.sections, index) });
    setActiveIndex(Math.max(0, index - 1));
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-14 z-30 -mx-4 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-bold">{test.title || "Untitled test"}</h1>
            <StatusBadge status={saved.status} />
          </div>
          <p className="text-xs text-slate-500">
            {isDirty ? "Unsaved changes" : `Saved ${formatDateTime(saved.updatedAt)}`}
          </p>
        </div>

        {isPending && <LoaderCircle className="h-4 w-4 animate-spin text-slate-500" aria-hidden />}
        {!isPublished && (
          <Button variant="danger" onClick={handleDelete} disabled={isPending}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete
          </Button>
        )}
        {isPublished ? (
          <Button
            onClick={() => run(() => unpublishTestAction(saved.id), "Unpublished. You can edit the test again.")}
            disabled={isPending}
          >
            <EyeOff className="h-4 w-4" aria-hidden />
            Unpublish to edit
          </Button>
        ) : (
          saved.skill === "reading" && (
            <>
              <Button
                onClick={() => run(() => saveTestAction(saved.id, test), "Saved.")}
                disabled={isPending || !isDirty}
              >
                <Save className="h-4 w-4" aria-hidden />
                Save
              </Button>
              <Button
                variant="primary"
                onClick={() => run(() => publishTestAction(saved.id), "Published. Candidates can now take this test.")}
                disabled={isPending || isDirty || check.errors.length > 0}
                title={
                  isDirty
                    ? "Save your changes first"
                    : check.errors.length > 0
                      ? "Fix the problems in the checklist first"
                      : undefined
                }
              >
                <Eye className="h-4 w-4" aria-hidden />
                Publish
              </Button>
            </>
          )
        )}
      </div>

      {feedback && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.kind === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{feedback.message}</p>
          {feedback.errors.length > 0 && (
            <ul className="mt-1 list-disc space-y-0.5 pl-5">
              {feedback.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {readOnly && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {isPublished
            ? "Published tests are read-only, so candidates never see a test change halfway through. Unpublish it to make changes."
            : "Listening tests can't be edited in the admin yet."}
        </p>
      )}

      <fieldset disabled={readOnly || isPending} className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <div className="flex flex-wrap items-center gap-1 border-b border-slate-200">
            {test.sections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                  section === activeSection
                    ? "border-indigo-600 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                Passage {index + 1}
              </button>
            ))}
            {test.sections.length < MAX_PASSAGES && (
              <Button variant="ghost" onClick={addPassage} className="mb-1 ml-1">
                <Plus className="h-4 w-4" aria-hidden />
                Add passage
              </Button>
            )}
          </div>

          {activeSection ? (
            <PassageEditor
              key={activeSection.id}
              section={activeSection}
              passageNumber={test.sections.indexOf(activeSection) + 1}
              startNumber={startNumbers[test.sections.indexOf(activeSection)] ?? 1}
              onChange={(section) =>
                setTest({
                  ...test,
                  sections: replaceAt(test.sections, test.sections.indexOf(activeSection), section),
                })
              }
              onRemove={() => removePassage(test.sections.indexOf(activeSection))}
            />
          ) : (
            <p className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              A Reading test has 3 passages. Add the first one to start.
            </p>
          )}
        </div>

        <aside className="space-y-4">
          <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Test settings</h2>
            <Field label="Title">
              <TextInput
                value={test.title}
                maxLength={200}
                onChange={(event) => setTest({ ...test, title: event.target.value })}
              />
            </Field>
            <Field label="Time limit (minutes)" hint="IELTS Academic Reading: 60 minutes.">
              <TextInput
                type="number"
                min={1}
                max={180}
                value={test.durationMinutes}
                onChange={(event) =>
                  setTest({ ...test, durationMinutes: Number(event.target.value) || 1 })
                }
              />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={test.isFree}
                onChange={(event) => setTest({ ...test, isFree: event.target.checked })}
                className="accent-indigo-600"
              />
              Free test (available without a paid plan)
            </label>
          </div>

          <PublishChecklist errors={check.errors} warnings={check.warnings} />
        </aside>
      </fieldset>
    </div>
  );
}

function PublishChecklist({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="font-semibold">Ready to publish?</h2>
      {errors.length === 0 ? (
        <p className="flex items-center gap-1.5 text-sm text-emerald-700">
          <CircleCheck className="h-4 w-4" aria-hidden />
          No blocking problems.
        </p>
      ) : (
        <ul className="space-y-1.5 text-sm text-red-700">
          {errors.map((error, index) => (
            <li key={index} className="flex gap-1.5">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {error}
            </li>
          ))}
        </ul>
      )}
      {warnings.length > 0 && (
        <ul className="space-y-1.5 border-t border-slate-100 pt-3 text-sm text-amber-800">
          {warnings.map((warning, index) => (
            <li key={index} className="flex gap-1.5">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              {warning}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
