import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Events from '../pages/Events'
import Colleges from '../pages/Colleges'
import CreateEvent from '../pages/CreateEvent'
import MyEvents from '../pages/MyEvents'
import AdminDashboard from '../pages/AdminDashboard'
import QRScanner from '../pages/QRScanner'
import EventDetails from '../pages/EventDetails'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import CollegeProfile from '../pages/CollegeProfile'
import ManageEvents from '../pages/ManageEvents'
import Payment from '../pages/Payment'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/colleges" element={<Colleges />} />
      <Route path="/events" element={<Events />} />
      <Route path="/admin/control" element={<AdminDashboard />} />
      <Route path="/scanner" element={<QRScanner />} />
      <Route path="/create-event" element={<CreateEvent />} />
      <Route path="/events/:id" element={<EventDetails />} />
      <Route path="/my-events" element={<MyEvents />} />
      <Route path="/payment/:id" element={<Payment />} />
      <Route path="/colleges/:id" element={<CollegeProfile />} />
      <Route path="/manage-events" element={<ManageEvents />} />
    </Routes>
  )
}

export default AppRoutes
