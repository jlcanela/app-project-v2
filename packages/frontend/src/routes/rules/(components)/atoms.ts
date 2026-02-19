// import { Atom } from "@effect-atom/atom-react";

import { Atom, Result } from '@effect-atom/atom-react';
import { Effect, Option } from 'effect';
import { graphql } from '@/graphql';
import { executeGraphQL } from '@/graphql/execute';
import { CreateRuleMutationVariables } from '@/graphql/graphql';
import { runtime } from '@/lib/atoms';

const GetRulesQuery = graphql(`
  query RuleInstancesItem {
    ruleInstances(orderBy: { ruleId: { direction: asc, priority: 1 } }) {
      ruleId
      name
      ...RuleDetailItem
    }
  }
`);

export const rulesAtom = runtime
  .atom(
    executeGraphQL(GetRulesQuery).pipe(Effect.map((result) => result.data?.ruleInstances ?? []))
  )
  .pipe(Atom.withReactivity({ rules: ['*'] }));

export const selectedRuleIdAtom = Atom.make<number | null>(null);

export const selectedRuleAtom = Atom.make((get) => {
  const rulesResult = get(rulesAtom);
  const selectedId = get(selectedRuleIdAtom);
  return Result.map(rulesResult, (rules) =>
    Option.fromNullable(rules.find((u) => u.ruleId === selectedId))
  );
});

const CreateRuleMutation = graphql(`
  mutation CreateRule($name: String!, $description: String!, $content: String!) {
    insertIntoRuleInstancesSingle(
      values: { name: $name, description: $description, content: $content }
    ) {
      ruleId
      name
      description
      content
    }
  }
`);

export const createRule = Effect.fn(function* (variables: CreateRuleMutationVariables) {
  return yield* executeGraphQL(CreateRuleMutation, variables);
});

export const createRuleAtom = runtime.fn(createRule, { reactivityKeys: { rules: ['*'] } });
