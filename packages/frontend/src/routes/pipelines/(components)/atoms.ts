import { PipelineConfig } from '@app/domain';
import { AsyncResult, Atom } from 'effect/unstable/reactivity';
import { pipelines } from '@/lib/pipelineConfig';

// ---------------------------------------------------------------------------
// Pipeline atoms — static data wrapped in AsyncResult for Sidebar compat
// ---------------------------------------------------------------------------

/** Currently selected pipeline id (null = show all / none selected). */
export const selectedPipelineIdAtom = Atom.make<string | null>(null);

/** All pipelines as an AsyncResult (wraps static data for Sidebar compatibility). */
export const pipelinesAtom = Atom.make<AsyncResult.AsyncResult<PipelineConfig[]>>(
  AsyncResult.success(pipelines)
);

/** Derived: the currently selected pipeline, if any. */
export const selectedPipelineAtom = Atom.make((get) => {
  const pipelinesResult = get(pipelinesAtom);
  const selectedId = get(selectedPipelineIdAtom);
  return AsyncResult.map(pipelinesResult, (items) => items.find((p) => p.id === selectedId));
});
