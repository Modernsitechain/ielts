import type { TextRange } from "@/core/models/annotation";

// Turns the browser's text selection into character ranges within annotatable
// blocks (elements with data-block-id; see HighlightableText). A selection
// may span several blocks, e.g. two paragraphs.

export type SelectedText = { ranges: TextRange[] };

/** Characters from the start of `block` to (node, offset). */
function offsetWithin(block: HTMLElement, node: Node, offset: number): number {
  const before = document.createRange();
  before.selectNodeContents(block);
  before.setEnd(node, offset);
  return before.toString().length;
}

export function readSelection(root: HTMLElement): SelectedText | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const ranges: TextRange[] = [];
  for (const block of root.querySelectorAll<HTMLElement>("[data-block-id]")) {
    const blockId = block.dataset.blockId;
    if (!blockId || !range.intersectsNode(block)) continue;
    const start = block.contains(range.startContainer)
      ? offsetWithin(block, range.startContainer, range.startOffset)
      : 0;
    const end = block.contains(range.endContainer)
      ? offsetWithin(block, range.endContainer, range.endOffset)
      : (block.textContent ?? "").length;
    if (end > start) ranges.push({ blockId, start, end });
  }
  return ranges.length ? { ranges } : null;
}

export function clearSelection(): void {
  window.getSelection()?.removeAllRanges();
}

/** The highlight under the pointer (a <mark data-start> in a block), if any. */
export function highlightAt(target: EventTarget | null): { blockId: string; start: number } | null {
  if (!(target instanceof Element)) return null;
  const mark = target.closest<HTMLElement>("mark[data-start]");
  const blockId = mark?.closest<HTMLElement>("[data-block-id]")?.dataset.blockId;
  const start = Number(mark?.dataset.start);
  return blockId && Number.isInteger(start) ? { blockId, start } : null;
}
