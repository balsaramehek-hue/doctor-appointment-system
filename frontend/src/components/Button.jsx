import { FaSpinner } from 'react-icons/fa'

/**
 * Consistent button that maintains size during loading.
 * Keeps children in the layout (invisible) and overlays a spinner.
 */
export default function Button({
  children,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClass =
    'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-card',
    accent: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 shadow-card',
    outline: 'border border-primary-200 text-primary-700 bg-white hover:bg-primary-50 focus:ring-primary-400',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-card',
  }

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClass} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      aria-busy={loading}
      {...props}
    >
      <span className={`inline-flex items-center justify-center gap-2 ${loading ? 'invisible' : ''}`}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <FaSpinner className="h-4 w-4 animate-spin" />
        </span>
      )}
    </button>
  )
}
