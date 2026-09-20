import type { PartProps } from '@tanstack/ai-react/ui'
import { Brain, ChevronRight } from 'lucide-react'
import { chatOptions } from '@/lib/chat-options'

export function ThinkingPart({
  part,
}: PartProps<typeof chatOptions, 'thinking'>) {
  return (
    <details className="group/thinking w-full border-b border-border/60">
      <summary className="flex w-full cursor-pointer select-none list-none items-center gap-1.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-3.5 shrink-0 transition-transform duration-200 group-open/thinking:rotate-90" />
        <Brain className="size-3.5 shrink-0" />
        <span>Thinking</span>
      </summary>

      <div className="pb-2 pl-6">
        <p className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
          {part.content}
        </p>
      </div>
    </details>
  )
}
