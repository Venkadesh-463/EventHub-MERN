import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Lock, CheckCircle, ArrowRight } from 'lucide-react'
import authService from '../services/authService'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      return setError('Passwords do not match')
    }
    
    setLoading(true)
    setError('')
    
    try {
      await authService.resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Token is invalid or has expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#eef2ff', width: '50px', height: '50px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Lock size={24} color="#6366f1" />
          </div>
          <h2>Reset Password</h2>
          <p style={{ color: '#64748b' }}>Enter your new password below</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#10b981', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
              <p style={{ fontWeight: '500' }}>Password reset successful!</p>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.5rem' }}>Redirecting to login page...</p>
            </div>
            <Link to="/login" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              Login Now <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                minLength={6}
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '1.5rem', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword
