'use client'
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { Bot, MessageSquare, Send, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const useChatInstance = () =>
  useChat({
    connection: fetchServerSentEvents('/api/chat'),
  })

export default function AiChat() {
  const [open, setOpen] = useState(false)
  const { messages, sendMessage, isLoading } = useChatInstance()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    void sendMessage(input.trim())
    setInput('')
  }

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
            className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border bg-primary px-4 py-3 text-secondary">
              <Bot className="size-5" />
              <div>
                <p className="text-sm font-semibold leading-tight">
                  AI Assistant
                </p>
                <p className="text-xs opacity-80">
                  Ask me anything about my work
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  Hi! I'm an AI assistant. Ask me about my projects, skills, or
                  anything else.
                </p>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                    message.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'mr-auto bg-muted text-foreground'
                  )}
                >
                  {message.parts.map((part, i) =>
                    part.type === 'text' ? <span key={i}>{part.content}</span> : null
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto flex items-center gap-1 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                  <span className="size-1.5 animate-bounce rounded-full bg-current" />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-border p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="h-10 flex-1 rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim() || isLoading}
                className="flex size-10 items-center justify-center rounded-xl bg-primary text-secondary transition-opacity disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
