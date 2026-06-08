import React, { useState, useEffect } from 'react'
import axiosInstance from '../services/axiosInstance'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BarChart2, Users, Calendar, CheckCircle, Award, Download } from 'lucide-react'

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

const StatCard = ({ icon, label, value, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
    style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem' }}
  >
    <div style={{
      width: '56px', height: '56px', borderRadius: '16px',
      backgroundColor: `${color}15`, display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0
    }}>
      {React.cloneElement(icon, { size: 28, color })}
    </div>
    <div>
      <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a' }}>{value}</p>
    </div>
  </motion.div>
)

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.user)
  const [analytics, setAnalytics] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!userInfo) {
      setLoading(false)
      return
    }

    const fetchAnalytics = async () => {
      setError('')
      try {
        const endpoint = userInfo?.role === 'admin' ? '/analytics/admin' : 
                         userInfo?.role === 'student' ? '/analytics/student' : '/analytics/college'
        const { data } = await axiosInstance.get(endpoint)
        setAnalytics(data.data)
        
        if (userInfo?.role === 'college') {
          const reportRes = await axiosInstance.get('/analytics/college/report')
          setReportData(reportRes.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch analytics', err)
        if (err.response?.status === 401) {
          setError('Session expired. Please login again.')
        } else {
          setError('Failed to load dashboard data. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [userInfo])

  const downloadCSV = () => {
    if (!reportData || !reportData.registrations) return;

    const headers = ['Student Name', 'Email', 'Event Title', 'Status', 'Registration Date'];
    const rows = reportData.registrations.map(reg => [
      reg.student?.name || 'N/A',
      reg.student?.email || 'N/A',
      reg.event?.title || 'N/A',
      reg.status,
      new Date(reg.registeredAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'participation_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
        <Calendar size={40} color="#6366f1" />
      </motion.div>
    </div>
  )

  if (!userInfo) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h2 style={{ marginBottom: '1rem' }}>Please Login</h2>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>You need to be logged in to view your dashboard.</p>
      <button onClick={() => navigate('/login')} className="btn-primary">Go to Login</button>
    </div>
  )

  if (error) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
      <button onClick={() => navigate('/login')} className="btn-primary">Go to Login</button>
    </div>
  )

  if (!analytics) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <p style={{ color: '#94a3b8' }}>No data available.</p>
    </div>
  )

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: '#64748b' }}>
          {userInfo?.role === 'admin' ? 'Platform-wide statistics and trends.' : 
           userInfo?.role === 'student' ? 'Your participation history and achievements.' : 'Your event performance and attendance insights.'}
        </p>
      </header>


      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <StatCard icon={<Calendar />} label="Total Events" value={analytics.totalEvents} color="#6366f1" />
        <StatCard icon={<Users />} label="Total Registrations" value={analytics.totalRegistrations} color="#a855f7" />
        <StatCard icon={<CheckCircle />} label="Total Attended" value={analytics.totalAttended} color="#10b981" />
        {analytics.attendanceRate !== undefined && (
          <StatCard icon={<Award />} label="Attendance Rate" value={`${analytics.attendanceRate}%`} color="#f59e0b" />
        )}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Category / Trend Chart */}
        {analytics.categoryChart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Events by Category</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.categoryChart} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {analytics.categoryChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {analytics.trendChart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Monthly Event Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={analytics.trendChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="events" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Department Chart */}
        {analytics.departmentChart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Events by Department</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.departmentChart} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name }) => name}>
                  {analytics.departmentChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Event Registration Chart */}
        {analytics.eventStats && analytics.eventStats.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: '700' }}>Registrations vs Attendance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.eventStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="registered" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attended" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Detailed Report Section for College Admins */}
      {userInfo?.role === 'college' && reportData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Detailed Participation Report</h2>
              {reportData.mostParticipatedEvent && (
                <p style={{ color: '#10b981', fontWeight: '600' }}>
                  Top Event: {reportData.mostParticipatedEvent.title} ({reportData.mostParticipatedEvent.count} Registrations)
                </p>
              )}
            </div>
            <button 
              onClick={downloadCSV}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4f46e5'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#6366f1'}
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Student Name</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Email</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Event</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: '600', color: '#475569' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.registrations.map((reg) => (
                  <tr key={reg._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', color: '#0f172a', fontWeight: '500' }}>{reg.student?.name || 'Unknown'}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{reg.student?.email || 'N/A'}</td>
                    <td style={{ padding: '1rem', color: '#0f172a' }}>{reg.event?.title || 'Unknown Event'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600',
                        backgroundColor: reg.status === 'attended' ? '#dcfce7' : reg.status === 'registered' ? '#dbeafe' : '#fef08a',
                        color: reg.status === 'attended' ? '#166534' : reg.status === 'registered' ? '#1e40af' : '#854d0e'
                      }}>
                        {reg.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{new Date(reg.registeredAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {reportData.registrations.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No registrations found for your events.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard
