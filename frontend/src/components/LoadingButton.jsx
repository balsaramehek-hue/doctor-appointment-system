import LoadingSpinner from './LoadingSpinner'

/**
 * Drop-in loading-aware button that keeps the same size while loading.
 * Pass existing btn-* classes via className — appearance is unchanged.
 */
export default function LoadingButton({
  children,
  loading = false,
  disabled = false,
  className = 'btn-primary',
  type = 'button',
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      aria-busy={loading}
      {...props}
    >
      <span className={`btn-loading-label ${loading ? 'is-loading' : ''}`}>{children}</span>
      {loading && (
        <span className="btn-loading-spinner">
          <LoadingSpinner size="sm" inline />
        </span>
      )}
    </button>
  )
}
