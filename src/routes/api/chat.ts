// src/routes/api/chat.ts
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { createWorkersAiChat } from '@cloudflare/tanstack-ai'
import { env } from 'cloudflare:workers'
import { createFileRoute } from '@tanstack/react-router'
import { evictOldest, withCompaction } from '@tanstack/ai-compaction'
const adapter = createWorkersAiChat('@cf/openai/gpt-oss-20b', {
  binding: env.AI,
})

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId, runId } =
          await chatParamsFromRequest(request)

        const stream = chat({
          adapter: adapter,
          messages: messages,
          stream: true,
          middleware: [
            withCompaction({
              maxTokens: 10_000,
              strategy: evictOldest({ keepRecentTokens: 4000 }),
            }),
          ],
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
