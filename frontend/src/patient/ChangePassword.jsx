import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaLock, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { authService } from '../services/apiService'
import { useToast } from '../components/Toast'

export default function ChangePassword() {
  const toast = useToast()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { currentPassword: '', password: '', confirmPassword: '' } })

  const password = watch('password')

  const onSubmit = async (data) => {
    setServerError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await authService.changePassword({
        currentPassword: data.currentPassword,
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
      if (res?.success) {
        setSuccess(res.message || 'Password changed successfully')
        toast.success('Password changed successfully')
        reset()
      } else {
        setServerError(res?.message || 'Failed to change password.')
      }
    } catch (err) {
      setServerError(err.message || 'Failed to change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      <p className="mt-1 text-sm text-slate-500">Update your account password.</p>

      <div className="mt-6 card p-6 max-w-lg">
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

          <FormInput
            id="currentPassword"
            label="Current Password"
            type="password"
            placeholder="Enter current password"
            icon={FaLock}
            error={errors.currentPassword?.message}
            showPasswordToggle
            {...register('currentPassword', { required: 'Current password is required' })}
          />
          <FormInput
            id="password"
            label="New Password"
            type="password"
            placeholder="Enter new password"
            icon={FaLock}
            error={errors.password?.message}
            showPasswordToggle
            {...register('password', {
              required: 'New password is required',
              minLength: { value: 6, message: 'Min 6 characters' },
            })}
          />
          <FormInput
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            placeholder="Confirm new password"
            icon={FaLock}
            error={errors.confirmPassword?.message}
            showPasswordToggle
            {...register('confirmPassword', {
              required: 'Please confirm new password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />

          <LoadingButton type="submit" loading={loading} className="btn-primary">
            Update Password
          </LoadingButton>
        </form>
      </div>
    </div>
  )
}
