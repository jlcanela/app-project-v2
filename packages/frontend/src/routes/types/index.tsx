import { useAtom, useAtomValue } from '@effect/atom-react';
import { createFileRoute } from '@tanstack/react-router';
import { AsyncResult } from 'effect/unstable/reactivity';
import { Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from '@/components/Sidebar';
import { graphql } from '@/graphql';
import { RuleTypeItemFragment } from '@/graphql/graphql';
import { ruleTypesAtom, selectedRuleTypeAtom, selectedRuleTypeIdAtom } from './(components)/atoms';
import { RuleTypeDetail } from './(components)/RuleTypeDetail';

export const Route = createFileRoute('/types/')({
  component: RouteComponent,
});

export const RuleTypeItem = graphql(/* GraphQL */ `
  fragment RuleTypeItem on RuleTypesSelectItem {
    ruleTypeId
    name
    schemaIn
    schemaOut
  }
`);

function RouteComponent() {
  const [selectedRuleTypeId, setSelectedRuleTypeId] = useAtom(selectedRuleTypeIdAtom);
  const ruleTypes = useAtomValue(ruleTypesAtom) as AsyncResult.AsyncResult<RuleTypeItemFragment[]>;
  const selectedRuleType = useAtomValue(selectedRuleTypeAtom);

  // Modals
  const [, { open: openRuleTypeModal }] = useDisclosure(false);

  return (
    <Box style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Sidebar<RuleTypeItemFragment, number>
        title="Rule types"
        allLabel="All Rule Types"
        selectedId={selectedRuleTypeId}
        onSelect={setSelectedRuleTypeId}
        onAdd={openRuleTypeModal}
        items={ruleTypes}
        getKey={(u: RuleTypeItemFragment) => u.ruleTypeId}
        getLabel={(u: RuleTypeItemFragment) => u.name as string}
      />
      {AsyncResult.match(selectedRuleType, {
        onInitial: () => '',
        onFailure: () => '',
        onSuccess: (success) =>
          success.value && <RuleTypeDetail ruleType={success.value as RuleTypeItemFragment} />,
      })}
    </Box>
  );
}
