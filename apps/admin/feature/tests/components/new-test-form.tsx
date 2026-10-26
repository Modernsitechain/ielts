"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState } from "react";

import { Button, Field, TextInput } from "@/shared/components/form";
import { type CreateTestState, createTestAction } from "../actions";

const initialState: CreateTestState = { message: null };

export function NewTestForm() {
  const [state, formAction, isPending] = useActionState(createTestAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <Field label="Title" hint="e.g. Academic Reading Test 1. You can change it later.">
        <TextInput name="title" required maxLength={200} autoFocus />
      </Field>
      {state.message && <p className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" variant="primary" disabled={isPending}>
        {isPending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
        Create draft
      </Button>
    </form>
  );
}
