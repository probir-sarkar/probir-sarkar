import {
  getRequestHeader,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'

const SESSION_COOKIE = '__Host-chat_session'
const SESSION_TTL = 60 * 60

function readSessionId(): string | null {
  const header = getRequestHeader('cookie')
  if (!header) return null
  for (const part of header.split(/;\s*/)) {
    // Split on the FIRST '=' only — cookie values may contain '='.
    const separator = part.indexOf('=')
    if (separator === -1) continue
    if (part.slice(0, separator) === SESSION_COOKIE)
      return part.slice(separator + 1)
  }
  return null
}

export async function hasChatSession(): Promise<boolean> {
  const id = readSessionId()
  if (!id) return false
  return (await env.CHAT_SESSIONS.get(id)) !== null
}

export async function startChatSession(): Promise<void> {
  const id = crypto.randomUUID()
  await env.CHAT_SESSIONS.put(id, '1', { expirationTtl: SESSION_TTL })

  setResponseHeader(
    'Set-Cookie',
    [
      `${SESSION_COOKIE}=${id}`,
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${SESSION_TTL}`,
    ].join('; '),
  )
}
