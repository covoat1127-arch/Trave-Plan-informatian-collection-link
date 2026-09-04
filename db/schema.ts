import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at').notNull(),
  clientName: text('client_name').notNull(),
  contact: text('contact').notNull(),
  departure: text('departure').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  payloadJson: text('payload_json').notNull(),
  consent: integer('consent', { mode: 'boolean' }).notNull(),
  status: text('status').notNull().default('new'),
});
