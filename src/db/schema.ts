import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  messages: text('messages').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})
