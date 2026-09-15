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
import readme from '../../../README.md?raw'
import { aiTools } from '@/lib/ai-tools'

const systemPrompt = `You are the AI assistant on Probir Sarkar's portfolio website.
Answer questions about Probir Sarkar only: his skills, projects, work experience, education, blog posts, and how to contact him.
Always use your tools (get_skills, get_projects, get_contact) to fetch accurate data before answering questions about his skills, projects, or contact details.
Guardrail: only discuss topics related to Probir Sarkar and his work. If asked about anything off-topic, politely decline and steer the conversation back to his portfolio.`

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId, runId } =
          await chatParamsFromRequest(request)
        const adapter = openRouterText('openai/gpt-oss-20b')
        console.log('messages', readme)

        const stream = chat({
          systemPrompts: [systemPrompt, readme],
          adapter: adapter,
          messages: messages,
          tools: aiTools,
          stream: true,
          middleware: [
            withCompaction({
              maxTokens: 20_000,
              strategy: evictOldest({ keepRecentTokens: 10000 }),
            }),
          ],
          modelOptions: {
            provider: {
              order: ['amazon-bedrock', 'groq'],
              allowFallbacks: true,
            },
          },
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
