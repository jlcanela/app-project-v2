import { PipelineConfig } from '@app/domain';
import { useAtom, useAtomValue } from '@effect/atom-react';
import { createFileRoute } from '@tanstack/react-router';
import { AsyncResult } from 'effect/unstable/reactivity';
import { Box } from '@mantine/core';
import { Sidebar } from '@/components/Sidebar';
import { pipelinesAtom, selectedPipelineAtom, selectedPipelineIdAtom } from './(components)/atoms';
//import { PipelineDetail } from './(components)/PipelineDetail';
import GraphEditor from './(components)/GraphEditor';

import '@xyflow/react/dist/style.css';

export const Route = createFileRoute('/pipelines/')({
  component: RouteComponent,
});

function RouteComponent() {
  const [selectedPipelineId, setSelectedPipelineId] = useAtom(selectedPipelineIdAtom);
  const pipelinesResult = useAtomValue(pipelinesAtom) as AsyncResult.AsyncResult<PipelineConfig[]>;
  const selectedPipeline = useAtomValue(selectedPipelineAtom);

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Sidebar<PipelineConfig, string>
        title="Pipelines"
        allLabel="All Pipelines"
        selectedId={selectedPipelineId}
        onSelect={setSelectedPipelineId}
        onAdd={() => {}}
        items={pipelinesResult}
        getKey={(p: PipelineConfig) => p.id}
        getLabel={(p: PipelineConfig) => p.name}
      />
      {AsyncResult.match(selectedPipeline, {
        onInitial: () => null,
        onFailure: () => null,
        onSuccess: (success) =>
          success.value && (
            <Box style={{ flex: 1, overflow: 'hidden' }}>
              <GraphEditor value={success.value as PipelineConfig} />
            </Box>
          ),
      })}
    </Box>
  );
}
