import { forwardRef, useState } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

// Reusable form input with label, error and icon support.
// Supports password visibility toggle via `showPasswordToggle` prop.
const FormInput = forwardRef(function FormInput(
  { label, error, icon: Icon, type = 'text', className = '', showPasswordToggle = false, ...props },
  ref
) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password' && showPasswordToggle

  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <Icon />
          </span>
        )}
        <input
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={`input ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:ring-red-100 focus:border-red-400' : ''
          }`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
})

export default FormInput
