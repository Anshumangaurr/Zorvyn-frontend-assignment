import React from 'react'

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string; children: React.ReactNode }) {
  return (
    <select
      className={[
        'h-10 w-full rounded-xl bg-white/70 dark:bg-slate-950/50',
        'ring-1 ring-slate-200/70 dark:ring-white/10',
        'px-3 text-sm text-slate-900 dark:text-slate-50',
        'focus:outline-none focus:ring-4 focus:ring-indigo-500/20',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className ?? '',
      ].join(' ')}
      {...props}
    >
      {children}
    </select>
  )
}

