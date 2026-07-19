import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { authService } from '../services/apiService'

export default function ResetPassword({ switchToLogin }) {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { password: '', confirmPassword: '' } })

  const password = watch('password')

  useEffect(() => {
    if (!token) {
      setServerError('Invalid or missing reset token.')
    }
  }, [token])

  const onSubmit = async (data) => {
    setServerError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await authService.resetPassword({ token, password: data.password })
      if (res?.success) {
        setSubmitted(true)
        setSuccess(res.message || 'Password has been reset. Please login.')
        reset()
      } else {
        setServerError(res?.message || 'Failed to reset password.')
      }
    } catch (err) {
      setServerError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark to-primary-900 p-4">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <FaLock size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500">Create a new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <FaExclamationCircle /> {serverError}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              <FaCheckCircle /> {success}
            </div>
          )}

          {!submitted && token ? (
            <>
              <FormInput
                id="password"
                label="New Password"
                type="password"
                placeholder="••••••••"
                icon={FaLock}
                error={errors.password?.message}
                showPasswordToggle
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Min 6 characters' },
                })}
              />
              <FormInput
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                icon={FaLock}
                error={errors.confirmPassword?.message}
                showPasswordToggle
                {...register('confirmPassword', {
                  required: 'Please confirm password',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
              />
              <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
                Reset Password
              </LoadingButton>
            </>
          ) : (
            <div className="rounded-xl bg-red-50 p-4 text-center text-sm text-red-700">
              <FaExclamationCircle className="mx-auto mb-2 text-2xl" />
              <p>Invalid or expired reset link.</p>
            </div>
          )}

          <p className="text-center text-sm text-slate-500">
            Remember your password?{' '}
            <button
              type="button"
              onClick={switchToLogin}
              className="font-medium text-primary-600 hover:underline"
            >
              Back to Login
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
