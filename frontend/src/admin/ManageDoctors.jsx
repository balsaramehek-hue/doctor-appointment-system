import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUserMd, FaPlus, FaEdit, FaTrash, FaTimes, FaUpload, FaImage, FaCalendarCheck, FaCalendarTimes } from 'react-icons/fa'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import LoadingButton from '../components/LoadingButton'
import { useToast } from '../components/Toast'
import { doctorService, getImageUrl } from '../services/apiService'

const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Gynecologist',
  'ENT',
  'Dentist',
  'Psychiatrist',
  'Urologist',
  'Nephrologist',
  'Pulmonologist',
  'Gastroenterologist',
  'Endocrinologist',
  'Oncologist',
  'Radiologist',
]

const QUALIFICATIONS = [
  'MBBS',
  'MD',
  'MS',
  'DM',
  'MCh',
  'DNB',
  'BDS',
  'BAMS',
  'BHMS',
  'FCPS',
  'MRCP',
  'FRCS',
  'Fellowship',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_SHORT = { Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun' }

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM', '07:00 PM',
]

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  qualification: '',
  experience: '',
  fee: '',
  description: '',
  image: null,
  imagePreview: '',
  availableDays: [],
  slots: [],
  status: 'active',
  availability: {
    isOnLeave: false,
    leaveStart: '',
    leaveEnd: '',
    leaveReason: '',
    unavailableDates: [],
    unavailableDays: [],
    nextAvailableDate: '',
  },
}

export default function ManageDoctors() {
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [unavailableDateInput, setUnavailableDateInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await doctorService.getDoctors()
      if (res?.success) setList(res.data.doctors || [])
    } catch (err) {
      setError(err.message || 'Failed to load doctors.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setModalOpen(true)
  }

  // Open Add Doctor modal from Quick Action (?add=1)
  useEffect(() => {
    if (searchParams.get('add') === '1') {
      openAdd()
      searchParams.delete('add')
      setSearchParams(searchParams, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const openEdit = (doc) => {
    setEditing(doc)
    const avail = doc.availability || {}
    setForm({
      name: doc.name,
      email: doc.email || '',
      phone: doc.phone || '',
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience: doc.experience,
      fee: doc.fee,
      description: doc.about || doc.description || '',
      image: null,
      imagePreview: getImageUrl(doc.image),
      availableDays: doc.availableDays || [],
      slots: doc.slots || doc.availableTimeSlots || [],
      status: doc.status || 'active',
      availability: {
        isOnLeave: avail.isOnLeave || false,
        leaveStart: avail.leaveStart ? new Date(avail.leaveStart).toISOString().split('T')[0] : '',
        leaveEnd: avail.leaveEnd ? new Date(avail.leaveEnd).toISOString().split('T')[0] : '',
        leaveReason: avail.leaveReason || '',
        unavailableDates: avail.unavailableDates?.map((d) => new Date(d).toISOString().split('T')[0]) || [],
        unavailableDays: avail.unavailableDays || [],
        nextAvailableDate: avail.nextAvailableDate ? new Date(avail.nextAvailableDate).toISOString().split('T')[0] : '',
      },
    })
    setFormError('')
    setModalOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await doctorService.deleteDoctor(deleteTarget.id)
      if (res?.success) {
        setList((prev) => prev.filter((d) => d.id !== deleteTarget.id))
        toast.success('Doctor deleted successfully')
        setDeleteTarget(null)
      } else {
        toast.error(res?.message || 'Failed to delete doctor.')
      }
    } catch (err) {
      setError(err.message || 'Failed to delete doctor.')
      toast.error(err.message || 'Failed to delete doctor.')
    } finally {
      setDeleting(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Frontend validation: only images, max 5MB.
      const allowed = /jpeg|jpg|png|gif|webp/i
      if (!allowed.test(file.type)) {
        toast.error('Only image files are allowed (jpeg, jpg, png, gif, webp).')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB.')
        return
      }
      setForm((f) => ({
        ...f,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }))
      toast.success('Image selected successfully')
    }
  }

  const toggleDay = (day) => {
    setForm((f) => ({
      ...f,
      availableDays: f.availableDays.includes(day)
        ? f.availableDays.filter((d) => d !== day)
        : [...f.availableDays, day],
    }))
  }

  const toggleSlot = (slot) => {
    setForm((f) => ({
      ...f,
      slots: f.slots.includes(slot) ? f.slots.filter((s) => s !== slot) : [...f.slots, slot],
    }))
  }

  const toggleUnavailableDay = (day) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        unavailableDays: f.availability.unavailableDays.includes(day)
          ? f.availability.unavailableDays.filter((d) => d !== day)
          : [...f.availability.unavailableDays, day],
      },
    }))
  }

  const addUnavailableDate = () => {
    if (!unavailableDateInput) return
    setForm((f) => {
      if (f.availability.unavailableDates.includes(unavailableDateInput)) return f
      return {
        ...f,
        availability: {
          ...f.availability,
          unavailableDates: [...f.availability.unavailableDates, unavailableDateInput],
        },
      }
    })
    setUnavailableDateInput('')
  }

  const removeUnavailableDate = (date) => {
    setForm((f) => ({
      ...f,
      availability: {
        ...f.availability,
        unavailableDates: f.availability.unavailableDates.filter((d) => d !== date),
      },
    }))
  }

  const toggleQualification = (q) => {
    setForm((f) => {
      const current = f.qualification
        ? f.qualification.split(',').map((s) => s.trim()).filter(Boolean)
        : []
      const next = current.includes(q)
        ? current.filter((x) => x !== q)
        : [...current, q]
      return { ...f, qualification: next.join(', ') }
    })
  }

  const selectedQualifications = form.qualification
    ? form.qualification.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  const handleSave = async () => {
    setSaving(true)
    setFormError('')

    // Frontend validation (mirrors backend requirements).
    if (!form.name?.trim()) {
      setFormError('Doctor name is required.')
      setSaving(false)
      return
    }
    if (!form.specialization?.trim()) {
      setFormError('Specialization is required.')
      setSaving(false)
      return
    }
    if (form.fee !== '' && form.fee != null && isNaN(Number(form.fee))) {
      setFormError('Fee must be a numeric value.')
      setSaving(false)
      return
    }
    if (form.experience !== '' && form.experience != null && isNaN(Number(form.experience))) {
      setFormError('Experience must be a numeric value.')
      setSaving(false)
      return
    }
    if (form.availableDays.length === 0) {
      setFormError('Select at least one available day.')
      setSaving(false)
      return
    }
    if (form.slots.length === 0) {
      setFormError('Select at least one available time slot.')
      setSaving(false)
      return
    }

    const payload = new FormData()
    payload.append('name', form.name)
    payload.append('email', form.email)
    payload.append('phone', form.phone)
    payload.append('specialization', form.specialization)
    payload.append('department', form.specialization)
    payload.append('qualification', form.qualification)
    payload.append('experience', String(form.experience || 0))
    payload.append('fee', String(form.fee || 0))
    payload.append('about', form.description)
    payload.append('availableDays', JSON.stringify(form.availableDays))
    payload.append('slots', JSON.stringify(form.slots))
    payload.append('availableTimeSlots', JSON.stringify(form.slots))
    const statusValue = form.availability.isOnLeave ? 'on_leave' : form.status
    payload.append('status', statusValue)
    payload.append('availability', JSON.stringify({
      isOnLeave: form.availability.isOnLeave,
      leaveStart: form.availability.leaveStart || null,
      leaveEnd: form.availability.leaveEnd || null,
      leaveReason: form.availability.leaveReason,
      unavailableDates: form.availability.unavailableDates,
      unavailableDays: form.availability.unavailableDays,
      nextAvailableDate: form.availability.nextAvailableDate || null,
    }))
    if (form.image) {
      payload.append('image', form.image)
    }

    try {
      const res = editing
        ? await doctorService.updateDoctor(editing.id, payload)
        : await doctorService.addDoctor(payload)
      if (res?.success) {
        await load()
        setModalOpen(false)
        toast.success(editing ? 'Doctor updated successfully' : 'Doctor added successfully')
      } else {
        setFormError(res?.message || 'Failed to save doctor.')
        toast.error(res?.message || 'Failed to save doctor.')
      }
    } catch (err) {
      setFormError(err.message || 'Failed to save doctor.')
      toast.error(err.message || 'Failed to save doctor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Doctors</h1>
          <p className="mt-1 text-sm text-slate-500">{list.length} doctors registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <FaPlus /> Add Doctor
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading doctors..." />
      ) : error ? (
        <EmptyState icon={FaUserMd} title="Couldn't load doctors" message={error} />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={FaUserMd}
                title="No doctors available"
                message="Add a doctor to get started."
              />
            </div>
          ) : (
            <AnimatePresence>
              {list.map((d) => (
                <motion.div
                  key={d.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-4">
                    <img src={getImageUrl(d.image)} alt={d.name} className="h-14 w-14 rounded-full object-cover" />
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-900">{d.name}</h3>
                      <p className="text-xs text-primary-600">{d.specialization}</p>
                      <p className="text-xs text-slate-400">{d.experience} yrs · ₹{d.fee}</p>
                      {d.availability?.isOnLeave && (
                        <span className="badge bg-red-100 text-red-700 mt-1">On Leave</span>
                      )}
                    </div>
                  </div>
                  <div className="flex border-t border-slate-100">
                    <button
                      onClick={() => openEdit(d)}
                      className="flex flex-1 items-center justify-center gap-2 py-3 text-sm text-slate-600 hover:bg-slate-50"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(d)}
                      className="flex flex-1 items-center justify-center gap-2 border-l border-slate-100 py-3 text-sm text-red-500 hover:bg-red-50"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Add/Edit Doctor Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          {formError && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</div>
          )}

          {/* Image Upload */}
          <div>
            <label className="label">Doctor Image</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                {form.imagePreview ? (
                  <img src={form.imagePreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FaImage className="text-2xl text-slate-300" />
                )}
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-outline text-xs"
                >
                  <FaUpload /> Upload Image
                </button>
                {form.image && (
                  <p className="mt-1 text-xs text-slate-500">{form.image.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Doctor Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="doctor@example.com"
              />
            </div>
            <div>
              <label className="label">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="label">Specialization</label>
              <select
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="input"
              >
                <option value="">Select specialization</option>
                {SPECIALIZATIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Qualification</label>
              <div className="flex flex-wrap gap-2">
                {QUALIFICATIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQualification(q)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      selectedQualifications.includes(q)
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
              {selectedQualifications.length > 0 && (
                <p className="mt-1 text-xs text-slate-500">
                  Selected: {selectedQualifications.join(', ')}
                </p>
              )}
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input
                type="number"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="input"
                placeholder="5"
                min="0"
              />
            </div>
            <div>
              <label className="label">Consultation Fee (₹)</label>
              <input
                type="number"
                value={form.fee}
                onChange={(e) => setForm({ ...form, fee: e.target.value })}
                className="input"
                placeholder="500"
                min="0"
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
          </div>

          {/* Available Days */}
          <div>
            <label className="label">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(DAY_SHORT[day])}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    form.availableDays.includes(DAY_SHORT[day])
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Available Time Slots */}
          <div>
            <label className="label">Available Time Slots</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(slot)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    form.slots.includes(slot)
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Management */}
          <div className="rounded-xl border border-slate-200 p-4 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FaCalendarCheck /> Availability Management
            </h3>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOnLeave"
                checked={form.availability.isOnLeave}
                onChange={(e) => setForm({
                  ...form,
                  availability: { ...form.availability, isOnLeave: e.target.checked }
                })}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isOnLeave" className="text-sm font-medium text-slate-700">
                Doctor is currently on leave
              </label>
            </div>

            {form.availability.isOnLeave && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Leave Start Date</label>
                  <input
                    type="date"
                    value={form.availability.leaveStart}
                    onChange={(e) => setForm({
                      ...form,
                      availability: { ...form.availability, leaveStart: e.target.value }
                    })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Leave End Date</label>
                  <input
                    type="date"
                    value={form.availability.leaveEnd}
                    onChange={(e) => setForm({
                      ...form,
                      availability: { ...form.availability, leaveEnd: e.target.value }
                    })}
                    className="input"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Leave Reason</label>
                  <input
                    type="text"
                    value={form.availability.leaveReason}
                    onChange={(e) => setForm({
                      ...form,
                      availability: { ...form.availability, leaveReason: e.target.value }
                    })}
                    className="input"
                    placeholder="e.g., Vacation, Medical leave"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label">Unavailable Days (recurring)</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleUnavailableDay(DAY_SHORT[day])}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      form.availability.unavailableDays.includes(DAY_SHORT[day])
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Unavailable Specific Dates</label>
              <div className="flex flex-wrap items-end gap-2">
                <input
                  type="date"
                  value={unavailableDateInput}
                  onChange={(e) => setUnavailableDateInput(e.target.value)}
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={addUnavailableDate}
                  className="btn-outline text-xs"
                >
                  <FaPlus /> Add Date
                </button>
              </div>
              {form.availability.unavailableDates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.availability.unavailableDates.map((d) => (
                    <span
                      key={d}
                      className="badge bg-red-50 text-red-700 cursor-pointer"
                      onClick={() => removeUnavailableDate(d)}
                      title="Click to remove"
                    >
                      {d} <FaTimes className="ml-1" />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label">Next Available Date</label>
              <input
                type="date"
                value={form.availability.nextAvailableDate}
                onChange={(e) => setForm({
                  ...form,
                  availability: { ...form.availability, nextAvailableDate: e.target.value }
                })}
                className="input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description / About</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
              placeholder="Brief description about the doctor..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost" disabled={saving}>
              <FaTimes /> Cancel
            </button>
            <LoadingButton onClick={handleSave} loading={saving} className="btn-primary">
              {editing ? 'Save Changes' : 'Add Doctor'}
            </LoadingButton>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Doctor"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`
            : 'Are you sure you want to delete this doctor?'
        }
        confirmLabel="Delete Doctor"
      />
    </div>
  )
}
