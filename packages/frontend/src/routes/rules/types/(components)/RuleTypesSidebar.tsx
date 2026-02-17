import { Result, useAtomValue } from '@effect-atom/atom-react'
import { Box, Button, Group, NavLink, ScrollArea, Stack, Title } from '@mantine/core'
import { ruleTypesAtom } from './atoms'

import { graphql } from '@/graphql'
import { RuleTypeItemFragment } from '@/graphql/graphql'
import { Link } from '@tanstack/react-router'

export const RuleTypeItem = graphql(/* GraphQL */ `
  fragment RuleTypeItem on RuleTypesSelectItem {
    ruleTypeId
    name
    schemaIn
    schemaOut
  }
`)

interface RuleTypesSidebarProps {
  selectedRuleTypeId: number | null
  setSelectedRuleTypeId: (id: number | null) => void
  onAddRuleType: () => void
}

export function RuleTypesSidebar({
  setSelectedRuleTypeId,
  onAddRuleType,
}: RuleTypesSidebarProps) {
  const ruleTypes = useAtomValue(ruleTypesAtom) as Result.Result<RuleTypeItemFragment[]>

  return (
    <Box
      w={300}
      style={{
        borderRight: '1px solid var(--mantine-color-gray-3)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
        <Group justify="space-between">
          <Title order={4}>RuleTypes</Title>
          <Button size="xs" onClick={onAddRuleType}>
            + Add
          </Button>
        </Group>
      </Box>
      <ScrollArea style={{ flex: 1 }}>
        <Stack gap={0}>
          <NavLink
            label="All RuleTypes"
            activeOptions={ {exact: true} }
            activeProps={{
              style: {
                backgroundColor: 'var(--mantine-primary-color-light)',
                color: 'var(--mantine-primary-color-light-color)',
              },
            }}
            component={Link}
            onClick={() => setSelectedRuleTypeId(null)}
            variant="filled"
            to="/rules/types"
          />
          {Result.builder(ruleTypes).onSuccess((ruleTypes) => ruleTypes.map((ruleType) => (
            <NavLink
              key={ruleType.ruleTypeId}
              label={ruleType.name}
              activeProps={{
              style: {
                backgroundColor: 'var(--mantine-primary-color-light)',
                color: 'var(--mantine-primary-color-light-color)',
              },
            }}
              component={Link}
              to={`/rules/types/${ruleType.ruleTypeId}`}
              variant="filled"
            />
          ))).render()}
        </Stack>
      </ScrollArea>
    </Box>
  )
}