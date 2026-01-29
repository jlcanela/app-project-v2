import {
  CompoundCondition,
  FieldCondition,
  guard,
  MongoQuery,
} from '@ucast/mongo2js';
import { interpret } from '@ucast/js';
import { describe, it, expect } from 'vitest';
import {
  fromOpaNode,
  OpaFieldNode,
  OpaCompoundNode,
  prefixFields,
  emptyCondition,
} from './ucast.js';

// existing tests kept as‑is, then add:

describe('fromOpaNode', () => {
  it('converts a single field node', () => {
    const opa: OpaFieldNode = {
      type: 'field',
      field: 'owner',
      operator: 'eq',
      value: 'john',
    };

    const cond = fromOpaNode(opa);
    expect(cond).toBeInstanceOf(FieldCondition);
    expect(interpret(cond, { owner: 'john' })).toBe(true);
    expect(interpret(cond, { owner: 'jane' })).toBe(false);
  });

  it('converts a compound AND node with nested field nodes', () => {
    const opa: OpaCompoundNode = {
      type: 'compound',
      operator: 'and',
      value: [
        {
          type: 'field',
          field: 'age',
          operator: 'gte',
          value: 18,
        },
        {
          type: 'field',
          field: 'country',
          operator: 'eq',
          value: 'FR',
        },
      ],
    };

    const cond = fromOpaNode(opa);
    expect(cond).toBeInstanceOf(CompoundCondition);

    expect(interpret(cond, { age: 20, country: 'FR' })).toBe(true);
    expect(interpret(cond, { age: 17, country: 'FR' })).toBe(false);
    expect(interpret(cond, { age: 20, country: 'DE' })).toBe(false);
  });

  it('converts nested compound nodes (and/or)', () => {
    const opa: OpaCompoundNode = {
      type: 'compound',
      operator: 'and',
      value: [
        {
          type: 'field',
          field: 'kind',
          operator: 'eq',
          value: 'project',
        },
        {
          type: 'compound',
          operator: 'or',
          value: [
            {
              type: 'field',
              field: 'status',
              operator: 'eq',
              value: 'OPEN',
            },
            {
              type: 'field',
              field: 'status',
              operator: 'eq',
              value: 'PENDING',
            },
          ],
        },
      ],
    };

    const cond = fromOpaNode(opa);

    expect(interpret(cond, { kind: 'project', status: 'OPEN' })).toBe(true);
    expect(interpret(cond, { kind: 'project', status: 'PENDING' })).toBe(true);
    expect(interpret(cond, { kind: 'project', status: 'CLOSED' })).toBe(false);
    expect(interpret(cond, { kind: 'task', status: 'OPEN' })).toBe(false);
  });

  it('emptyCondition behaves like always-true AND with no children', () => {
    const data = { any: 'thing' };
    expect(interpret(emptyCondition, data)).toBe(true);
  });
});

describe('prefixFields', () => {
  it('returns non-object query as-is', () => {
    // @ts-expect-error intentional non-object
    expect(prefixFields(null, 'p.')).toBeNull();
    // @ts-expect-error intentional primitive
    expect(prefixFields(42 as unknown as MongoQuery<unknown>, 'p.')).toBe(42);
  });

  it('prefixes top-level field keys once', () => {
    const query = { name: 'Old Project', owner: 'John' };
    const prefixed = prefixFields(query, 'project.');

    expect(prefixed).toEqual({
      'project.name': 'Old Project',
      'project.owner': 'John',
    });
  });

  it('does not double-prefix fields that already have the prefix', () => {
    const query = {
      'project.name': 'Old Project',
      owner: 'John',
    };
    const prefixed = prefixFields(query, 'project.');

    expect(prefixed).toEqual({
      'project.name': 'Old Project',
      'project.owner': 'John',
    });
  });

  it('recurses into logical operators ($and / $or / $not)', () => {
    const query: MongoQuery<any> = {
      $and: [
        { name: 'Old Project' },
        { $or: [{ owner: 'John' }, { owner: 'Jane' }] },
      ],
    };

    const prefixed = prefixFields(query, 'project.');

    expect(prefixed).toEqual({
      $and: [
        { 'project.name': 'Old Project' },
        {
          $or: [
            { 'project.owner': 'John' },
            { 'project.owner': 'Jane' },
          ],
        },
      ],
    });
  });

  it('recurses into generic $ operators but keeps their key', () => {
    const query: MongoQuery<any> = {
      $expr: {
        $and: [{ $gt: ['$budget', 0] }, { $lt: ['$budget', 1000] }],
      },
    };

    const prefixed = prefixFields(query, 'project.');

    // $expr should stay, nested objects should be processed
    expect(prefixed).toEqual({
      $expr: {
        $and: [{ $gt: ['$budget', 0] }, { $lt: ['$budget', 1000] }],
      },
    });
  });

  it('handles array values of $ operators (e.g. $or, $and)', () => {
    const query: MongoQuery<any> = {
      $or: [{ name: 'A' }, { name: 'B' }],
    };

    const prefixed = prefixFields(query, 'project.');

    expect(prefixed).toEqual({
      $or: [{ 'project.name': 'A' }, { 'project.name': 'B' }],
    });
  });

  it('does not recurse into field values (no double prefix in nested objects)', () => {
    const query: MongoQuery<any> = {
      project: {
        name: 'Nested',
        // simulate something like $elemMatch or nested doc
        details: { owner: 'John' },
      },
    };

    const prefixed = prefixFields(query, 'project.');

    // only the top-level key is prefixed
    expect(prefixed).toEqual({
      'project.project': {
        name: 'Nested',
        details: { owner: 'John' },
      },
    });
  });

  it('handles mixed logical and field keys', () => {
    const query: MongoQuery<any> = {
      name: 'X',
      $and: [{ owner: 'John' }, { status: 'OPEN' }],
    };

    const prefixed = prefixFields(query, 'project.');

    expect(prefixed).toEqual({
      'project.name': 'X',
      $and: [
        { 'project.owner': 'John' },
        { 'project.status': 'OPEN' },
      ],
    });
  });
});

