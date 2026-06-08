import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import registrationService from '../services/RegistrationService'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Tag, Users, MessageSquare, Send, Trash2, ArrowLeft, ShieldCheck, Building2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userInfo } = useSelector((state) => state.user)

  const [event, setEvent] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [teamMode, setTeamMode] = useState('create') // 'create' or 'join'
  const [teamName, setTeamName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [eventRes, commentRes] = await Promise.all([
        axiosInstance.get(`/events/${id}`),
        axiosInstance.get(`/comments/${id}`)
      ])
      setEvent(eventRes.data)
      setComments(commentRes.data.data)
    } catch (err) {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!userInfo) {
      alert('Please login to register')
      navigate('/login')
      return
    }

    if (!event.isFree) {
      navigate(`/payment/${id}`)
      return
    }

    try {
      await registrationService.registerForEvent({ eventId: id })
      alert('Successfully registered!')
      navigate('/my-events')
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed')
    }
  }

  const handleTeamAction = async (e) => {
    e.preventDefault()
    if (!userInfo) {
      alert('Please login first')
      navigate('/login')
      return
    }

    try {
      if (teamMode === 'create') {
        const { data } = await axiosInstance.post('/teams/create', { name: teamName, eventId: id })
        alert(`Team created! Invite Code: ${data.data.inviteCode}`)
      } else {
        await axiosInstance.post(`/teams/join/${inviteCode}`)
        alert('Joined team successfully!')
      }
      setShowTeamModal(false)
      navigate('/my-events')
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed')
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const { data } = await axiosInstance.post('/comments', {
        eventId: id,
        text: newComment
      })
      setComments([data.data, ...comments])
      setNewComment('')
    } catch (err) {
      alert('Failed to post comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/comments/${commentId}`)
      setComments(comments.filter(c => c._id !== commentId))
    } catch (err) {
      alert('Failed to delete comment')
    }
  }

  const handleDeleteEvent = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await axiosInstance.delete(`/events/${id}`)
        alert('Event deleted successfully')
        navigate('/events')
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete event')
      }
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading details...</div>
  if (!event) return <div style={{ textAlign: 'center', padding: '5rem' }}>Event not found</div>

  return (
    <div style={{ padding: '2rem 10%', minHeight: '100vh' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', marginBottom: '2rem', cursor: 'pointer' }}
      >
        <ArrowLeft size={18} /> Back to Events
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
        {/* Left Side: Event Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{ height: '350px', backgroundColor: '#f1f5f9' }}>
              {event.poster ? (
                <img src={event.poster} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                  <Tag size={80} />
                </div>
              )}
            </div>
            <div style={{ padding: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.2, marginBottom: '0.5rem' }}>{event.title}</h1>
                  <span style={{ 
                    backgroundColor: '#e0e7ff', 
                    color: '#4338ca', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '100px', 
                    fontSize: '0.8rem', 
                    fontWeight: '700' 
                  }}>
                    {event.category}
                  </span>
                </div>
                {(userInfo?._id === event.organizer?._id || userInfo?.role === 'admin') && (
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteEvent}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1rem', borderRadius: '12px',
                      border: '1px solid #fee2e2', backgroundColor: '#fff',
                      color: '#ef4444', fontWeight: '600', cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Trash2 size={16} /> Delete Event
                  </motion.button>
                )}
              </div>

              {/* College Banner */}
              {(() => {
                const college = event.college || event.organizer?.college
                if (!college) return null
                return (
                  <Link 
                    to={`/colleges/${college._id}`}
                    style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
                      backgroundColor: '#f5f3ff', border: '1.5px solid #e0e7ff', 
                      borderRadius: '12px', padding: '0.75rem 1.25rem', 
                      marginBottom: '2rem', textDecoration: 'none' 
                    }}
                  >
                    <Building2 size={20} color="#6366f1" />
                    <div>
                      <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.1rem' }}>Hosted By</p>
                      <p style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{college.name}</p>
                    </div>
                  </Link>
                )
              })()}

              <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                  <Calendar size={20} color="#6366f1" />
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Date & Time</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>
                      {new Date(event.date).toLocaleDateString('en-US', { dateStyle: 'full' })} 
                      {event.time && ` • ${event.time}`}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                  <MapPin size={20} color="#6366f1" />
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Venue</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{event.location}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                  <Users size={20} color="#6366f1" />
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Department</p>
                    <p style={{ fontWeight: '600', color: '#1e293b' }}>{event.department}</p>
                  </div>
                </div>
              </div>

              <h3 style={{ marginBottom: '1rem', fontWeight: '700' }}>About Event</h3>
              <p style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>{event.description}</p>

              {/* Venue Map Section */}
              {event.coordinates && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={20} color="#6366f1" /> Venue Location
                  </h3>
                  <div id="details-map" style={{ height: '300px', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}></div>
                  
                  {/* Leaflet Initialization */}
                  <script dangerouslySetInnerHTML={{ __html: `
                    (function() {
                      const initMap = () => {
                        const mapEl = document.getElementById('details-map');
                        if (!mapEl || mapEl._leaflet_id) return;
                        
                        const coords = [${Array.isArray(event.coordinates) ? event.coordinates[0] : event.coordinates.lat}, ${Array.isArray(event.coordinates) ? event.coordinates[1] : event.coordinates.lng}];
                        const map = L.map('details-map').setView(coords, 15);
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                        L.marker(coords).addTo(map).bindPopup('${event.location}').openPopup();
                        setTimeout(() => map.invalidateSize(), 500);
                      };
                      setTimeout(initMap, 800);
                    })();
                  `}} />

                  <button 
                    onClick={() => {
                      const lat = Array.isArray(event.coordinates) ? event.coordinates[0] : event.coordinates.lat;
                      const lng = Array.isArray(event.coordinates) ? event.coordinates[1] : event.coordinates.lng;
                      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
                    }}
                    style={{ 
                      marginTop: '1rem', width: '100%', padding: '0.75rem', borderRadius: '12px', 
                      backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', 
                      fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                    }}
                  >
                    <MapPin size={16} /> Open in Google Maps
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Registration Section */}
          <div className="card" style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
            <div>
              <h3 style={{ marginBottom: '0.25rem' }}>{event.isTeamEvent ? 'Register as a Team' : 'Want to attend?'}</h3>
              <p style={{ color: '#64748b' }}>
                {event.isTeamEvent 
                  ? `Gather ${event.minTeamSize}-${event.maxTeamSize} members for this event.` 
                  : 'Join the event to get your QR ticket and certificate.'}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              {event.isTeamEvent ? (
                <>
                  <button 
                    onClick={() => { setTeamMode('join'); setShowTeamModal(true); }}
                    style={{ padding: '1rem 1.5rem', borderRadius: '12px', border: '1.5px solid #6366f1', color: '#6366f1', fontWeight: '700', cursor: 'pointer' }}
                  >Join Team</button>
                  <button 
                    onClick={() => { setTeamMode('create'); setShowTeamModal(true); }}
                    className="btn-primary" style={{ padding: '1rem 1.5rem' }}
                  >Create Team</button>
                </>
              ) : (
                <button 
                  onClick={() => (userInfo?.role === 'student' || !userInfo) ? handleRegister() : navigate('/scanner')}
                  className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                >
                  {userInfo?.role === 'student' || !userInfo ? 'Register Now' : 'Go to Scanner'}
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Team Modal */}
        <AnimatePresence>
          {showTeamModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <h2 style={{ marginBottom: '0.5rem' }}>{teamMode === 'create' ? 'Create a Team' : 'Join a Team'}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  {teamMode === 'create' ? 'Give your team a name and share the code with friends.' : 'Enter the invite code shared by your team leader.'}
                </p>
                
                <form onSubmit={handleTeamAction}>
                  {teamMode === 'create' ? (
                    <div className="form-group">
                      <label>Team Name</label>
                      <input type="text" required value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="e.g. Code Warriors" />
                    </div>
                  ) : (
                    <div className="form-group">
                      <label>Invite Code</label>
                      <input type="text" required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="e.g. A1B2C3" />
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setShowTeamModal(false)} style={{ padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'none', cursor: 'pointer' }}>Cancel</button>
                    <button type="submit" className="btn-primary">{teamMode === 'create' ? 'Create' : 'Join'}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Right Side: Discussion Board */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '2rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <MessageSquare size={24} color="#6366f1" /> Discussion Board
            </h3>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative' }}>
                <textarea 
                  placeholder="Ask a question or share an update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    paddingRight: '3.5rem',
                    minHeight: '100px', 
                    borderRadius: '16px',
                    border: '2px solid #e2e8f0'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!userInfo}
                  style={{ 
                    position: 'absolute', 
                    bottom: '10px', 
                    right: '10px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
              {!userInfo && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem' }}>Please login to participate in the discussion.</p>}
            </form>

            {/* Comments List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div 
                    key={comment._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ position: 'relative' }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'start' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px', 
                        backgroundColor: comment.user.role === 'college' ? '#e0e7ff' : '#f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: comment.user.role === 'college' ? '#4338ca' : '#64748b',
                        fontWeight: '700',
                        fontSize: '0.8rem'
                      }}>
                        {comment.user.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{comment.user.name}</span>
                          {comment.user.role === 'college' && <ShieldCheck size={14} color="#6366f1" title="Organizer" />}
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>• {new Date(comment.user.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: 1.5 }}>{comment.text}</p>
                      </div>
                      {(userInfo?._id === comment.user._id || userInfo?.role === 'admin') && (
                        <button 
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {comments.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  <p>No questions yet. Be the first to ask!</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default EventDetails
