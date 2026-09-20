import { fetchServerSentEvents, sessionStoragePersistence } from '@tanstack/ai-react'

// `as const` keeps the tools a tuple so each tool name stays literal
// for createChatHook's toolsComponents typing.
export const chatOptions = {
  connection: fetchServerSentEvents('/api/chat'),
  persistence: sessionStoragePersistence(),
} as const
