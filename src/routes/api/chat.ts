// src/routes/api/chat.ts
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { createWorkersAiChat } from '@cloudflare/tanstack-ai'
import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { createChat, loadChat } from '#/db/chat-store'

const adapter = createWorkersAiChat('@cf/openai/gpt-oss-20b', {
  binding: env.AI,
})

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const threadId = url.searchParams.get('threadId')

        if (!threadId) {
          return new Response(JSON.stringify({ error: 'threadId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          })
        }

        const messages = await loadChat(threadId)
        return new Response(JSON.stringify({ messages }), {
          headers: { 'Content-Type': 'application/json' },
        })
      },
      POST: async ({ request }) => {
        const { messages, threadId } =
          await chatParamsFromRequest(request)

        const chatId = threadId || (await createChat())

        const stream = chat({
          adapter: adapter,
          messages: messages,
          stream: true,
          threadId: chatId,
        })

        return toServerSentEventsResponse(stream, {
          headers: {
            'Content-Type': 'text/x-unknown',
            'content-encoding': 'identity',
            'transfer-encoding': 'chunked',
          },
        })
      },
    },
  },
})
