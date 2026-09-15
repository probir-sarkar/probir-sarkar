import { fetchServerSentEvents, indexedDBPersistence } from '@tanstack/ai-react'
import {
  getContactDefinition,
  getProjectsDefinition,
  getSkillsDefinition,
} from './chat-tools'

// `as const` keeps the tools a tuple so each tool name stays literal
// for createChatHook's toolsComponents typing.
export const chatOptions = {
  connection: fetchServerSentEvents('/api/chat'),
  persistence: indexedDBPersistence(),
  tools: [
    getSkillsDefinition.client(),
    getProjectsDefinition.client(),
    getContactDefinition.client(),
  ],
} as const
