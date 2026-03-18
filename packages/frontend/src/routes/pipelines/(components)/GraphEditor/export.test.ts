// Story 7.1 — JSON Download tests
// Story 7.4 — JSON Upload tests
// Tests for pipeline encoding, decoding, and round-trip verification.
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
} from '@app/domain';
import { Schema } from 'effect';
import { describe, expect, it } from 'vitest';
import { defaultPipeline } from '@/lib/defaults';
import { decodePipeline, encodePipeline } from './export';

describe('Story 7.1 — JSON Download (Pipeline Export)', () => {
  it('encodePipeline produces a plain JSON object from PipelineConfig', () => {
    const encoded = encodePipeline(defaultPipeline);
    expect(encoded).toBeDefined();
    expect(typeof encoded).toBe('object');
    // Should have top-level fields
    const obj = encoded as Record<string, unknown>;
    expect(obj.id).toBe('default-pipeline');
    expect(obj.name).toBe('Default Pipeline');
  });

  it('encoded JSON is serializable to string', () => {
    const encoded = encodePipeline(defaultPipeline);
    const json = JSON.stringify(encoded);
    expect(json).toBeTruthy();
    expect(typeof json).toBe('string');
  });

  it('encoded JSON round-trips through Schema.decodeSync (NFR6)', () => {
    const encoded = encodePipeline(defaultPipeline);
    const json = JSON.stringify(encoded);
    const parsed = JSON.parse(json);
    const decoded = Schema.decodeSync(PipelineConfig)(parsed);
    expect(decoded).toBeInstanceOf(PipelineConfig);
    expect(decoded.id).toBe(defaultPipeline.id);
    expect(decoded.name).toBe(defaultPipeline.name);
    expect(decoded.trigger.type).toBe(defaultPipeline.trigger.type);
  });

  it('complex pipeline with steps encodes and round-trips correctly', () => {
    const pipeline = new PipelineConfig({
      id: 'complex-pipeline',
      name: 'Complex Pipeline',
      description: 'A complex pipeline for testing export',
      trigger: new EventBusTriggerConfig({
        type: 'event_bus',
        channel: 'orders.events',
        filterExpression: '_tag == "OrderCreated"',
      }),
      steps: [
        new PipelineStepConfig({
          name: 'validateOrder',
          description: 'Validate the order',
          operation: new RuleOperationConfig({
            type: 'Rule',
            ruleName: 'validate-order',
            ruleTypeRef: 'OrderValidation',
          }),
          inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
          outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'validation' }),
        }),
        new PipelineStepConfig({
          name: 'processPayment',
          operation: new RequestOperationConfig({
            type: 'Request',
            requestTag: 'ProcessPayment',
          }),
          inputAdapter: new FieldsAdapter({
            kind: 'fields',
            mappings: [
              new FieldMapping({ source: 'order.total', target: 'amount', defaultValue: 0 }),
              new FieldMapping({ source: 'order.currency', target: 'currency' }),
            ],
          }),
        }),
      ],
      enabled: true,
      version: 3,
    });

    const encoded = encodePipeline(pipeline);
    const json = JSON.stringify(encoded);
    const parsed = JSON.parse(json);

    // Round-trip decode
    const decoded = Schema.decodeSync(PipelineConfig)(parsed);
    expect(decoded.id).toBe('complex-pipeline');
    expect(decoded.steps).toHaveLength(2);
    expect(decoded.steps[0]!.name).toBe('validateOrder');
    expect(decoded.steps[0]!.operation.type).toBe('Rule');
    expect(decoded.steps[0]!.outputAdapter?.kind).toBe('merge');
    expect(decoded.steps[1]!.name).toBe('processPayment');
    expect(decoded.steps[1]!.inputAdapter.kind).toBe('fields');
    expect((decoded.steps[1]!.inputAdapter as FieldsAdapter).mappings).toHaveLength(2);
    expect(decoded.trigger.type).toBe('event_bus');
    expect(decoded.enabled).toBe(true);
    expect(decoded.version).toBe(3);
  });

  it('encoded JSON includes _tag discriminators for tagged classes', () => {
    const encoded = encodePipeline(defaultPipeline) as Record<string, unknown>;
    const trigger = encoded.trigger as Record<string, unknown>;
    expect(trigger._tag).toBe('HttpTriggerConfig');
  });

  it('encoding a pipeline with no optional fields omits them', () => {
    const minimal = new PipelineConfig({
      id: 'minimal',
      name: 'Minimal',
      trigger: new HttpTriggerConfig({ type: 'http', method: 'GET', path: '/' }),
      steps: [],
    });
    const encoded = encodePipeline(minimal) as Record<string, unknown>;
    expect(encoded.id).toBe('minimal');
    expect(encoded.description).toBeUndefined();
    expect(encoded.enabled).toBeUndefined();
    expect(encoded.version).toBeUndefined();
  });
});

describe('Story 7.4 — JSON Upload (Pipeline Import)', () => {
  it('decodePipeline converts valid JSON to PipelineConfig instance', () => {
    const encoded = encodePipeline(defaultPipeline);
    const decoded = decodePipeline(encoded);
    expect(decoded).toBeInstanceOf(PipelineConfig);
    expect(decoded.id).toBe(defaultPipeline.id);
    expect(decoded.name).toBe(defaultPipeline.name);
  });

  it('decodePipeline restores a complex pipeline from JSON', () => {
    const pipeline = new PipelineConfig({
      id: 'uploaded-pipeline',
      name: 'Uploaded Pipeline',
      description: 'Imported from file',
      trigger: new EventBusTriggerConfig({
        type: 'event_bus',
        channel: 'orders.events',
        filterExpression: '_tag == "OrderCreated"',
      }),
      steps: [
        new PipelineStepConfig({
          name: 'step1',
          operation: new RuleOperationConfig({ type: 'Rule', ruleName: 'r1' }),
          inputAdapter: new FieldsAdapter({
            kind: 'fields',
            mappings: [new FieldMapping({ source: 'a', target: 'b', defaultValue: 'x' })],
          }),
          outputAdapter: new MergeAdapter({ kind: 'merge', targetKey: 'out' }),
        }),
      ],
      enabled: false,
      version: 5,
    });

    const json = JSON.parse(JSON.stringify(encodePipeline(pipeline)));
    const decoded = decodePipeline(json);

    expect(decoded).toBeInstanceOf(PipelineConfig);
    expect(decoded.id).toBe('uploaded-pipeline');
    expect(decoded.description).toBe('Imported from file');
    expect(decoded.trigger.type).toBe('event_bus');
    expect(decoded.steps).toHaveLength(1);
    expect(decoded.steps[0]!.inputAdapter.kind).toBe('fields');
    expect(decoded.steps[0]!.outputAdapter?.kind).toBe('merge');
    expect(decoded.enabled).toBe(false);
    expect(decoded.version).toBe(5);
  });

  it('decodePipeline throws on empty object', () => {
    expect(() => decodePipeline({})).toThrow();
  });

  it('decodePipeline throws on null input', () => {
    expect(() => decodePipeline(null)).toThrow();
  });

  it('decodePipeline throws on invalid JSON structure', () => {
    expect(() => decodePipeline({ id: 123, name: true })).toThrow();
  });

  it('full round-trip: encode → serialize → parse → decode preserves pipeline', () => {
    const original = new PipelineConfig({
      id: 'roundtrip-test',
      name: 'Round Trip',
      trigger: new HttpTriggerConfig({ type: 'http', method: 'PUT', path: '/api/test' }),
      steps: [
        new PipelineStepConfig({
          name: 'requestStep',
          operation: new RequestOperationConfig({ type: 'Request', requestTag: 'MyService' }),
          inputAdapter: new PassthroughAdapter({ kind: 'passthrough' }),
        }),
      ],
      enabled: true,
      version: 42,
    });

    // Simulate file download → upload cycle
    const jsonString = JSON.stringify(encodePipeline(original), null, 2);
    const parsed = JSON.parse(jsonString);
    const restored = decodePipeline(parsed);

    expect(restored).toBeInstanceOf(PipelineConfig);
    expect(restored.id).toBe('roundtrip-test');
    expect(restored.name).toBe('Round Trip');
    expect(restored.trigger.type).toBe('http');
    expect(restored.steps[0]!.operation.type).toBe('Request');
    expect(restored.version).toBe(42);
  });
});
