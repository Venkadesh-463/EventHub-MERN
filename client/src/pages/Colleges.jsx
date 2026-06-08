import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { Building2, MapPin, Search, ArrowRight, Globe, ShieldCheck } from 'lucide-react'

const Colleges = () => {
  const [colleges, setColleges] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { userInfo } = useSelector(state => state.user)

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data } = await axiosInstance.get('/colleges')
        setColleges(data)
      } catch (err) {
        console.error('Failed to fetch colleges')
      } finally {
        setLoading(false)
      }
    }
    fetchColleges()
  }, [])

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    college.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748b' }}>Loading Colleges...</div>

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}
        >
          Explore Campuses
        </motion.h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Discover what's happening at your college or explore events across different institutions.
        </p>
      </header>

      {/* College Admin: Direct Link to Their College */}
      {userInfo?.role === 'college' && userInfo?.college && (
        <div style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
          <Link 
            to={`/colleges/${userInfo.college._id || userInfo.college}`}
            style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: '#f5f3ff', border: '1.5px solid #e0e7ff', borderRadius: '16px',
              padding: '1.25rem 1.5rem', textDecoration: 'none', transition: 'all 0.2s'
            }}
            className="card-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {userInfo.college.logo ? (
                  <img src={userInfo.college.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.2rem' }} />
                ) : (
                  <Building2 size={24} color="#6366f1" />
                )}
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheck size={14} /> My College Hub
                </p>
                <p style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                  {userInfo.college.name || 'Your College'}
                </p>
              </div>
            </div>
            <div style={{ backgroundColor: 'white', color: '#6366f1', padding: '0.6rem 1.2rem', borderRadius: '10px', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              Manage Profile <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        marginBottom: '3rem', 
        backgroundColor: '#fff', 
        padding: '0.75rem', 
        borderRadius: '20px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        alignItems: 'center',
        maxWidth: '800px',
        margin: '0 auto 3rem auto'
      }}>
        <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
          <Search size={20} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by college name or location..." 
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.6rem 0', outline: 'none', fontSize: '1rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Colleges Grid */}
      <motion.div layout className="interactive-grid">
        <AnimatePresence>
          {filteredColleges.map((college) => (
            <motion.div
              layout
              key={college._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{ padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #e2e8f0' }}
            >
              {/* College Header Area */}
              <div style={{ 
                height: '140px', 
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {college.logo ? (
                  <img 
                    src={college.logo} 
                    alt={college.name} 
                    style={{ width: '80px', height: '80px', objectFit: 'contain', backgroundColor: 'white', padding: '0.5rem', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }} 
                  />
                ) : (
                  <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                    <Building2 size={36} color="#94a3b8" />
                  </div>
                )}
              </div>

              {/* College Info */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '800', color: '#1e293b' }}>
                  {college.name}
                </h3>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>
                  <MapPin size={16} color="#6366f1" /> {college.location}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {college.website ? (
                    <a href={college.website} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}>
                      <Globe size={14} /> Website
                    </a>
                  ) : <span />}
                  
                  <Link 
                    to={`/colleges/${college._id}`} 
                    className="btn-primary" 
                    style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    View Events <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredColleges.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Building2 size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#475569' }}>No colleges found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  )
}

export default Colleges
