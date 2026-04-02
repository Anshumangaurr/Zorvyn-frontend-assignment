import React from 'react'

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={[
        'rounded-2xl bg-white/80 dark:bg-slate-950/60',
        'ring-1 ring-slate-200/70 dark:ring-white/10',
        'shadow-sm shadow-black/5 dark:shadow-none',
        'backdrop-blur supports-[backdrop-filter]:bg-white/60',
        className ?? '',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

