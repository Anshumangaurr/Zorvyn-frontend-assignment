import React from 'react'

type BadgeTone = 'neutral' | 'success' | 'danger' | 'warning'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-100',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        'ring-1 ring-transparent',
        toneClasses[tone],
        className ?? '',
      ].join(' ')}
    >
      {children}
    </span>
  )
}

