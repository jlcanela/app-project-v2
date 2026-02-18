import { Atom, Result } from '@effect-atom/atom-react';
// import * as Otlp from "@effect/opentelemetry/Otlp"
import { layer as webSdkLayer, type Configuration } from '@effect/opentelemetry/WebSdk';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { Effect, Layer } from 'effect';
import { executeGraphQL, GraphQLClientService } from '@/graphql/execute';
import { graphql } from '@/graphql/gql';

// import { type CreatePostMutationVariables } from '@/graphql/graphql'

const GetRuleTypesQuery = graphql(`
  query RulesType {
    ruleTypes(orderBy: { ruleTypeId: { direction: asc, priority: 1 } }) {
      ruleTypeId
      schemaIn
      schemaOut
      ...RuleTypeItem
      ...RuleTypeGeneralItem
      #...UserItem
      #...SelectedUserItem
      #...AuthorUserItem
    }
  }
`);

const baseUrl = 'http://localhost:5173/v1/traces';

const SpansExporterLive = webSdkLayer((): Configuration => {
  return {
    resource: {
      serviceName: 'rule-studio-frontend',
    },
    spanProcessor: new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: baseUrl,
      })
    ),
  };
});

const runtime = Atom.runtime(
  GraphQLClientService.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(SpansExporterLive)
  )
);

export const selectedRuleTypeIdAtom = Atom.make<number | null>(null);

export const ruleTypesAtom = runtime
  .atom(
    executeGraphQL(GetRuleTypesQuery).pipe(
      Effect.map((result) => result.data?.ruleTypes ?? []),
      Effect.tap(Effect.log)
    )
  )
  .pipe(Atom.withReactivity({ users: ['*'] }));

export const selectedRuleTypeAtom = Atom.make((get) => {
  const ruleTypesResult = get(ruleTypesAtom);
  const selectedId = get(selectedRuleTypeIdAtom);
  const result = Result.map(ruleTypesResult, (ruleTypes) =>
    ruleTypes.find((rt) => rt.ruleTypeId === selectedId)
  );
  return result;
});
