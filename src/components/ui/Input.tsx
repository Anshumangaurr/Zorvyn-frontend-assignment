import React from 'react'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      className={[
        'h-10 w-full rounded-xl bg-white/70 dark:bg-slate-950/50',
        'ring-1 ring-slate-200/70 dark:ring-white/10',
        'px-3 text-sm text-slate-900 dark:text-slate-50',
        'placeholder:text-slate-400 dark:placeholder:text-slate-400',
        'focus:outline-none focus:ring-4 focus:ring-indigo-500/20',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        className ?? '',
      ].join(' ')}
      {...props}
    />
  )
}

