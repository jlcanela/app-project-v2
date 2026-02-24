import { Layer } from 'effect';
import { FetchHttpClient } from 'effect/unstable/http';
import { Otlp, OtlpSerialization } from 'effect/unstable/observability';
import { Atom } from 'effect/unstable/reactivity';
import { GraphQLClientService } from '@/graphql/execute';

const Observability = Otlp.layer({
  baseUrl: 'http://localhost:4318', // OTLP HTTP endpoint of your collector
  resource: {
    serviceName: 'rule-studio-frontend', // service.name attribute
  },
}).pipe(Layer.provide(FetchHttpClient.layer), Layer.provide(OtlpSerialization.layerJson));

export const runtime = Atom.runtime(GraphQLClientService.layer.pipe(Layer.provide(Observability)));
