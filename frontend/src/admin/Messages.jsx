import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaEnvelope,
  FaEnvelopeOpenText,
  FaUser,
  FaPhone,
  FaRegCommentDots,
  FaCheck,
  FaTimes,
  FaReply,
} from 'react-icons/fa'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import { contactService } from '../services/apiService'

export default function Messages() {
  const toast = useToast()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyModal, setReplyModal] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replying, setReplying] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    setError('')
    try {
      const res = await contactService.getMessages()
      if (res?.success) setMessages(res.data.messages || [])
    } catch (err) {
      if (!silent) setError(err.message || 'Failed to load messages.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Poll so admin sees new messages quickly
    const interval = setInterval(() => load(true), 15000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const markRead = async (id) => {
    try {
      const res = await contactService.markRead(id)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'read' } : m))
        )
        toast.success('Message marked as read')
      }
    } catch {
      toast.error('Failed to mark message as read')
    }
  }

  const markSolved = async (id) => {
    try {
      const res = await contactService.markSolved(id)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: 'solved' } : m))
        )
        toast.success('Message marked as solved')
      }
    } catch {
      toast.error('Failed to mark message as solved')
    }
  }

  const handleReply = async () => {
    if (!replyModal || !replyText.trim()) return
    setReplying(true)
    try {
      const res = await contactService.replyToMessage(replyModal.id, replyText)
      if (res?.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === replyModal.id
              ? {
                  ...m,
                  status: 'read',
                  reply: res.data.message.reply,
                  repliedAt: res.data.message.repliedAt,
                }
              : m
          )
        )
        setReplyModal(null)
        setReplyText('')
        toast.success('Reply sent successfully')
      } else {
        toast.error(res?.message || 'Failed to send reply')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await contactService.deleteMessage(deleteTarget.id)
      if (res?.success) {
        setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id))
        toast.success('Message deleted successfully')
        setDeleteTarget(null)
      } else {
        toast.error(res?.message || 'Failed to delete message')
      }
    } catch {
      toast.error('Failed to delete message')
    } finally {
      setDeleting(false)
    }
  }

  const unread = messages.filter((m) => m.status === 'unread').length

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
      <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-500">
        {unread} unread message{unread !== 1 ? 's' : ''}
      </p>

      {loading ? (
        <LoadingSpinner text="Loading messages..." />
      ) : error ? (
        <EmptyState icon={FaRegCommentDots} title="Couldn't load messages" message={error} />
      ) : (
        <div className="mt-6 space-y-4">
          {messages.length === 0 ? (
            <EmptyState
              icon={FaRegCommentDots}
              title="No messages yet"
              message="Contact messages from patients will appear here once they are sent."
            />
          ) : (
            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card p-5 ${m.status === 'unread' ? 'border-primary-200' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{m.name}</h3>
                        <span className={`badge ${getStatusBadge(m.status)}`}>
                          {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><FaEnvelope /> {m.email}</span>
                        <span className="flex items-center gap-1"><FaPhone /> {m.phone}</span>
                        <span>{m.date ? new Date(m.date).toLocaleDateString() : ''}</span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {m.status === 'unread' && (
                        <button
                          onClick={() => markRead(m.id)}
                          className="btn-ghost px-3 py-2 text-xs"
                        >
                          <FaEnvelopeOpenText /> Mark Read
                        </button>
                      )}
                      {m.status !== 'solved' && (
                        <button
                          onClick={() => markSolved(m.id)}
                          className="btn-ghost px-3 py-2 text-xs text-green-600"
                        >
                          <FaCheck /> Mark Solved
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setReplyModal(m)
                          setReplyText('')
                        }}
                        className="btn-ghost px-3 py-2 text-xs text-primary-600"
                      >
                        <FaReply /> Reply
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="btn-ghost px-3 py-2 text-xs text-red-500"
                      >
                        <FaTimes /> Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    {m.message}
                  </p>
                  {m.reply && (
                    <div className="mt-3 rounded-xl bg-primary-50 p-3 text-sm text-primary-800">
                      <p className="font-medium">Your Reply:</p>
                      <p>{m.reply}</p>
                      {m.repliedAt && (
                        <p className="mt-1 text-xs text-primary-500">
                          {new Date(m.repliedAt).toLocaleString('en-IN')}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        open={!!replyModal}
        onClose={() => {
          setReplyModal(null)
          setReplyText('')
        }}
        title="Reply to Message"
        size="md"
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-medium">Original Message:</p>
            <p>{replyModal?.message}</p>
          </div>
          <div>
            <label className="label">Your Reply</label>
            <textarea
              rows={4}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="input resize-none"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setReplyModal(null)
                setReplyText('')
              }}
              className="btn-ghost"
              disabled={replying}
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleReply}
              loading={replying}
              disabled={!replyText.trim()}
              className="btn-primary"
            >
              Send Reply
            </LoadingButton>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Message"
        message={
          deleteTarget
            ? `Are you sure you want to delete the message from ${deleteTarget.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this message?'
        }
        confirmLabel="Delete Message"
      />
    </div>
  )
}
