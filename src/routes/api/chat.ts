// src/routes/api/chat.ts
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
// import { createWorkersAiChat } from '@cloudflare/tanstack-ai'
import { openRouterText } from '@tanstack/ai-openrouter'

import { createFileRoute } from '@tanstack/react-router'
import { evictOldest, withCompaction } from '@tanstack/ai-compaction'

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId, runId } =
          await chatParamsFromRequest(request)
        const adapter = openRouterText('openai/gpt-oss-20b')

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
