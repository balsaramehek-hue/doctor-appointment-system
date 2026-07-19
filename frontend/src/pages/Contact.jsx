import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaAmbulance,
  FaUser,
  FaPaperPlane,
  FaExclamationCircle,
  FaCheckCircle,
} from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import { useAuth } from '../context/AuthContext'
import { contactService } from '../services/apiService'
import { useToast } from '../components/Toast'

export default function Contact() {
  const { user, isAuthenticated, isPatient } = useAuth()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [myMessages, setMyMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues: { name: '', email: '', phone: '', message: '' } })

  const loadMyMessages = async () => {
    if (!isAuthenticated || !isPatient) return
    setMessagesLoading(true)
    try {
      const res = await contactService.getMyMessages()
      if (res?.success) setMyMessages(res.data.messages || [])
    } catch {
      // Non-blocking
    } finally {
      setMessagesLoading(false)
    }
  }

  // Load patient's message history when authenticated
  useEffect(() => {
    if (isAuthenticated && isPatient) {
      loadMyMessages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isPatient])

  // Prefill form for logged-in users
  useEffect(() => {
    if (user) {
      if (user.name) setValue('name', user.name)
      if (user.email) setValue('email', user.email)
      if (user.phone) setValue('phone', user.phone)
    }
  }, [user, setValue])

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await contactService.submit(data)
      if (res?.success) {
        setSubmitted(true)
        toast.success('Message sent successfully!')
        reset({
          name: user?.name || '',
          email: user?.email || '',
          phone: user?.phone || '',
          message: '',
        })
        setTimeout(() => setSubmitted(false), 4000)
        if (isAuthenticated && isPatient) {
          loadMyMessages()
        }
      } else {
        setServerError(res?.message || 'Failed to send message.')
        toast.error(res?.message || 'Failed to send message.')
      }
    } catch (err) {
      setServerError(err.message || 'Failed to send message. Please try again.')
      toast.error(err.message || 'Failed to send message.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status) => {
    const styles = {
      unread: 'bg-amber-100 text-amber-700',
      read: 'bg-blue-100 text-blue-700',
      solved: 'bg-green-100 text-green-700',
    }
    return styles[status] || 'bg-slate-100 text-slate-600'
  }

  const showHistory = isAuthenticated && isPatient

  return (
    <div className="container-px mx-auto max-w-6xl py-12">
      <div className="text-center">
        <h1 className="section-title">Contact Us</h1>
        <p className="section-subtitle">
          We're here to help. Reach out for appointments, queries or emergencies.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Info */}
        <div className="space-y-4">
          <div className="card flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <FaMapMarkerAlt />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Address</h3>
              <p className="text-sm text-slate-500">Hospital address will appear here once configured.</p>
            </div>
          </div>
          <div className="card flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <FaPhone />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Phone</h3>
              <p className="text-sm text-slate-500">Contact number will appear here once configured.</p>
            </div>
          </div>
          <div className="card flex items-start gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <FaEnvelope />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Email</h3>
              <p className="text-sm text-slate-500">Email address will appear here once configured.</p>
            </div>
          </div>

          <div className="card flex h-56 items-center justify-center bg-slate-100 text-slate-400">
            <span className="text-center text-sm">
              📍 Google Map Placeholder
              <br />
              (Integrate Google Maps here)
            </span>
          </div>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card space-y-4 p-6"
        >
          {isAuthenticated && (
            <div className="rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-700">
              Logged in as <b>{user?.name}</b> ({user?.email})
            </div>
          )}
          <FormInput
            id="cname"
            label="Name"
            placeholder="Your name"
            icon={FaUser}
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />
          <FormInput
            id="cemail"
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
            id="cphone"
            label="Phone"
            placeholder="+91 98765 43210"
            icon={FaPhone}
            error={errors.phone?.message}
            {...register('phone', { required: 'Phone is required' })}
          />
          <div>
            <label className="label">Message</label>
            <textarea
              rows={4}
              placeholder="How can we help?"
              className="input resize-none"
              {...register('message', { required: 'Message is required' })}
            />
            {errors.message && (
              <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>
            )}
          </div>

          {submitted && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-600">
              <FaCheckCircle /> Thank you! Your message has been sent.
            </div>
          )}

          {serverError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <FaExclamationCircle /> {serverError}
            </div>
          )}

          <LoadingButton type="submit" loading={loading} className="btn-primary w-full">
            <FaPaperPlane /> Send Message
          </LoadingButton>
        </motion.form>
      </div>

      {/* Patient Message History */}
      {showHistory && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900">My Messages</h2>
          <p className="mt-1 text-sm text-slate-500">
            View your message history and admin replies.
          </p>

          {messagesLoading ? (
            <LoadingSpinner text="Loading messages..." />
          ) : myMessages.length === 0 ? (
            <div className="mt-6 card p-8 text-center text-sm text-slate-500">
              No messages yet. Send a message above and it will appear here.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {myMessages.map((m) => (
                <div key={m.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">Message #{m.id.slice(-6)}</h3>
                        <span className={`badge ${getStatusBadge(m.status)}`}>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                        <span className={`badge ${m.isRead ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'}`}>
                          {m.isRead ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {formatDate(m.date)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {m.message}
                  </div>
                  {m.reply && (
                    <div className="mt-3 rounded-xl bg-primary-50 p-3 text-sm text-primary-800">
                      <p className="font-medium">Admin Reply:</p>
                      <p>{m.reply}</p>
                      {m.repliedAt && (
                        <p className="mt-1 text-xs text-primary-500">
                          {formatDate(m.repliedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Emergency section */}
      <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 to-red-600 p-10 text-center text-white">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <FaAmbulance size={32} />
        </div>
        <h2 className="mt-4 text-3xl font-bold">
          Free Ambulance Service Available 24/7
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-red-50">
          In a medical emergency? Our ambulance team is just a call away — free
          within city limits.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href="tel:108"
            className="btn bg-white text-red-600 hover:bg-red-50"
          >
            <FaPhone /> Emergency: 108
          </a>
          <a
            href="tel:108"
            className="btn border border-white/40 hover:bg-white/10"
          >
            <FaAmbulance /> Request Ambulance
          </a>
        </div>
      </div>
    </div>
  )
}
