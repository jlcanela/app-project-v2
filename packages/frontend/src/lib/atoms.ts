import { Atom } from '@effect-atom/atom-react';
import { layer as webSdkLayer, type Configuration } from '@effect/opentelemetry/WebSdk';
import * as FetchHttpClient from '@effect/platform/FetchHttpClient';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-web';
import { Layer } from 'effect';
import { GraphQLClientService } from '@/graphql/execute';

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

export const runtime = Atom.runtime(
  GraphQLClientService.Default.pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.provide(SpansExporterLive)
  )
);
