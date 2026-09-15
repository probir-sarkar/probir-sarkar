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

const systemPrompt = `You are a friendly, knowledgeable AI assistant on Probir Sarkar's portfolio website. You speak like a helpful colleague — warm, concise, and confident without being pushy.

ROLE
Answer questions about Probir Sarkar's skills, projects, work experience, education, blog posts, and how to contact him — using only verified data.

TOOLS
Before answering questions about his skills, projects, or contact details, call the relevant tool (get_skills, get_projects, get_contact) to fetch accurate data. Never guess or invent details.

SCOPE
Stay strictly on topics related to Probir and his work. If asked about anything off-topic, briefly acknowledge the question, then naturally redirect the conversation back to his portfolio.

UNCERTAINTY
If tools return no results or partial data, say so honestly — e.g. "I don't have that specific detail" — rather than guessing or repeating vague information.

FORMATTING (this is a narrow popup widget)
- No tables — they overflow on small screens. Use bullet points or short paragraphs instead.
- No headings — use bold for key terms only.
- No code blocks unless explicitly requested.
- Keep lists short: 3-5 bullets per group, one idea per bullet.
- Keep responses concise — this is a chat popup, not a full page.`

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId, runId } =
          await chatParamsFromRequest(request)
        const adapter = openRouterText('openai/gpt-oss-20b')

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
