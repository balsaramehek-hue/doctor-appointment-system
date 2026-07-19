import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import Admin from '../models/Admin.js'
import Doctor from '../models/Doctor.js'
import Department from '../models/Department.js'

/**
 * Seeds the database with demo data that matches the frontend dummy data:
 *  - 1 admin (admin@demo.com / admin123)
 *  - 6 doctors
 *  - 6 departments
 *
 * Run with: npm run seed
 * Safe to run multiple times (clears collections first).
 */
const departments = [
  { name: 'Cardiology', icon: '❤️', description: 'Heart & vascular care' },
  { name: 'Neurology', icon: '🧠', description: 'Brain & nervous system' },
  { name: 'Dermatology', icon: '🩹', description: 'Skin & hair care' },
  { name: 'Orthopedics', icon: '🦴', description: 'Bones & joints' },
  { name: 'Pediatrics', icon: '🧸', description: 'Child healthcare' },
  { name: 'General Medicine', icon: '🩺', description: 'Primary care' },
]

const doctors = [
  {
    name: 'Dr. Amit Patel',
    specialization: 'Cardiology',
    experience: 12,
    qualification: 'MD, DM (Cardiology)',
    fee: 800,
    rating: 4.8,
    reviews: 320,
    availableDays: ['Mon', 'Tue', 'Wed', 'Fri'],
    image: 'https://i.pravatar.cc/400?img=12',
    hospital: 'MediCare Heart Institute',
    about:
      'Dr. Amit Patel is a senior interventional cardiologist with over 12 years of experience in treating complex cardiac conditions, angioplasty and preventive cardiology.',
    education: [
      'MBBS — AIIMS, New Delhi',
      'MD (General Medicine) — PGIMER, Chandigarh',
      'DM (Cardiology) — Fortis Institute',
    ],
    slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
    status: 'active',
  },
  {
    name: 'Dr. Sneha Rao',
    specialization: 'Neurology',
    experience: 9,
    qualification: 'MD, DM (Neurology)',
    fee: 900,
    rating: 4.7,
    reviews: 210,
    availableDays: ['Mon', 'Wed', 'Thu', 'Sat'],
    image: 'https://i.pravatar.cc/400?img=45',
    hospital: 'MediCare Neuro Center',
    about:
      'Dr. Sneha Rao specializes in epilepsy, stroke management and movement disorders with a patient-centric approach to neurological rehabilitation.',
    education: [
      'MBBS — KMC, Manipal',
      'MD (Medicine) — JIPMER',
      'DM (Neurology) — NIMHANS, Bangalore',
    ],
    slots: ['10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'],
    status: 'active',
  },
  {
    name: 'Dr. Karan Mehta',
    specialization: 'Dermatology',
    experience: 7,
    qualification: 'MD (Dermatology)',
    fee: 600,
    rating: 4.6,
    reviews: 180,
    availableDays: ['Tue', 'Wed', 'Fri', 'Sat'],
    image: 'https://i.pravatar.cc/400?img=33',
    hospital: 'MediCare Skin Clinic',
    about:
      'Dr. Karan Mehta is a cosmetic and clinical dermatologist focused on acne, pigmentation and advanced laser therapies.',
    education: [
      'MBBS — SMS Medical College',
      'MD (Dermatology) — AIIMS, New Delhi',
    ],
    slots: ['9:30 AM', '11:00 AM', '12:30 PM', '5:00 PM'],
    status: 'active',
  },
  {
    name: 'Dr. Priya Nair',
    specialization: 'Orthopedics',
    experience: 14,
    qualification: 'MS (Ortho), MCh',
    fee: 1000,
    rating: 4.9,
    reviews: 410,
    availableDays: ['Mon', 'Tue', 'Thu', 'Fri'],
    image: 'https://i.pravatar.cc/400?img=47',
    hospital: 'MediCare Bone & Joint',
    about:
      'Dr. Priya Nair is a renowned orthopedic surgeon specializing in joint replacement and sports injury rehabilitation.',
    education: [
      'MBBS — CMC, Vellore',
      'MS (Orthopedics) — AIIMS',
      'MCh (Ortho) — UK',
    ],
    slots: ['8:30 AM', '10:00 AM', '12:00 PM', '3:30 PM'],
    status: 'active',
  },
  {
    name: 'Dr. Rohan Verma',
    specialization: 'Pediatrics',
    experience: 10,
    qualification: 'MD (Pediatrics)',
    fee: 500,
    rating: 4.8,
    reviews: 260,
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    image: 'https://i.pravatar.cc/400?img=15',
    hospital: 'MediCare Child Care',
    about:
      'Dr. Rohan Verma provides compassionate care for newborns, children and adolescents with a focus on immunization and growth.',
    education: [
      'MBBS — KGMC, Lucknow',
      'MD (Pediatrics) — AIIMS, New Delhi',
    ],
    slots: ['9:00 AM', '10:30 AM', '12:00 PM', '2:30 PM', '4:30 PM'],
    status: 'active',
  },
  {
    name: 'Dr. Anjali Shah',
    specialization: 'General Medicine',
    experience: 8,
    qualification: 'MBBS, MD (Internal Medicine)',
    fee: 450,
    rating: 4.5,
    reviews: 150,
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat'],
    image: 'https://i.pravatar.cc/400?img=20',
    hospital: 'MediCare Primary Care',
    about:
      'Dr. Anjali Shah manages chronic illnesses, preventive health checks and general wellness for all age groups.',
    education: [
      'MBBS — BJ Medical College',
      'MD (Internal Medicine) — SGPGI, Lucknow',
    ],
    slots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM'],
    status: 'active',
  },
]

const seed = async () => {
  await connectDB()

  // Clear existing
  await Admin.deleteMany({})
  await Doctor.deleteMany({})
  await Department.deleteMany({})

  // Admin — pass plaintext; the model's pre-save hook hashes it.
  await Admin.create({
    name: 'Admin',
    email: 'admin@demo.com',
    password: 'admin123',
  })

  // Demo patient for easy login testing
  const Patient = (await import('../models/Patient.js')).default
  await Patient.deleteMany({ email: 'patient@demo.com' })
  await Patient.create({
    name: 'Demo Patient',
    email: 'patient@demo.com',
    phone: '9876543210',
    password: 'Patient1',
  })

  // Departments
  await Department.insertMany(departments)

  // Doctors (map slots -> availableTimeSlots)
  const docs = doctors.map((d) => ({
    ...d,
    availableTimeSlots: d.slots,
    department: d.specialization,
  }))
  await Doctor.insertMany(docs)

  console.log('✅ Seed complete: 1 admin, 1 patient, 6 doctors, 6 departments')
  console.log('   Admin:   admin@demo.com / admin123')
  console.log('   Patient: patient@demo.com / Patient1')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
