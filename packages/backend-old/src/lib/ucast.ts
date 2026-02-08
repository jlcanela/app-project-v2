import {
  FieldCondition,
  CompoundCondition,
  type Condition,
} from '@ucast/core';
import { MongoQuery } from '@ucast/mongo2js';

// OPA-style node
export type OpaFieldNode = {
  type: 'field';
  field: string;
  operator:
    | 'eq' | 'ne'
    | 'lt' | 'lte' | 'gt' | 'gte'
    | 'in' | 'nin'
    | 'contains'
    | 'startswith'
    | 'endswith';
  value: unknown;
};

export type OpaCompoundNode = {
  type: 'compound';
  operator: 'and' | 'or' | 'not';
  value: OpaNode[];
};

export type OpaNode = OpaFieldNode | OpaCompoundNode;

export function fromOpaNode(node: OpaNode): Condition<unknown> {

  if (node.type === 'field') {
    return new FieldCondition(node.operator, node.field, node.value);
  }

  const children = node.value.map(fromOpaNode);
  return new CompoundCondition(node.operator, children);
}

export const emptyCondition: Condition<unknown> =  new CompoundCondition("and", []);

export type UcastNode =
  | {
      type: 'field';
      field: string;
      operator: string;
      value: unknown;
    }
  | {
      type: 'compound';
      operator: 'and' | 'or' | 'not';
      value: UcastNode[];
    };


type AnyObject = Record<string, unknown>;
type AnyValue = AnyObject | unknown[];

const LOGICAL_OPERATORS = new Set(['$and', '$or', '$nor', '$not']);

export function prefixFields<T extends AnyObject>(
  query: MongoQuery<T>,
  prefix: string,
): MongoQuery<T> {
  if (!query || typeof query !== 'object') {
    return query;
  }

  const result: AnyObject = {};

  for (const [key, value] of Object.entries(query as AnyObject)) {
    // 1) Logical operators: recurse into their value
    if (LOGICAL_OPERATORS.has(key)) {
      if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          prefixFields(v as MongoQuery<T>, prefix),
        );
      } else if (value && typeof value === 'object') {
        result[key] = prefixFields(value as MongoQuery<T>, prefix);
      } else {
        result[key] = value;
      }
      continue;
    }

    // 2) Mongo operators at top level: keep key as-is, recurse
    if (key.startsWith('$')) {
      if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          typeof v === 'object' && v !== null
            ? prefixFields(v as MongoQuery<T>, prefix)
            : v,
        );
      } else if (value && typeof value === 'object') {
        result[key] = prefixFields(value as MongoQuery<T>, prefix);
      } else {
        result[key] = value;
      }
      continue;
    }

    // 3) Regular top-level field key: prefix it
    const newKey =
      key.startsWith(prefix) ? key : `${prefix}${key}`;

    // IMPORTANT: do NOT recurse into this value for field keys,
    // otherwise you'll prefix nested fields like "name" inside $elemMatch.
    result[newKey] = value;
  }

  return result as MongoQuery<T>;
}
