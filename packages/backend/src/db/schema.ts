import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
//import { integer, serial, text, pgTable } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

const makeId = int('id').primaryKey({ autoIncrement: true })

export const users = sqliteTable('users', {
  id: makeId, // serial('id').primaryKey(),
  name: text('name').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const posts = sqliteTable('posts', {
  id: makeId, // serial('id').primaryKey(),
  content: text('content').notNull(),
  authorId: int('author_id').notNull(),
});

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));
