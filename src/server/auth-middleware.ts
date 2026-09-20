// src/server/auth-middleware.ts
import { createMiddleware } from '@tanstack/react-start'
import { hasChatSession } from './session'

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  if (!(await hasChatSession()))
    return Response.json(
      { error: 'Human verification required. Please try again.' },
      { status: 403 },
    )

  return next()
})
