// UI state atoms for Story 2.2 + 3.1 (selected node derivation)
import type { PipelineStepConfig, TriggerConfig } from '@app/domain';
import { Atom } from 'effect/unstable/reactivity';
import { pipelineAtom } from './pipeline';

/** Currently selected node ID on the canvas (null = nothing selected) */
export const selectedNodeIdAtom = Atom.make<string | null>(null);

/** Discriminated union describing what is currently selected */
export type SelectedNode =
  | { kind: 'trigger'; trigger: TriggerConfig }
  | { kind: 'step'; step: PipelineStepConfig; index: number }
  | null;

/**
 * Derives the selected node's data from selectedNodeIdAtom + pipelineAtom.
 * Used by ConfigPanel to decide which form to show.
 */
export const selectedNodeAtom = Atom.make((get: Atom.Context): SelectedNode => {
  const id = get(selectedNodeIdAtom);
  if (id === null) {
    return null;
  }

  const pipeline = get(pipelineAtom);

  if (id === 'trigger-0') {
    return { kind: 'trigger', trigger: pipeline.trigger };
  }

  const match = id.match(/^step-(\d+)$/);
  if (match) {
    const index = parseInt(match[1]!, 10);
    const step = pipeline.steps[index];
    if (step) {
      return { kind: 'step', step, index };
    }
  }

  return null;
});
