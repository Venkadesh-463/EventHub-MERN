import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../redux/userSlice'
import { LogOut, Calendar, PlusCircle, LayoutDashboard, Shield, ScanLine, Ticket, Menu, X, Settings, Building2 } from 'lucide-react'
import Logo from './Logo'

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.user)
  const [isOpen, setIsOpen] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = () => {
    dispatch(logout())
    setIsOpen(false)
    navigate('/login')
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <nav className="navbar">
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <Link to="/" onClick={() => setIsOpen(false)} style={{ 
          fontSize: '1.4rem', 
          fontWeight: '800', 
          color: '#1e293b',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem'
        }}>
          <Logo />
        </Link>
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', display: 'block' }} className="nav-divider" />
      </div>

      {/* Mobile Menu Toggle */}
      <div className="mobile-toggle" onClick={toggleMenu} style={{ cursor: 'pointer', display: 'none', color: '#64748b' }}>
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </div>

      <div className={`nav-links ${isOpen ? 'active' : ''}`} style={{ 
        display: 'flex', 
        gap: '2rem', 
        alignItems: 'center' 
      }}>
        <Link to="/colleges" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} /> Colleges
        </Link>
        
        {userInfo ? (
          <>
            <Link to="/dashboard" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            {userInfo.role === 'admin' && (
              <Link to="/admin/control" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={18} /> Admin Control
              </Link>
            )}
            
            {userInfo.role === 'college' && (
              <Link to="/create-event" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PlusCircle size={18} /> Create Event
              </Link>
            )}

            {userInfo.role === 'college' && (
              <Link to="/manage-events" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Settings size={18} /> Manage Events
              </Link>
            )}

            {userInfo.role === 'college' && (
              <Link to="/scanner" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ScanLine size={18} /> Scanner
              </Link>
            )}

            {userInfo.role === 'student' && (
              <Link to="/my-events" className="nav-link" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={18} /> My Tickets
              </Link>
            )}
            
            <button onClick={handleLogout} className="btn-logout" style={{
              background: 'rgba(239, 68, 68, 0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={() => setIsOpen(false)} style={{ fontWeight: '700' }}>Login</Link>
            <Link to="/register" className="btn-primary" onClick={() => setIsOpen(false)} style={{ padding: '0.7rem 1.8rem', borderRadius: '12px', fontSize: '0.95rem' }}>Join Now</Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar
