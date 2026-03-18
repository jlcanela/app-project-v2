// Core pipeline atom definitions for Story 1.3
// -------------------------------------------------
// Writable atom with tagged PipelineAction — all pipeline mutations go
// through a single reducer so business logic lives in the atom layer.

import {
  EventBusTriggerConfig,
  FieldMapping,
  FieldsAdapter,
  HttpTriggerConfig,
  MergeAdapter,
  PassthroughAdapter,
  PipelineConfig,
  PipelineStepConfig,
  RequestOperationConfig,
  RuleOperationConfig,
  type AdapterConfig,
  type StepOperationConfig,
  type TriggerConfig,
} from '@app/domain';
import { Atom } from 'effect/unstable/reactivity';
import { defaultEventBusTrigger, defaultHttpTrigger, defaultPipeline } from '@/lib/defaults';

// ── Pipeline Action Types ──────────────────────────────────────────────────

export type PipelineAction =
  | { readonly _tag: 'Replace'; readonly pipeline: PipelineConfig }
  // Canvas operations
  | { readonly _tag: 'SetTrigger'; readonly trigger: TriggerConfig }
  | { readonly _tag: 'AddStep'; readonly step: PipelineStepConfig }
  | { readonly _tag: 'DeleteSteps'; readonly indices: ReadonlySet<number> }
  | { readonly _tag: 'ReorderSteps'; readonly order: readonly number[] }
  // Trigger config
  | { readonly _tag: 'ChangeTriggerType'; readonly type: 'http' | 'event_bus' }
  | { readonly _tag: 'UpdateTrigger'; readonly patch: Partial<TriggerConfig> }
  // Step config
  | {
      readonly _tag: 'UpdateStep';
      readonly index: number;
      readonly patch: Partial<Pick<PipelineStepConfig, 'name' | 'description'>>;
    }
  | {
      readonly _tag: 'UpdateStepOperation';
      readonly index: number;
      readonly patch: Partial<StepOperationConfig>;
    }
  | {
      readonly _tag: 'ChangeStepOperationType';
      readonly index: number;
      readonly type: 'Rule' | 'Request';
    }
  // Input adapter
  | {
      readonly _tag: 'ChangeInputAdapterType';
      readonly index: number;
      readonly kind: 'passthrough' | 'fields' | 'merge';
    }
  | { readonly _tag: 'AddInputMapping'; readonly index: number }
  | {
      readonly _tag: 'EditInputMapping';
      readonly stepIndex: number;
      readonly mappingIndex: number;
      readonly patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>;
    }
  | {
      readonly _tag: 'RemoveInputMapping';
      readonly stepIndex: number;
      readonly mappingIndex: number;
    }
  | {
      readonly _tag: 'ChangeInputMergeTargetKey';
      readonly index: number;
      readonly targetKey: string | undefined;
    }
  // Output adapter
  | {
      readonly _tag: 'ChangeOutputAdapterType';
      readonly index: number;
      readonly kind: 'passthrough' | 'fields' | 'merge' | 'none';
    }
  | { readonly _tag: 'AddOutputMapping'; readonly index: number }
  | {
      readonly _tag: 'EditOutputMapping';
      readonly stepIndex: number;
      readonly mappingIndex: number;
      readonly patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>;
    }
  | {
      readonly _tag: 'RemoveOutputMapping';
      readonly stepIndex: number;
      readonly mappingIndex: number;
    }
  | {
      readonly _tag: 'ChangeOutputMergeTargetKey';
      readonly index: number;
      readonly targetKey: string | undefined;
    }
  // Pipeline identity
  | {
      readonly _tag: 'UpdatePipelineIdentity';
      readonly patch: Partial<
        Pick<PipelineConfig, 'id' | 'name' | 'description' | 'enabled' | 'version'>
      >;
    };

/** Action constructors */
export const PipelineAction = {
  Replace: (pipeline: PipelineConfig): PipelineAction => ({ _tag: 'Replace', pipeline }),
  SetTrigger: (trigger: TriggerConfig): PipelineAction => ({ _tag: 'SetTrigger', trigger }),
  AddStep: (step: PipelineStepConfig): PipelineAction => ({ _tag: 'AddStep', step }),
  DeleteSteps: (indices: ReadonlySet<number>): PipelineAction => ({ _tag: 'DeleteSteps', indices }),
  ReorderSteps: (order: readonly number[]): PipelineAction => ({ _tag: 'ReorderSteps', order }),
  ChangeTriggerType: (type: 'http' | 'event_bus'): PipelineAction => ({
    _tag: 'ChangeTriggerType',
    type,
  }),
  UpdateTrigger: (patch: Partial<TriggerConfig>): PipelineAction => ({
    _tag: 'UpdateTrigger',
    patch,
  }),
  UpdateStep: (
    index: number,
    patch: Partial<Pick<PipelineStepConfig, 'name' | 'description'>>
  ): PipelineAction => ({ _tag: 'UpdateStep', index, patch }),
  UpdateStepOperation: (index: number, patch: Partial<StepOperationConfig>): PipelineAction => ({
    _tag: 'UpdateStepOperation',
    index,
    patch,
  }),
  ChangeStepOperationType: (index: number, type: 'Rule' | 'Request'): PipelineAction => ({
    _tag: 'ChangeStepOperationType',
    index,
    type,
  }),
  ChangeInputAdapterType: (
    index: number,
    kind: 'passthrough' | 'fields' | 'merge'
  ): PipelineAction => ({ _tag: 'ChangeInputAdapterType', index, kind }),
  AddInputMapping: (index: number): PipelineAction => ({ _tag: 'AddInputMapping', index }),
  EditInputMapping: (
    stepIndex: number,
    mappingIndex: number,
    patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
  ): PipelineAction => ({ _tag: 'EditInputMapping', stepIndex, mappingIndex, patch }),
  RemoveInputMapping: (stepIndex: number, mappingIndex: number): PipelineAction => ({
    _tag: 'RemoveInputMapping',
    stepIndex,
    mappingIndex,
  }),
  ChangeInputMergeTargetKey: (index: number, targetKey: string | undefined): PipelineAction => ({
    _tag: 'ChangeInputMergeTargetKey',
    index,
    targetKey,
  }),
  ChangeOutputAdapterType: (
    index: number,
    kind: 'passthrough' | 'fields' | 'merge' | 'none'
  ): PipelineAction => ({ _tag: 'ChangeOutputAdapterType', index, kind }),
  AddOutputMapping: (index: number): PipelineAction => ({ _tag: 'AddOutputMapping', index }),
  EditOutputMapping: (
    stepIndex: number,
    mappingIndex: number,
    patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
  ): PipelineAction => ({ _tag: 'EditOutputMapping', stepIndex, mappingIndex, patch }),
  RemoveOutputMapping: (stepIndex: number, mappingIndex: number): PipelineAction => ({
    _tag: 'RemoveOutputMapping',
    stepIndex,
    mappingIndex,
  }),
  ChangeOutputMergeTargetKey: (index: number, targetKey: string | undefined): PipelineAction => ({
    _tag: 'ChangeOutputMergeTargetKey',
    index,
    targetKey,
  }),
  UpdatePipelineIdentity: (
    patch: Partial<Pick<PipelineConfig, 'id' | 'name' | 'description' | 'enabled' | 'version'>>
  ): PipelineAction => ({ _tag: 'UpdatePipelineIdentity', patch }),
} as const;

// ── Reducer helpers ────────────────────────────────────────────────────────

function updateStepAt(
  prev: PipelineConfig,
  index: number,
  updater: (step: PipelineStepConfig) => PipelineStepConfig
): PipelineConfig {
  const step = prev.steps[index];
  if (!step) {
    return prev;
  }
  const steps = [...prev.steps];
  steps[index] = updater(step);
  return new PipelineConfig({ ...prev, steps });
}

function buildTrigger(trigger: TriggerConfig, patch: Partial<TriggerConfig>): TriggerConfig {
  if (trigger.type === 'http') {
    return new HttpTriggerConfig({
      type: 'http' as const,
      method: ('method' in patch ? patch.method : trigger.method) as HttpTriggerConfig['method'],
      path: ('path' in patch ? patch.path : trigger.path) as string,
      payloadSchemaRef:
        'payloadSchemaRef' in patch ? patch.payloadSchemaRef : trigger.payloadSchemaRef,
    });
  }
  return new EventBusTriggerConfig({
    type: 'event_bus' as const,
    channel: ('channel' in patch ? patch.channel : trigger.channel) as string,
    payloadSchemaRef:
      'payloadSchemaRef' in patch ? patch.payloadSchemaRef : trigger.payloadSchemaRef,
    filterExpression:
      'filterExpression' in patch ? patch.filterExpression : trigger.filterExpression,
  });
}

function buildAdapter(kind: 'passthrough' | 'fields' | 'merge'): AdapterConfig {
  switch (kind) {
    case 'passthrough':
      return new PassthroughAdapter({ kind: 'passthrough' });
    case 'fields':
      return new FieldsAdapter({ kind: 'fields', mappings: [] });
    case 'merge':
      return new MergeAdapter({ kind: 'merge' });
  }
}

function editMapping(
  mapping: FieldMapping,
  patch: Partial<Pick<FieldMapping, 'source' | 'target' | 'defaultValue'>>
): FieldMapping {
  return new FieldMapping({
    source: 'source' in patch ? (patch.source as string) : mapping.source,
    target: 'target' in patch ? (patch.target as string) : mapping.target,
    defaultValue: 'defaultValue' in patch ? patch.defaultValue : mapping.defaultValue,
  });
}

function updateMappings(
  step: PipelineStepConfig,
  target: 'input' | 'output',
  updater: (adapter: FieldsAdapter) => FieldsAdapter
): PipelineStepConfig {
  const adapter = target === 'input' ? step.inputAdapter : step.outputAdapter;
  if (!adapter || adapter.kind !== 'fields') {
    return step;
  }
  const updated = updater(adapter as FieldsAdapter);
  return target === 'input'
    ? new PipelineStepConfig({ ...step, inputAdapter: updated })
    : new PipelineStepConfig({ ...step, outputAdapter: updated });
}

// ── Reducer ────────────────────────────────────────────────────────────────

export function reducePipeline(prev: PipelineConfig, action: PipelineAction): PipelineConfig {
  switch (action._tag) {
    case 'Replace':
      return action.pipeline;

    case 'SetTrigger':
      return new PipelineConfig({ ...prev, trigger: action.trigger });

    case 'AddStep':
      return new PipelineConfig({ ...prev, steps: [...prev.steps, action.step] });

    case 'DeleteSteps':
      return new PipelineConfig({
        ...prev,
        steps: prev.steps.filter((_, i) => !action.indices.has(i)),
      });

    case 'ReorderSteps':
      return new PipelineConfig({
        ...prev,
        steps: action.order.map((i) => prev.steps[i]!),
      });

    case 'ChangeTriggerType':
      return new PipelineConfig({
        ...prev,
        trigger: action.type === 'http' ? defaultHttpTrigger : defaultEventBusTrigger,
      });

    case 'UpdateTrigger':
      return new PipelineConfig({ ...prev, trigger: buildTrigger(prev.trigger, action.patch) });

    case 'UpdateStep':
      return updateStepAt(
        prev,
        action.index,
        (step) =>
          new PipelineStepConfig({
            ...step,
            name: 'name' in action.patch ? (action.patch.name as string) : step.name,
            description:
              'description' in action.patch ? action.patch.description : step.description,
          })
      );

    case 'UpdateStepOperation': {
      return updateStepAt(prev, action.index, (step) => {
        const op = step.operation;
        let updatedOp: StepOperationConfig;
        if (op.type === 'Rule') {
          updatedOp = new RuleOperationConfig({
            type: 'Rule' as const,
            ruleName: ('ruleName' in action.patch ? action.patch.ruleName : op.ruleName) as string,
            ruleTypeRef: 'ruleTypeRef' in action.patch ? action.patch.ruleTypeRef : op.ruleTypeRef,
          });
        } else {
          updatedOp = new RequestOperationConfig({
            type: 'Request' as const,
            requestTag: ('requestTag' in action.patch
              ? action.patch.requestTag
              : op.requestTag) as string,
          });
        }
        return new PipelineStepConfig({ ...step, operation: updatedOp });
      });
    }

    case 'ChangeStepOperationType':
      return updateStepAt(prev, action.index, (step) => {
        const newOp: StepOperationConfig =
          action.type === 'Rule'
            ? new RuleOperationConfig({ type: 'Rule', ruleName: 'default-rule' })
            : new RequestOperationConfig({ type: 'Request', requestTag: 'DefaultRequest' });
        return new PipelineStepConfig({ ...step, operation: newOp });
      });

    case 'ChangeInputAdapterType':
      return updateStepAt(
        prev,
        action.index,
        (step) => new PipelineStepConfig({ ...step, inputAdapter: buildAdapter(action.kind) })
      );

    case 'AddInputMapping':
      return updateStepAt(prev, action.index, (step) =>
        updateMappings(
          step,
          'input',
          (adapter) =>
            new FieldsAdapter({
              kind: 'fields',
              mappings: [...adapter.mappings, new FieldMapping({ source: '', target: '' })],
            })
        )
      );

    case 'EditInputMapping':
      return updateStepAt(prev, action.stepIndex, (step) =>
        updateMappings(step, 'input', (adapter) => {
          const mapping = adapter.mappings[action.mappingIndex];
          if (!mapping) {
            return adapter;
          }
          const mappings = [...adapter.mappings];
          mappings[action.mappingIndex] = editMapping(mapping, action.patch);
          return new FieldsAdapter({ kind: 'fields', mappings });
        })
      );

    case 'RemoveInputMapping':
      return updateStepAt(prev, action.stepIndex, (step) =>
        updateMappings(
          step,
          'input',
          (adapter) =>
            new FieldsAdapter({
              kind: 'fields',
              mappings: adapter.mappings.filter((_, i) => i !== action.mappingIndex),
            })
        )
      );

    case 'ChangeInputMergeTargetKey':
      return updateStepAt(prev, action.index, (step) => {
        if (step.inputAdapter.kind !== 'merge') {
          return step;
        }
        return new PipelineStepConfig({
          ...step,
          inputAdapter: new MergeAdapter({ kind: 'merge', targetKey: action.targetKey }),
        });
      });

    case 'ChangeOutputAdapterType':
      return updateStepAt(prev, action.index, (step) => {
        const outputAdapter = action.kind === 'none' ? undefined : buildAdapter(action.kind);
        return new PipelineStepConfig({ ...step, outputAdapter });
      });

    case 'AddOutputMapping':
      return updateStepAt(prev, action.index, (step) =>
        updateMappings(
          step,
          'output',
          (adapter) =>
            new FieldsAdapter({
              kind: 'fields',
              mappings: [...adapter.mappings, new FieldMapping({ source: '', target: '' })],
            })
        )
      );

    case 'EditOutputMapping':
      return updateStepAt(prev, action.stepIndex, (step) =>
        updateMappings(step, 'output', (adapter) => {
          const mapping = adapter.mappings[action.mappingIndex];
          if (!mapping) {
            return adapter;
          }
          const mappings = [...adapter.mappings];
          mappings[action.mappingIndex] = editMapping(mapping, action.patch);
          return new FieldsAdapter({ kind: 'fields', mappings });
        })
      );

    case 'RemoveOutputMapping':
      return updateStepAt(prev, action.stepIndex, (step) =>
        updateMappings(
          step,
          'output',
          (adapter) =>
            new FieldsAdapter({
              kind: 'fields',
              mappings: adapter.mappings.filter((_, i) => i !== action.mappingIndex),
            })
        )
      );

    case 'ChangeOutputMergeTargetKey':
      return updateStepAt(prev, action.index, (step) => {
        if (step.outputAdapter?.kind !== 'merge') {
          return step;
        }
        return new PipelineStepConfig({
          ...step,
          outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: action.targetKey }),
        });
      });

    case 'UpdatePipelineIdentity':
      return new PipelineConfig({
        ...prev,
        id: 'id' in action.patch ? (action.patch.id as string) : prev.id,
        name: 'name' in action.patch ? (action.patch.name as string) : prev.name,
        description: 'description' in action.patch ? action.patch.description : prev.description,
        enabled: 'enabled' in action.patch ? action.patch.enabled : prev.enabled,
        version: 'version' in action.patch ? action.patch.version : prev.version,
      });
  }
}

// // ── Atom ────────────────────────────────────────────────────────────────────

const _pipeline = Atom.make<PipelineConfig>(defaultPipeline);

/**
 * Holds the current pipeline configuration. Accepts `PipelineAction`
 * values for writes — all mutation logic is centralised in `reducePipeline`.
 */
export const pipelineAtom = Atom.writable(
  (get: Atom.Context) => get(_pipeline),
  (ctx, action: PipelineAction) => {
    ctx.set(_pipeline, reducePipeline(ctx.get(_pipeline), action));
  }
);
