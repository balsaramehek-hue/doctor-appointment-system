import Notification from '../models/Notification.js'
import { sendSuccess, sendError } from '../utils/response.js'

// @route   GET /api/notifications
// Returns notifications for the logged-in user (patient or admin).
export const getNotifications = async (req, res) => {
  const model = req.user.role === 'admin' ? 'Admin' : 'Patient'
  const notifications = await Notification.find({
    recipient: req.user._id,
    recipientModel: model,
  })
    .sort({ createdAt: -1 })
    .limit(50)

  const unread = notifications.filter((n) => !n.read).length

  return sendSuccess(res, 'Notifications fetched', {
    notifications: notifications.map((n) => ({
      id: n._id.toString(),
      title: n.title,
      message: n.message,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      relatedAppointment: n.relatedAppointment,
    })),
    unread,
  })
}

// @route   PATCH /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findById(req.params.id)
  if (!notification) return sendError(res, 'Notification not found', 404)

  // Users can only mark their own notifications.
  if (notification.recipient.toString() !== req.user._id.toString()) {
    return sendError(res, 'Not authorized', 403)
  }

  notification.read = true
  await notification.save()
  return sendSuccess(res, 'Notification marked as read')
}

// @route   PATCH /api/notifications/read-all
export const markAllRead = async (req, res) => {
  const model = req.user.role === 'admin' ? 'Admin' : 'Patient'
  await Notification.updateMany(
    { recipient: req.user._id, recipientModel: model, read: false },
    { read: true }
  )
  return sendSuccess(res, 'All notifications marked as read')
}
