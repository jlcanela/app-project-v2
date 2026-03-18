// ConfigPanel — Story 3.1 + 3.2 + 3.4 (type switching) + Story 4.1–4.4 (step & operation config) + Story 5.1–5.4 (adapters) + Story 6.1 (pipeline identity)
// Right sidebar that shows the configuration form for the selected node.
import type { PipelineConfig } from '@app/domain';
import { Paper, ScrollArea } from '@mantine/core';
import { PipelineAction, type PipelineAction as PipelineActionType } from '../atoms/pipeline';
import type { SelectedNode } from '../pipeline-selectors';
import { PipelineIdentityForm } from './PipelineIdentityForm';
import { StepForm } from './StepForm';
import { TriggerForm } from './TriggerForm';

export interface ConfigPanelProps {
  pipeline: PipelineConfig;
  selection: SelectedNode;
  dispatch: (action: PipelineActionType) => void;
}

export function ConfigPanel({ pipeline, selection, dispatch }: ConfigPanelProps) {
  const node = selection;

  // Handler functions have been inlined directly in JSX props.

  return (
    <ScrollArea h="100%" data-testid="config-panel">
      <Paper p="md" style={{ minHeight: '100%' }}>
        {node === null && (
          <PipelineIdentityForm
            pipeline={pipeline}
            onUpdate={(patch) => dispatch(PipelineAction.UpdatePipelineIdentity(patch))}
          />
        )}
        {node?.kind === 'trigger' && (
          <TriggerForm
            trigger={node.trigger}
            onUpdate={(patch) => dispatch(PipelineAction.UpdateTrigger(patch))}
            onTypeChange={(type) => dispatch(PipelineAction.ChangeTriggerType(type))}
          />
        )}
        {node?.kind === 'step' && (
          <StepForm
            step={node.step}
            index={node.index}
            onUpdate={(patch) => dispatch(PipelineAction.UpdateStep(node.index, patch))}
            onOperationUpdate={(patch) =>
              dispatch(PipelineAction.UpdateStepOperation(node.index, patch))
            }
            onOperationTypeChange={(type) =>
              dispatch(PipelineAction.ChangeStepOperationType(node.index, type))
            }
            onInputAdapterTypeChange={(kind) =>
              dispatch(PipelineAction.ChangeInputAdapterType(node.index, kind))
            }
            onInputMappingAdd={() => dispatch(PipelineAction.AddInputMapping(node.index))}
            onInputMappingEdit={(i, patch) =>
              dispatch(PipelineAction.EditInputMapping(node.index, i, patch))
            }
            onInputMappingRemove={(i) => dispatch(PipelineAction.RemoveInputMapping(node.index, i))}
            onInputMergeTargetKeyChange={(key) =>
              dispatch(PipelineAction.ChangeInputMergeTargetKey(node.index, key))
            }
            onOutputAdapterTypeChange={(kind) =>
              dispatch(PipelineAction.ChangeOutputAdapterType(node.index, kind))
            }
            onOutputMappingAdd={() => dispatch(PipelineAction.AddOutputMapping(node.index))}
            onOutputMappingEdit={(i, patch) =>
              dispatch(PipelineAction.EditOutputMapping(node.index, i, patch))
            }
            onOutputMappingRemove={(i) =>
              dispatch(PipelineAction.RemoveOutputMapping(node.index, i))
            }
            onOutputMergeTargetKeyChange={(key) =>
              dispatch(PipelineAction.ChangeOutputMergeTargetKey(node.index, key))
            }
          />
        )}
      </Paper>
    </ScrollArea>
  );
}
