export function Skeleton({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={[
        'animate-pulse rounded-xl bg-slate-200/80 dark:bg-white/10',
        className ?? '',
      ].join(' ')}
    />
  )
}

