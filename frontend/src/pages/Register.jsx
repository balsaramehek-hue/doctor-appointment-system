import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { FaUser, FaEnvelope, FaPhone, FaLock, FaExclamationCircle } from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'

export default function Register({ onSuccess, switchToLogin }) {
  const { register: registerUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  })

  const password = watch('password')

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await registerUser(data)
      if (res.success) {
        toast.success('Registration successful!')
        if (onSuccess) onSuccess()
        navigate('/dashboard')
      } else {
        setServerError(res.message || 'Registration failed')
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.')
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
        id="name"
        label="Full Name"
        placeholder="John Doe"
        icon={FaUser}
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

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
        id="phone"
        label="Phone Number"
        placeholder="+91 98765 43210"
        icon={FaPhone}
        error={errors.phone?.message}
        {...register('phone', {
          required: 'Phone is required',
          pattern: {
            value: /^[+]?[\d\s-]{8,15}$/,
            message: 'Enter a valid phone number',
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
        {...register('password', {
          required: 'Password is required',
          minLength: { value: 6, message: 'Min 6 characters' },
          pattern: {
            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            message: 'Must include uppercase, lowercase and a number',
          },
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
        Create Account
      </LoadingButton>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <button
          type="button"
          onClick={switchToLogin}
          className="font-medium text-primary-600 hover:underline"
        >
          Login
        </button>
      </p>
    </form>
  )
}
