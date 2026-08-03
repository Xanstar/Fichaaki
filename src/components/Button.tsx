import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'success' | 'danger' | 'ghost'
  isLoading?: boolean
  children: ReactNode
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brand hover:bg-brand-dark text-white shadow-sm shadow-brand/20',
  success: 'bg-success hover:bg-green-700 text-white shadow-sm shadow-success/25',
  danger: 'bg-danger hover:bg-red-700 text-white shadow-sm shadow-danger/20',
  ghost: 'bg-surface hover:bg-surface-muted text-ink border border-border-subtle',
}

export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold
        transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60
        focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2
        ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
