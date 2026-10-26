"use client";

import { createContext, type ReactNode, useContext } from "react";

import type { Annotation } from "@/core/models/annotation";

const AnnotationsContext = createContext<Annotation[]>([]);

/** Shares the session's highlights with every HighlightableText below it. */
export function AnnotationsProvider({ value, children }: { value: Annotation[]; children: ReactNode }) {
  return <AnnotationsContext value={value}>{children}</AnnotationsContext>;
}

export function useAnnotations(): Annotation[] {
  return useContext(AnnotationsContext);
}
