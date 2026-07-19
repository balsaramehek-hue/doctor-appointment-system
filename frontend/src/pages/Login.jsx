import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaExclamationCircle } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Login({ onSuccess, switchToRegister }) {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: '', password: '' } })

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await login(data.email, data.password)
      if (res.success) {
        toast.success('Login successful!')
        if (onSuccess) onSuccess()
        navigate(res.role === 'admin' ? '/admin' : '/dashboard')
      } else {
        // Show backend error on the page — do not redirect
        setServerError(res.message || 'Invalid email or password')
      }
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {serverError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          <FaExclamationCircle /> {serverError}
        </div>
      )}

      <FormInput
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={FaEnvelope}
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Enter a valid email',
          },
        })}
      />

      <FormInput
        id="password"
        label="Password"
        type="password"
        placeholder="••••••••"
        icon={FaLock}
        error={errors.password?.message}
        showPasswordToggle
        {...register('password', { required: 'Password is required' })}
      />

      <div className="flex items-center justify-between text-xs">
        <Link to="/forgot-password" className="text-primary-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
        Login
      </LoadingButton>

      <p className="text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={switchToRegister}
          className="font-medium text-primary-600 hover:underline"
        >
          Sign up
        </button>
      </p>

      <p className="text-center text-xs text-slate-400">
        Are you an administrator?{' '}
        <Link to="/admin/login" className="font-medium text-primary-600 hover:underline">
          Admin login
        </Link>
      </p>
    </form>
  )
}
