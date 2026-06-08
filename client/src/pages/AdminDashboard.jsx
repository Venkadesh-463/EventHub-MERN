import React, { useState, useEffect } from 'react'
import axiosInstance from '../services/axiosInstance'
import { motion } from 'framer-motion'
import { UserPlus, Trash2, Shield, Users, Key, Building2 } from 'lucide-react'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [collegeData, setCollegeData] = useState({ adminName: '', email: '', password: '', collegeName: '', collegeLocation: '' })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/users')
      setUsers(data.data)
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  const handleCreateCollege = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post('/admin/create-college', collegeData)
      setMessage({ type: 'success', text: 'College Admin created successfully!' })
      setCollegeData({ adminName: '', email: '', password: '', collegeName: '', collegeLocation: '' })
      fetchUsers()
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create' })
    }
  }

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin/users/${id}`)
        fetchUsers()
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  const handleResetPassword = async (id) => {
    const newPassword = window.prompt('Enter new password for this user (min 6 characters):')
    if (!newPassword) return; // User cancelled
    
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.')
      return;
    }

    try {
      await axiosInstance.put(`/admin/users/${id}/reset-password`, { newPassword })
      alert('Password updated successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password')
    }
  }

  const handleAssignCollege = async (id, email) => {
    const collegeName = window.prompt('Enter College Name to assign:')
    if (!collegeName) return
    const collegeLocation = window.prompt('Enter College Location:')
    if (!collegeLocation) return

    try {
      await axiosInstance.put(`/admin/users/${id}/assign-college`, { collegeName, collegeLocation, adminEmail: email })
      alert('College assigned successfully!')
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign college')
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="admin-container" 
      style={{ padding: '2rem 10%' }}
    >
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', fontWeight: '800' }}>
          <Shield size={36} color="#6366f1" /> Main Admin Control
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Manage college administrators and system users.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Create College Section */}
        <motion.section 
          initial={{ x: -20 }}
          animate={{ x: 0 }}
          className="card" 
          style={{ padding: '2.5rem' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.25rem' }}>
            <UserPlus size={22} color="#6366f1" /> Create College Admin
          </h3>
          
          {message.text && (
            <div style={{ 
              padding: '1rem', 
              borderRadius: '12px', 
              marginBottom: '2rem', 
              backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
              color: message.type === 'success' ? '#166534' : '#991b1b',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreateCollege} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>College Name</label>
              <input 
                type="text" 
                placeholder="e.g. Engineering College" 
                style={{ width: '100%' }}
                value={collegeData.collegeName}
                onChange={(e) => setCollegeData({...collegeData, collegeName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>College Location</label>
              <input 
                type="text" 
                placeholder="e.g. Hyderabad, TS" 
                style={{ width: '100%' }}
                value={collegeData.collegeLocation}
                onChange={(e) => setCollegeData({...collegeData, collegeLocation: e.target.value})}
                required
              />
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '0.5rem 0' }} />
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Admin Name</label>
              <input 
                type="text" 
                placeholder="e.g. Dr. R. Venkatesh" 
                style={{ width: '100%' }}
                value={collegeData.adminName}
                onChange={(e) => setCollegeData({...collegeData, adminName: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Admin Email</label>
              <input 
                type="email" 
                placeholder="college@university.edu" 
                style={{ width: '100%' }}
                value={collegeData.email}
                onChange={(e) => setCollegeData({...collegeData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Default Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{ width: '100%' }}
                value={collegeData.password}
                onChange={(e) => setCollegeData({...collegeData, password: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}>
              Create Admin Account
            </button>
          </form>
        </motion.section>

        {/* Users List Section */}
        <motion.section 
          initial={{ x: 20 }}
          animate={{ x: 0 }}
          className="card" 
          style={{ padding: '2.5rem' }}
        >
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '1.25rem' }}>
            <Users size={22} color="#6366f1" /> System Users
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                  <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Name</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Role</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Email</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#64748b', fontSize: '0.9rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1.25rem 1rem', fontWeight: '600' }}>{user.name}</td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ 
                        padding: '0.3rem 0.75rem', 
                        borderRadius: '8px', 
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        backgroundColor: user.role === 'admin' ? '#fef3c7' : user.role === 'college' ? '#e0e7ff' : '#f1f5f9',
                        color: user.role === 'admin' ? '#92400e' : user.role === 'college' ? '#3730a3' : '#64748b'
                      }}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1rem', color: '#64748b' }}>{user.email}</td>
                    <td style={{ padding: '1.25rem 1rem' }}>
                      {user.role === 'college' ? (
                        <span style={{ 
                          padding: '0.3rem 0.75rem', 
                          borderRadius: '8px', 
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: user.college ? '#dcfce7' : '#fee2e2',
                          color: user.college ? '#166534' : '#991b1b'
                        }}>
                          {user.college ? 'Successful' : 'Unsuccessful'}
                        </span>
                      ) : (
                        <span style={{ color: '#cbd5e1' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                      {user.role !== 'admin' && (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          {user.role === 'college' && !user.college && (
                            <button 
                              onClick={() => handleAssignCollege(user._id, user.email)}
                              title="Assign College"
                              style={{ color: '#3b82f6', backgroundColor: 'transparent', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                            >
                              <Building2 size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleResetPassword(user._id)}
                            title="Reset Password"
                            style={{ color: '#eab308', backgroundColor: 'transparent', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                          >
                            <Key size={18} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            title="Delete User"
                            style={{ color: '#ef4444', backgroundColor: 'transparent', padding: '0.5rem', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}

export default AdminDashboard
