'use client'
import { chatOptions } from '@/lib/chat-options'
import { cn } from '@/lib/utils'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { Turnstile } from '@marsidev/react-turnstile'
import type { ToolCallState } from '@tanstack/ai-client'
import {
  createChatHook,
  TextPart,
  type LayoutProps,
  type MessageProps,
  type QueueProps,
} from '@tanstack/ai-react/ui'
import {
  Bot,
  Check,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

function ToolActivity({
  label,
  state,
}: {
  label: string
  state: ToolCallState
}) {
  const done = state === 'complete'
  const failed = state === 'error'
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {failed ? (
        <X className="size-3.5" />
      ) : done ? (
        <Check className="size-3.5" />
      ) : (
        <Loader2 className="size-3.5 animate-spin" />
      )}
      <span>
        {failed
          ? `Couldn't load ${label}`
          : done
            ? `Loaded ${label}`
            : `Loading ${label}…`}
      </span>
    </div>
  )
}

function ChatMessage({ message, Parts }: MessageProps<typeof chatOptions>) {
  return (
    <div
      className={cn(
        'max-w-[85%] rounded-2xl px-3 py-2 group',
        message.role === 'user'
          ? 'ml-auto bg-primary  light'
          : 'mr-auto bg-muted dark',
      )}
    >
      <Parts />
    </div>
  )
}

function ChatLayout({
  Messages,
  Interrupts,
  Queue,
  Input,
}: LayoutProps<typeof chatOptions>) {
  const chat = useChatContext()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [chat.messages, chat.isLoading])

  return (
    <>
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {chat.messages.length === 0 && !chat.isLoading && (
          <p className="text-center text-sm text-muted-foreground">
            Hi! I'm an AI assistant. Ask me about my projects, skills, or
            anything else.
          </p>
        )}
        <Messages />
        <Interrupts />
        {chat.isLoading && (
          <div className="mr-auto flex items-center gap-1 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
            <span className="size-1.5 animate-bounce rounded-full bg-current" />
          </div>
        )}
        {chat.error && (
          <p className="text-center text-xs text-destructive">
            {chat.error.message}
          </p>
        )}
      </div>
      <Queue />
      <Input />
    </>
  )
}

function ChatInput() {
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const chat = useChatContext()
  const [value, setValue] = useState('')
  const [turnstile, setTurnstile] = useState<{
    token: string
    error: string
  }>({
    token: '',
    error: '',
  })

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!value.trim() || chat.isLoading || !turnstile.token) return
    void chat.sendMessage(value.trim(), {
      body: {
        turnstileToken: turnstile.token,
      },
    })
    setValue('')
    setTurnstile({ token: '', error: '' })
    turnstileRef.current?.reset()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-center gap-2 border-t border-border p-3"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message..."
        className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
      />
      <button
        type="submit"
        aria-label="Send message"
        disabled={!value.trim() || chat.isLoading}
        className="flex size-10 items-center justify-center rounded-xl bg-primary text-secondary transition-opacity disabled:opacity-40"
      >
        <Send className="size-4" />
      </button>
      {turnstile.error && (
        <p className="text-center text-xs text-destructive">
          {turnstile.error}
        </p>
      )}
      <div className="shrink-0 w-11/12 mx-auto">
        <Turnstile
          onSuccess={(token) => {
            setTurnstile({ token, error: '' })
          }}

          onError={() => {
            setTurnstile({
              token: '',
              error: "We couldn't verify you as a human. Please try again.",
            })
          }}

          onExpire={() => {
            setTurnstile({
              token: '',
              error: '',
            })
          }}
          options={{
            theme: 'dark',
            size: 'flexible',
            appearance: 'interaction-only',
            action: 'chat',
          }}
          ref={turnstileRef}
          siteKey="0x4AAAAAAE9e8lm-_CAJcAhd"
        />
      </div>
    </form>
  )
}

function ChatQueueItem({ item }: QueueProps<typeof chatOptions>) {
  const label =
    typeof item.content === 'string' ? item.content : 'Queued message'
  return (
    <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      <span className="flex-1 truncate">{label}</span>
      <button
        type="button"
        aria-label="Cancel queued message"
        onClick={() => item.cancelQueued()}
        className="rounded p-1 transition-colors hover:bg-muted"
      >
        <X className="size-3" />
      </button>
    </div>
  )
}

const { useAppChat, useChatContext } = createChatHook({
  options: chatOptions,
  components: {
    input: ChatInput,
    layout: ChatLayout,
    message: ChatMessage,
    queue: ChatQueueItem,
  },
  partsComponents: {
    text: ({ part }) => (
      <TextPart
        content={part.content}
        className={
          'prose prose-sm group-[.light]:prose-gray group-[.dark]:prose-invert'
        }
        components={{
          a: (props) => <a {...props} target="_blank" rel="noreferrer" />,
        }}
      />
    ),
    fallback: () => null,
  },
  toolsComponents: {
    get_skills: ({ part }) => (
      <ToolActivity label="skills" state={part.state} />
    ),
    get_projects: ({ part }) => (
      <ToolActivity label="projects" state={part.state} />
    ),
    get_contact: ({ part }) => (
      <ToolActivity label="contact details" state={part.state} />
    ),
  },
})

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const chat = useAppChat({ threadId: 'probir-sarkar' })

  return (
    <>
      <button
        type="button"
        aria-label="Open AI chat"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-secondary shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {open ? <X className="size-6" /> : <MessageSquare className="size-6" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-x-3 bottom-20 z-50 flex h-[70vh] max-h-[calc(100dvh-7rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-24 sm:w-95 sm:h-140"
          >
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-secondary">
              <Bot className="size-5" />
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">
                  AI Assistant
                </p>
                <p className="text-xs opacity-80">
                  Ask me anything about my work
                </p>
              </div>
              {chat.messages.length > 0 && (
                <button
                  type="button"
                  aria-label="Clear conversation"
                  onClick={() => chat.clear()}
                  disabled={chat.isLoading}
                  className="flex size-8 items-center justify-center rounded-lg transition-colors hover:bg-secondary/20 disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>

            <chat.AppChat />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
