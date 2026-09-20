import type { ToolCallState } from '@tanstack/ai-client'
import { Check, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ToolActivity({
  label,
  state,
}: {
  label: string
  state: ToolCallState
}) {
  const done = state === 'complete'
  const failed = state === 'error'

  return (
    <div
      className={cn(
        'flex w-full items-center gap-1.5 border-b py-1.5 text-xs font-medium',
        failed
          ? 'border-destructive/30 text-destructive'
          : 'border-border/60 text-muted-foreground',
      )}
    >
      {failed ? (
        <X className="size-3.5 shrink-0" />
      ) : done ? (
        <Check className="size-3.5 shrink-0 text-emerald-500" />
      ) : (
        <Loader2 className="size-3.5 shrink-0 animate-spin" />
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
