// src/routes/api/verify.ts
import { createFileRoute } from '@tanstack/react-router'
import { env } from 'cloudflare:workers'
import { startChatSession } from '@/server/session'

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
    console.error('[verify] TURNSTILE_SECRET is not configured')
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
        '[verify] Turnstile verification failed:',
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
      console.error('[verify] Turnstile hostname mismatch:', result.hostname)
      return false
    }

    return true
  } catch {
    return false
  }
}

export const Route = createFileRoute('/api/verify')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown
        try {
          body = await request.json()
        } catch {
          return new Response('Bad Request', { status: 400 })
        }

        const payload =
          body && typeof body === 'object'
            ? (body as Record<string, unknown>)
            : {}
        const turnstileToken =
          typeof payload.turnstileToken === 'string'
            ? payload.turnstileToken
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

        await startChatSession()
        return new Response(null, { status: 204 })
      },
    },
  },
})
