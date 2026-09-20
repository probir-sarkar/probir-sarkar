// src/routes/api/chat.ts
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'

import { openRouterText } from '@tanstack/ai-openrouter'

import { createFileRoute } from '@tanstack/react-router'
import { evictOldest, withCompaction } from '@tanstack/ai-compaction'
import readme from '../../../README.md?raw'
import { aiTools } from '@/lib/ai-tools'
import { env } from 'cloudflare:workers'

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

const TURNSTILE_ACTION = 'chat'

interface TurnstileVerifyResult {
  success: boolean
  action?: string
  hostname?: string
  'error-codes'?: Array<string>
}

async function verifyTurnstileToken(
  token: string | undefined,
  ip: string | null,
): Promise<boolean> {
  if (!token || token.length > 2048) return false

  const secret = env.TURNSTILE_SECRET
  if (!secret) {
    console.error('[chat] TURNSTILE_SECRET is not configured')
    return false
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })
  if (ip) body.set('remoteip', ip)

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(10_000),
        body,
      },
    )
    if (!response.ok) return false

    const result = await response.json<TurnstileVerifyResult>()
    if (!result.success) {
      console.error(
        '[chat] Turnstile verification failed:',
        result['error-codes']?.join(', '),
      )
      return false
    }
    if (result.action !== TURNSTILE_ACTION) return false

    const allowedHostnames = env.TURNSTILE_HOSTNAMES?.split(',')
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean)
    if (
      allowedHostnames &&
      allowedHostnames.length > 0 &&
      result.hostname &&
      !allowedHostnames.includes(result.hostname.toLowerCase())
    ) {
      console.error('[chat] Turnstile hostname mismatch:', result.hostname)
      return false
    }

    return true
  } catch {
    return false
  }
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let params: Awaited<ReturnType<typeof chatParamsFromRequest>>
        try {
          params = await chatParamsFromRequest(request)
        } catch {
          return new Response('Bad Request', { status: 400 })
        }
        const { messages, forwardedProps } = params
        const turnstileToken =
          typeof forwardedProps?.turnstileToken === 'string'
            ? forwardedProps.turnstileToken
            : undefined
        const verified = await verifyTurnstileToken(
          turnstileToken,
          request.headers.get('cf-connecting-ip') ??
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            null,
        )
        if (!verified)
          return new Response(
            JSON.stringify({
              error:
                'Human verification failed. Please complete the challenge and try again.',
            }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            },
          )
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
