import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  FaPaperPlane,
  FaExclamationCircle,
  FaCheckCircle,
  FaEnvelope,
} from 'react-icons/fa'
import FormInput from '../components/FormInput'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../context/AuthContext'
import { contactService } from '../services/apiService'
import { useToast } from '../components/Toast'

export default function MyMessages() {
  const { user } = useAuth()
  const toast = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [myMessages, setMyMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      message: '',
    },
  })

  const loadMyMessages = async () => {
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

  useEffect(() => {
    loadMyMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        loadMyMessages()
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Contact</h1>
      <p className="mt-1 text-sm text-slate-500">
        Send a message to the hospital and view replies from admin.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-6 space-y-4 p-6">
        <FormInput
          id="pname"
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <FormInput
          id="pemail"
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { required: 'Email is required' })}
        />
        <FormInput
          id="pphone"
          label="Phone"
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

        <LoadingButton type="submit" loading={loading} className="btn-primary">
          <FaPaperPlane /> Send Message
        </LoadingButton>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">My Messages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Message history, admin replies, and read status.
        </p>

        {messagesLoading ? (
          <LoadingSpinner text="Loading messages..." />
        ) : myMessages.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={FaEnvelope}
              title="No messages yet"
              message="Send a message above and it will appear here with any admin replies."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {myMessages.map((m) => (
              <div key={m.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    Message #{m.id.slice(-6)}
                  </h3>
                  <span className={`badge ${getStatusBadge(m.status)}`}>
                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                  </span>
                  <span
                    className={`badge ${
                      m.isRead
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {m.isRead ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{formatDate(m.date)}</p>
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
    </div>
  )
}
