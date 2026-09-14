import { db } from './index'
import { chats } from './schema'
import { eq } from 'drizzle-orm'

export async function createChat(): Promise<string> {
  const id = crypto.randomUUID()
  await db.insert(chats).values({
    id,
    messages: '[]',
  })
  return id
}

export async function loadChat(
  id: string
): Promise<readonly unknown[]> {
  const result = await db
    .select()
    .from(chats)
    .where(eq(chats.id, id))
    .limit(1)

  if (result.length === 0) {
    return []
  }

  return JSON.parse(result[0].messages)
}

export async function saveChat({
  chatId,
  messages,
}: {
  chatId: string
  messages: unknown[]
}): Promise<void> {
  const result = await db
    .select()
    .from(chats)
    .where(eq(chats.id, chatId))
    .limit(1)

  if (result.length > 0) {
    await db
      .update(chats)
      .set({
        messages: JSON.stringify(messages),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(chats.id, chatId))
  } else {
    await db.insert(chats).values({
      id: chatId,
      messages: JSON.stringify(messages),
    })
  }
}
