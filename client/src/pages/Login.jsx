import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { setCredentials } from '../redux/userSlice'
import authService from '../services/authService'
import { LogIn } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await authService.login({ email, password })
      // Use response.data because our server returns { success, message, data }
      dispatch(setCredentials(response.data))
      navigate('/dashboard')
    } catch (err) {
      // Show the specific error from the server if available (e.g. "Invalid email or password")
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      setError(errMsg)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#eef2ff', width: '50px', height: '50px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <LogIn size={24} color="#6366f1" />
          </div>
          <h2>Welcome Back</h2>
          <p style={{ color: '#64748b' }}>Enter your details to access your account</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
            <input 
              type="email" 
              placeholder="name@university.edu" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#6366f1', fontWeight: '500' }}>Forgot Password?</Link>
            </div>
            <input 
              type="password" 
              placeholder="••••••••" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            Sign In
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#6366f1', fontWeight: '600' }}>Register</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
