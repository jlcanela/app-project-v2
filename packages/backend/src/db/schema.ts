import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
//import { integer, serial, text, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const makeId = (name: string) => int(name).primaryKey({ autoIncrement: true })

export const users = sqliteTable('users', {
  id: makeId('id'), // serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const posts = sqliteTable('posts', {
  id: makeId('id'), // serial('id').primaryKey(),
  content: text('content').notNull(),
  authorId: int('author_id').notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

// Keep these in sync with your frontend types
export type InputSchemaField = {
  path: string;
  label: string;
  type: string;
  required?: boolean;
  allowedValues?: string[];
  description?: string;
};

export type OutputSchemaField = {
  id: string;
  label: string;
  type: string;
  allowedValues?: string[];
  description?: string;
  primary?: boolean;
};

export const ruleTypes = sqliteTable('rule_types', {
  ruleTypeId: makeId('ruleTypeId'),
  name: text('name').default(""),
  description: text('description').notNull(),

  // Schemas for the GoRules editor (JSON as TEXT with TS typing)
  schemaIn: text('schema_in').notNull(),
  schemaOut: text('schema_out').notNull(),
});

// // Rules (actual JDM content per type)
// export const rules = sqliteTable('rules', {
//   ruleId: makeId,
//   name: text('name').notNull(),

//   // Raw JDM JSON produced by the GoRules React editor
//   content: text('content', { mode: 'json' }).$type<unknown>().notNull(),

//   // Optional link to rule type
//   ruleTypeId: int('rule_type_id').references(() => ruleTypes.ruleTypeId),
// });

// // Tests for rules
// export const testRules = sqliteTable('test_rules', {
//   testRuleId: makeId,

//   ruleId: int('rule_id')
//     .notNull()
//     .references(() => rules.ruleId, { onDelete: 'cascade' }),

//   // Example input/output payloads
//   input: text('input', { mode: 'json' }).$type<unknown>().notNull(),
//   output: text('output', { mode: 'json' }).$type<unknown>().notNull(),
// });