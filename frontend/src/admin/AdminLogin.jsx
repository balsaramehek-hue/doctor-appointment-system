import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaLock, FaExclamationCircle, FaUserShield } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
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
      const res = await adminLogin(data.email, data.password)
      if (res.success && res.role === 'admin') {
        toast.success('Login successful!')
        navigate('/admin')
      } else if (res.success) {
        setServerError('This account is not an admin.')
      } else {
        setServerError(res.message || 'Invalid email or password')
      }
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-dark to-primary-900 p-4">
      <div className="w-full max-w-md card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
            <FaUserShield size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-sm text-slate-500">MediCare Hospital Management</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <FaExclamationCircle /> {serverError}
            </div>
          )}
          <FormInput
            id="aemail"
            label="Email"
            type="email"
            placeholder="admin@demo.com"
            icon={FaEnvelope}
            error={errors.email?.message}
            {...register('email', { required: 'Email is required' })}
          />
          <FormInput
            id="apassword"
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={FaLock}
            error={errors.password?.message}
            showPasswordToggle
            {...register('password', { required: 'Password is required' })}
          />
          <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
            Login to Dashboard
          </LoadingButton>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">
          Demo — admin@demo.com / admin123
        </p>
      </div>
    </div>
  )
}
