# MediCare — Doctor Appointment Booking (Frontend)

A professional, production-quality healthcare appointment booking frontend built with **React + Vite + Tailwind CSS**.

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios (configured in `src/services/api.js` for future backend)
- React Hook Form (forms & validation)
- Context API (auth state)
- Framer Motion (animations)
- React Icons

## Getting Started
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173

## Demo Credentials
- **Patient:** patient@demo.com / password123
- **Admin:** admin@demo.com / admin123

## Folder Structure
```
src/
 ├── components/   (Navbar, Footer, DoctorCard, AppointmentCard, Sidebar, Modal, FormInput, LoadingSpinner)
 ├── pages/        (Home, DoctorList, DoctorDetails, Contact, Login, Register, BookAppointment, NotFound)
 ├── layouts/      (PublicLayout)
 ├── admin/        (AdminLogin, AdminLayout, Dashboard, ManageDoctors, ManagePatients, ManageAppointments, Messages, Settings)
 ├── patient/      (PatientLayout, Dashboard, Profile, Appointments, MedicalHistory)
 ├── services/     (api.js axios instance, dummyData.js)
 ├── context/      (AuthContext)
 ├── routes/       (ProtectedRoute)
 └── assets/
```

## Notes
- All data is dummy JSON in `src/services/dummyData.js`. Replace with API calls via `src/services/api.js` when backend is ready.
- No backend is included.
