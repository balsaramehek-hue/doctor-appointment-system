import { useState, useEffect } from 'react'
import { FaHospital, FaPhone, FaEnvelope, FaClock, FaSave, FaPlus, FaTrash } from 'react-icons/fa'
import LoadingButton from '../components/LoadingButton'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmModal from '../components/ConfirmModal'
import { useToast } from '../components/Toast'
import { departmentService } from '../services/apiService'

export default function Settings() {
  const toast = useToast()
  const [form, setForm] = useState({
    name: 'MediCare Hospital',
    address: '',
    phone: '',
    email: '',
    emergency: '108',
    hours: '24/7',
  })
  const [departments, setDepartments] = useState([])
  const [deptName, setDeptName] = useState('')
  const [deptDesc, setDeptDesc] = useState('')
  const [loadingDepts, setLoadingDepts] = useState(true)
  const [savingDept, setSavingDept] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const loadDepartments = async () => {
    setLoadingDepts(true)
    try {
      const res = await departmentService.getDepartments()
      if (res?.success) setDepartments(res.data.departments || [])
    } catch {
      // Non-blocking
    } finally {
      setLoadingDepts(false)
    }
  }

  useEffect(() => {
    loadDepartments()
    // Scroll to departments if hash present
    if (window.location.hash === '#departments') {
      setTimeout(() => {
        document.getElementById('departments')?.scrollIntoView({ behavior: 'smooth' })
      }, 200)
    }
  }, [])

  const handleSaveSettings = () => {
    setSavingSettings(true)
    // Settings persistence can be wired to a backend later; keep local for now
    try {
      localStorage.setItem('medicare_settings', JSON.stringify(form))
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSavingSettings(false)
    }
  }

  useEffect(() => {
    try {
      const saved = localStorage.getItem('medicare_settings')
      if (saved) setForm((f) => ({ ...f, ...JSON.parse(saved) }))
    } catch {
      // ignore
    }
  }, [])

  const handleAddDepartment = async () => {
    if (!deptName.trim()) {
      toast.error('Department name is required')
      return
    }
    setSavingDept(true)
    try {
      const res = await departmentService.addDepartment({
        name: deptName.trim(),
        description: deptDesc.trim(),
      })
      if (res?.success) {
        toast.success('Department added successfully')
        setDeptName('')
        setDeptDesc('')
        loadDepartments()
      } else {
        toast.error(res?.message || 'Failed to add department')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to add department')
    } finally {
      setSavingDept(false)
    }
  }

  const handleDeleteDepartment = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await departmentService.deleteDepartment(deleteTarget.id)
      if (res?.success) {
        toast.success('Department deleted')
        setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id))
        setDeleteTarget(null)
      } else {
        toast.error(res?.message || 'Failed to delete department')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete department')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Hospital configuration.</p>

      <div className="mt-6 card space-y-4 p-6">
        <SettingField icon={FaHospital} label="Hospital Name" value={form.name} onChange={(v) => update('name', v)} />
        <SettingField icon={FaHospital} label="Address" value={form.address} onChange={(v) => update('address', v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SettingField icon={FaPhone} label="Phone" value={form.phone} onChange={(v) => update('phone', v)} />
          <SettingField icon={FaEnvelope} label="Email" value={form.email} onChange={(v) => update('email', v)} />
          <SettingField icon={FaPhone} label="Emergency Number" value={form.emergency} onChange={(v) => update('emergency', v)} />
          <SettingField icon={FaClock} label="Working Hours" value={form.hours} onChange={(v) => update('hours', v)} />
        </div>
        <LoadingButton loading={savingSettings} onClick={handleSaveSettings} className="btn-primary">
          <FaSave /> Save Settings
        </LoadingButton>
      </div>

      {/* Departments */}
      <div id="departments" className="mt-8 card space-y-4 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
        <p className="text-sm text-slate-500">Add and manage hospital departments.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Department Name</label>
            <input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="input"
              placeholder="e.g. Cardiology"
            />
          </div>
          <div>
            <label className="label">Description</label>
            <input
              value={deptDesc}
              onChange={(e) => setDeptDesc(e.target.value)}
              className="input"
              placeholder="Optional description"
            />
          </div>
        </div>
        <LoadingButton loading={savingDept} onClick={handleAddDepartment} className="btn-primary">
          <FaPlus /> Add Department
        </LoadingButton>

        {loadingDepts ? (
          <LoadingSpinner text="Loading departments..." />
        ) : (
          <div className="mt-4 space-y-2">
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500">No departments yet.</p>
            ) : (
              departments.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-800">{d.name}</p>
                    {d.description && (
                      <p className="text-xs text-slate-500">{d.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setDeleteTarget(d)}
                    className="btn-ghost px-3 py-2 text-xs text-red-500"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDepartment}
        loading={deleting}
        title="Delete Department"
        message={
          deleteTarget
            ? `Are you sure you want to delete the "${deleteTarget.name}" department? This action cannot be undone.`
            : 'Are you sure you want to delete this department?'
        }
        confirmLabel="Delete Department"
      />
    </div>
  )
}

function SettingField({ icon: Icon, label, value, onChange }) {
  return (
    <div>
      <label className="label flex items-center gap-2">
        <Icon className="text-primary-500" /> {label}
      </label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input" />
    </div>
  )
}
