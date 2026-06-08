import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import registrationService from '../services/RegistrationService'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Tag, Search, Filter, ArrowRight, IndianRupee, Image as ImageIcon, Flame, Clock, Building2, Map as MapIcon, LayoutGrid } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Events = () => {
  const [events, setEvents] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [collegeFilter, setCollegeFilter] = useState('All')
  const [paymentModal, setPaymentModal] = useState(null) // stores event object if paid
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'map'
  const { userInfo } = useSelector((state) => state.user)
  const navigate = useNavigate()

  // Derive unique colleges — check direct college field OR organizer's college (legacy events)
  const colleges = [
    { _id: 'All', name: 'All Colleges' },
    ...Object.values(
      events
        .map(e => e.college || e.organizer?.college)
        .filter(Boolean)
        .reduce((acc, col) => {
          acc[col._id] = col
          return acc
        }, {})
    )
  ]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data } = await axiosInstance.get('/events')
      setEvents(data)
    } catch (err) {
      console.error('Failed to fetch events')
    }
  }

  const handleRegister = async (eventId) => {
    if (!userInfo) {
      alert('Please login to register for events')
      return
    }
    try {
      await registrationService.registerForEvent(eventId)
      alert('Successfully registered! Check your "My Events" page for the QR code.')
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed')
    }
  }

  const filteredEvents = events
    .map(event => {
      let score = 0
      const searchLower = searchTerm.toLowerCase()
      
      if (searchTerm) {
        if (event.title.toLowerCase().includes(searchLower)) score += 10
        if (event.category.toLowerCase().includes(searchLower)) score += 5
        if (event.description.toLowerCase().includes(searchLower)) score += 2
        
        // Fuzzy matching (simple version)
        if (event.title.toLowerCase().split(' ').some(word => word.startsWith(searchLower))) score += 5
      }

      // Boost "Hot" events (more than 5 registrations)
      if (event.registeredStudents?.length > 5) score += 3
      
      // Boost "Upcoming Soon" events (next 7 days)
      const eventDate = new Date(event.date)
      const now = new Date()
      const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24)
      if (diffDays > 0 && diffDays <= 7) score += 5

      return { ...event, score }
    })
    .filter(event => {
      const matchesSearch = !searchTerm || event.score > 0
      const matchesCategory = categoryFilter === 'All' || event.category === categoryFilter
      const resolvedCollegeId = event.college?._id || event.organizer?.college?._id
      const matchesCollege = collegeFilter === 'All' || resolvedCollegeId === collegeFilter
      return matchesSearch && matchesCategory && matchesCollege
    })
    .sort((a, b) => b.score - a.score)

  const handleRegisterClick = (event) => {
    if (!userInfo) {
      alert('Please login to register for events');
      return;
    }

    if (userInfo.role !== 'student') {
      navigate(`/events/${event._id}`);
      return;
    }

    if (!event.isFree) {
      setPaymentModal(event);
    } else {
      handleRegister(event._id);
    }
  };

  const [proofFile, setProofFile] = useState(null)

  const handlePaymentComplete = async () => {
    if (paymentModal) {
      if (!proofFile) {
        alert('Please upload your payment screenshot first.');
        return;
      }
      
      const formData = new FormData();
      formData.append('eventId', paymentModal._id);
      formData.append('paymentProof', proofFile);

      try {
        await axiosInstance.post('/registrations', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Registration request submitted! Wait for organizer verification.');
        setPaymentModal(null);
        setProofFile(null);
        fetchEvents();
      } catch (err) {
        alert(err.response?.data?.message || 'Registration failed');
      }
    }
  };

  return (
    <div className="container">
      {/* Payment Modal */}
      {paymentModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000,
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card" 
            style={{ width: '90%', maxWidth: '450px', padding: '2rem', position: 'relative' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#fff7ed', width: '60px', height: '60px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <IndianRupee size={30} color="#f59e0b" />
              </div>
              <h2 style={{ fontSize: '1.5rem' }}>Registration Fee Required</h2>
              <p style={{ color: '#64748b' }}>This is a premium event hosted by {paymentModal.organizer?.name || 'College'}</p>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>Amount to Pay</span>
                <span style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b' }}>₹{paymentModal.price}</span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>UPI ID (Pay Here)</label>
                <div style={{ background: '#fff', padding: '0.8rem', borderRadius: '8px', border: '1px solid #6366f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontWeight: '700', color: '#1e293b' }}>{paymentModal.paymentUPI}</code>
                  <button onClick={() => { navigator.clipboard.writeText(paymentModal.paymentUPI); alert('UPI ID Copied!'); }} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}>COPY</button>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Instructions</label>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.4' }}>{paymentModal.paymentInstructions}</p>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6366f1', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Upload Screenshot</label>
                <div 
                  onClick={() => document.getElementById('payment-proof').click()}
                  style={{ 
                    border: '2px dashed #6366f1', borderRadius: '12px', padding: '1rem', 
                    textAlign: 'center', background: 'white', cursor: 'pointer' 
                  }}
                >
                  <input 
                    type="file" id="payment-proof" hidden accept="image/*"
                    onChange={(e) => setProofFile(e.target.files[0])}
                  />
                  {proofFile ? (
                    <p style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: '600' }}>✓ {proofFile.name}</p>
                  ) : (
                    <div style={{ color: '#94a3b8' }}>
                      <ImageIcon size={20} style={{ marginBottom: '0.2rem' }} />
                      <p style={{ fontSize: '0.8rem' }}>Click to upload proof</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setPaymentModal(null)} 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: '600', cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={handlePaymentComplete}
                className="btn-primary" 
                style={{ flex: 2, padding: '0.8rem', justifyContent: 'center' }}
              >I Have Paid</button>
            </div>
            
            <p style={{ fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center', marginTop: '1rem' }}>By clicking 'I Have Paid', you confirm that you have transferred the amount to the provided UPI ID.</p>
          </motion.div>
        </div>
      )}

      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem' }}
        >
          Explore Events
        </motion.h1>
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Discover and register for the latest campus activities.</p>
      </header>

      {/* College Chips Bar */}
      {colleges.length > 1 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Filter by College:</span>
          {colleges.map(col => (
            <motion.button
              key={col._id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCollegeFilter(col._id)}
              style={{
                padding: '0.4rem 1rem',
                borderRadius: '999px',
                border: '1.5px solid',
                borderColor: collegeFilter === col._id ? '#6366f1' : '#e2e8f0',
                backgroundColor: collegeFilter === col._id ? '#6366f1' : 'white',
                color: collegeFilter === col._id ? 'white' : '#64748b',
                fontWeight: '700',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {col.name}
            </motion.button>
          ))}
          {collegeFilter !== 'All' && (
            <Link
              to={`/colleges/${collegeFilter}`}
              style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: '700', marginLeft: '0.5rem', textDecoration: 'underline' }}
            >
              View College Hub →
            </Link>
          )}
        </div>
      )}

      {/* Search and Filter Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '3rem', 
        backgroundColor: '#fff', 
        padding: '0.75rem', 
        borderRadius: '20px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem', borderRadius: '12px', marginRight: '1rem' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{ 
              padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: viewMode === 'grid' ? '#fff' : 'transparent',
              boxShadow: viewMode === 'grid' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', color: viewMode === 'grid' ? '#6366f1' : '#64748b'
            }}
          >
            <LayoutGrid size={18} /> Grid
          </button>
          <button 
            onClick={() => setViewMode('map')}
            style={{ 
              padding: '0.5rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              background: viewMode === 'map' ? '#fff' : 'transparent',
              boxShadow: viewMode === 'map' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', color: viewMode === 'map' ? '#6366f1' : '#64748b'
            }}
          >
            <MapIcon size={18} /> Map
          </button>
        </div>

        <div style={{ flex: '1', minWidth: '250px', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
          <Search size={20} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search events by name..." 
            style={{ border: 'none', background: 'transparent', width: '100%', padding: '0.6rem 0', outline: 'none' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '1px', height: '30px', backgroundColor: '#e2e8f0' }} className="nav-divider" />
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', marginLeft: 'auto' }}>
          <Filter size={20} color="#94a3b8" />
          <select 
            style={{ border: 'none', background: 'transparent', fontWeight: '600', cursor: 'pointer', padding: '0.6rem 0', outline: 'none' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Workshop">Workshop</option>
            <option value="Seminar">Seminar</option>
            <option value="Fest">Fest</option>
            <option value="Competition">Competition</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Cultural">Cultural</option>
            <option value="Sports">Sports</option>
            <option value="Guest Lecture">Guest Lecture</option>
            <option value="Placement Drive">Placement Drive</option>
            <option value="Orientation">Orientation</option>
          </select>
        </div>
      </div>

      {/* Events View */}
      {viewMode === 'grid' ? (
        <motion.div 
          layout
          className="interactive-grid"
        >
        <AnimatePresence>
          {filteredEvents.map((event) => (
            <motion.div
              layout
              key={event._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="card"
              style={{ padding: 0, display: 'flex', flexDirection: 'column' }}
            >
              {/* Event Poster Area */}
              <div style={{ 
                height: '200px', 
                backgroundColor: '#f1f5f9', 
                position: 'relative',
                overflow: 'hidden'
              }}>
                {event.poster ? (
                  <img 
                    src={event.poster} 
                    alt={event.title} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                    <Tag size={48} />
                  </div>
                )}
                <div style={{ 
                  position: 'absolute', 
                  top: '1rem', 
                  right: '1rem',
                  display: 'flex',
                  gap: '0.4rem',
                  flexDirection: 'column',
                  alignItems: 'flex-end'
                }}>
                  <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.9)', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '10px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    color: '#6366f1'
                  }}>
                    {event.category}
                  </div>
                  <div style={{ 
                    backgroundColor: event.isFree ? 'rgba(16,185,129,0.9)' : 'rgba(245,158,11,0.9)', 
                    padding: '0.3rem 0.7rem', 
                    borderRadius: '10px', 
                    fontSize: '0.75rem', 
                    fontWeight: '800',
                    color: 'white'
                  }}>
                    {event.isFree ? 'FREE' : `₹${event.price}`}
                  </div>
                  {/* Badges */}
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    {event.registeredStudents?.length > 5 && (
                      <div style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Flame size={12} /> HOT
                      </div>
                    )}
                    {(() => {
                      const diff = (new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24)
                      return diff > 0 && diff <= 3 && (
                        <div style={{ backgroundColor: '#6366f1', color: 'white', padding: '0.3rem 0.6rem', borderRadius: '8px', fontSize: '0.65rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <Clock size={12} /> SOON
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Event Content */}
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Resolve college from direct field OR via organizer (handles legacy events) */}
                {(() => {
                  const college = event.college || event.organizer?.college
                  if (!college) return null
                  return (
                    <Link
                      to={`/colleges/${college._id}`}
                      onClick={e => e.stopPropagation()}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        color: '#6366f1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '0.6rem',
                        textDecoration: 'none'
                      }}
                    >
                      <Building2 size={13} />
                      {college.name}
                    </Link>
                  )
                })()}
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: '700' }}>{event.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <Calendar size={14} /> {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                    <MapPin size={14} /> {event.location}
                  </div>
                </div>

                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#94a3b8', 
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {event.description}
                </p>

                <motion.button 
                  whileHover={{ gap: '1rem' }}
                  onClick={() => handleRegisterClick(event)}
                  className="btn-primary" 
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                >
                  {userInfo?.role === 'student' || !userInfo ? 'Register Now' : 'Organizer View'} <ArrowRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        </motion.div>
      ) : (
        <div style={{ height: '600px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <div id="global-map" style={{ height: '100%', width: '100%' }}></div>
          
          {/* Leaflet Initialization */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              const initMap = () => {
                const mapEl = document.getElementById('global-map');
                if (!mapEl || mapEl._leaflet_id) return;
                
                const map = L.map('global-map').setView([12.9716, 77.5946], 11);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                const events = ${JSON.stringify(filteredEvents.filter(e => e.coordinates).map(e => ({
                  title: e.title,
                  location: e.location,
                  id: e._id,
                  coords: e.coordinates
                })))};
                
                events.forEach(ev => {
                  const coords = Array.isArray(ev.coords) ? ev.coords : [ev.coords.lat, ev.coords.lng];
                  L.marker(coords).addTo(map).bindPopup(\`
                    <div style="padding: 0.5rem">
                      <h4 style="margin: 0 0 0.5rem 0">\${ev.title}</h4>
                      <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem">\${ev.location}</p>
                      <a href="/events/\${ev.id}" style="font-size: 0.8rem; font-weight: 700; color: #6366f1; text-decoration: none">View Details →</a>
                    </div>
                  \`);
                });
              };
              setTimeout(initMap, 100);
            })();
          `}} />
        </div>
      )}

      {filteredEvents.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Tag size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
          <h3>No events found</h3>
          <p style={{ color: '#94a3b8' }}>Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}

export default Events
