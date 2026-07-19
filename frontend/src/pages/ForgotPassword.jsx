import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FaEnvelope, FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { authService } from '../services/apiService'

export default function ForgotPassword({ switchToLogin }) {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { email: '' } })

  const onSubmit = async (data) => {
    setServerError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await authService.forgotPassword(data)
      if (res?.success) {
        setSubmitted(true)
        setSuccess(res.message || 'If that email exists, a reset link has been sent.')
        reset()
      } else {
        setServerError(res?.message || 'Failed to send reset link.')
      }
    } catch (err) {
      setServerError(err.message || 'Failed to send reset link. Please try again.')
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
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Forgot Password</h1>
          <p className="text-sm text-slate-500">Reset your password via email</p>
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

          {!submitted ? (
            <>
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
              <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
                Send Reset Link
              </LoadingButton>
            </>
          ) : (
            <div className="rounded-xl bg-green-50 p-4 text-center text-sm text-green-700">
              <FaCheckCircle className="mx-auto mb-2 text-2xl" />
              <p>Check your email for reset instructions.</p>
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
