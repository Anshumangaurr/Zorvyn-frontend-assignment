import React from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

function variantClasses(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return 'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-600 focus:ring-indigo-500/40'
    case 'secondary':
      return 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-900 focus:ring-slate-300/40 dark:bg-slate-200 dark:text-slate-950 dark:hover:bg-white dark:active:bg-slate-100'
    case 'ghost':
      return 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-400/40 dark:text-slate-200 dark:hover:bg-white/10 dark:active:bg-white/15'
    case 'danger':
      return 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-600 focus:ring-rose-400/40'
  }
}

function sizeClasses(size: ButtonSize) {
  switch (size) {
    case 'sm':
      return 'h-9 px-3 text-sm'
    case 'lg':
      return 'h-11 px-5 text-base'
    case 'md':
    default:
      return 'h-10 px-4 text-sm'
  }
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition',
        'ring-1 ring-transparent focus:outline-none focus:ring-4',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses(variant),
        sizeClasses(size),
        className ?? '',
      ].join(' ')}
      {...props}
    />
  )
}

