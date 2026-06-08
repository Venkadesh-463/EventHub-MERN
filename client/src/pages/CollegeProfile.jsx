import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Calendar, MapPin, Globe, Mail, ArrowLeft, ArrowRight, Flame, Clock, Upload, Search, Filter, BookOpen } from 'lucide-react'

const CollegeProfile = () => {
  const { id } = useParams()
  const [college, setCollege] = useState(null)
  const [events, setEvents] = useState([])
  const { userInfo } = useSelector(state => state.user)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState('All')

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    try {
      setUploading(true)
      const res = await axiosInstance.put(`/colleges/${id}/logo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setCollege({ ...college, logo: res.data.data.logoUrl })
      alert('Logo uploaded successfully!')
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    const fetchCollegeData = async () => {
      try {
        const [collegeRes, eventsRes] = await Promise.all([
          axiosInstance.get(`/colleges/${id}`),
          axiosInstance.get(`/events`)
        ])
        setCollege(collegeRes.data)
        const collegeEvents = eventsRes.data.filter(e => (e.college?._id || e.organizer?.college?._id || e.college) === id)
        setEvents(collegeEvents)
      } catch (err) {
        console.error('Failed to fetch college data')
      } finally {
        setLoading(false)
      }
    }
    fetchCollegeData()
  }, [id])

  // Derive unique departments
  const departments = ['All', ...new Set(events.map(e => e.department).filter(Boolean))]

  // Filter Logic
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesDept = selectedDept === 'All' || event.department === selectedDept
    return matchesSearch && matchesDept
  })

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading College Hub...</div>
  if (!college) return <div style={{ textAlign: 'center', padding: '5rem' }}>College not found.</div>

  return (
    <div className="container">
      <Link to="/colleges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', marginBottom: '2rem', fontWeight: '600', textDecoration: 'none' }}>
        <ArrowLeft size={18} /> Back to Campuses
      </Link>

      {/* College Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card" 
        style={{ padding: '3rem', marginBottom: '4rem', display: 'flex', gap: '3rem', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <div style={{ 
          width: '120px', height: '120px', borderRadius: '24px', 
          backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
          position: 'relative'
        }}>
          {college.logo ? (
            <img src={college.logo} alt={college.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Globe size={48} color="#cbd5e1" />
          )}

          {userInfo && (userInfo.role === 'admin' || (userInfo.college?._id || userInfo.college) === college._id) && (
            <label style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, 
              backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', 
              textAlign: 'center', padding: '0.3rem', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.2rem'
            }}>
              {uploading ? '...' : <><Upload size={12} /> Upload</>}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} disabled={uploading} />
            </label>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>{college.name}</h1>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <MapPin size={18} /> {college.location}
            </div>
            {college.website && (
              <a href={college.website} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', fontWeight: '600' }}>
                <Globe size={18} /> Visit Website
              </a>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
              <Mail size={18} /> {college.adminEmail || college.email}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '1.5rem 2.5rem', backgroundColor: '#f8fafc', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Events</p>
          <p style={{ fontSize: '2.5rem', fontWeight: '800', color: '#0f172a' }}>{events.length}</p>
        </div>
      </motion.div>

      {/* Search and Filters Section */}
      <div style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>College Events</h2>
            <p style={{ color: '#64748b' }}>Discover events organized by various departments at {college.name}.</p>
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', 
            backgroundColor: '#fff', padding: '0.75rem 1.25rem', 
            borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px'
          }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search events by title..." 
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Department Chips */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem', color: '#475569', fontWeight: '700', fontSize: '0.9rem' }}>
            <Filter size={16} /> Departments:
          </div>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '12px',
                border: '1.5px solid',
                borderColor: selectedDept === dept ? '#6366f1' : '#e2e8f0',
                backgroundColor: selectedDept === dept ? '#6366f1' : 'white',
                color: selectedDept === dept ? 'white' : '#64748b',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: selectedDept === dept ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
              }}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      <div className="interactive-grid">
        <AnimatePresence mode='popLayout'>
          {filteredEvents.map((event) => (
            <motion.div
              layout
              key={event._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card"
              style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ height: '180px', backgroundColor: '#f1f5f9', position: 'relative', overflow: 'hidden' }}>
                {event.poster ? (
                  <img src={event.poster} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    <Calendar size={48} />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '700', color: '#6366f1', backdropFilter: 'blur(4px)' }}>
                    {event.category}
                  </div>
                  {event.registeredStudents?.length > 5 && (
                    <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Flame size={12} /> HOT
                    </div>
                  )}
                </div>
                
                {/* Department Badge Overlay */}
                <div style={{ 
                  position: 'absolute', bottom: '0.75rem', left: '0.75rem', 
                  backgroundColor: 'rgba(15, 23, 42, 0.8)', color: 'white', 
                  padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.7rem', 
                  fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem',
                  backdropFilter: 'blur(4px)'
                }}>
                  <BookOpen size={12} /> {event.department || 'General'}
                </div>
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>{event.title}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Calendar size={14} color="#6366f1" /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <MapPin size={14} color="#6366f1" /> {event.location}
                  </div>
                </div>
                <Link to={`/events/${event._id}`} className="btn-primary" style={{ width: '100%', marginTop: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  View Event <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0', backgroundColor: '#f8fafc', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
          <Search size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#475569', fontWeight: '800' }}>No events found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters to discover more events.</p>
          {(searchTerm || selectedDept !== 'All') && (
            <button 
              onClick={() => { setSearchTerm(''); setSelectedDept('All'); }}
              style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: '#6366f1', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default CollegeProfile
