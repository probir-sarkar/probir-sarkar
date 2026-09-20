// src/server/session.ts
import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'

const SESSION_COOKIE = '__Host-chat_session'
const SESSION_TTL = 60 * 60

export function readSessionToken(): string | null {
  const header = getRequestHeader('cookie')
  if (!header) return null
  for (const part of header.split(/;\s*/)) {
    // Split on the FIRST '=' only — cookie values may contain '='.
    const eq = part.indexOf('=')
    if (eq === -1) continue
    if (part.slice(0, eq) === SESSION_COOKIE) return part.slice(eq + 1)
  }
  return null
}

export function setSessionCookie(token: string): void {
  setResponseHeader(
    'Set-Cookie',
    [
      `${SESSION_COOKIE}=${token}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${SESSION_TTL}`,
    ].join('; '),
  )
}

export async function hasChatSession(): Promise<boolean> {
  const token = readSessionToken()
  if (!token) return false
  return (await env.CHAT_SESSIONS.get(token)) !== null
}

export async function startChatSession(): Promise<void> {
  const token = crypto.randomUUID()
  await env.CHAT_SESSIONS.put(token, '1', { expirationTtl: SESSION_TTL })
  setSessionCookie(token)
}
