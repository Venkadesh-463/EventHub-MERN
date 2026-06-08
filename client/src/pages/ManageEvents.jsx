import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, MapPin, Tag, Users, Edit3, Trash2, Plus,
  CheckCircle, Clock, XCircle, AlertTriangle, IndianRupee, CreditCard, Image as ImageIcon, ArrowLeft, Building2
} from 'lucide-react'

const STATUS_COLORS = {
  upcoming:  { bg: '#eff6ff', color: '#3b82f6', label: 'Upcoming' },
  ongoing:   { bg: '#f0fdf4', color: '#22c55e', label: 'Ongoing'  },
  completed: { bg: '#f8fafc', color: '#94a3b8', label: 'Completed'},
  cancelled: { bg: '#fef2f2', color: '#ef4444', label: 'Cancelled'},
}

/* ─── Edit Modal ─────────────────────────────────────────────── */
const EditModal = ({ event, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title:               event.title,
    description:         event.description,
    date:                event.date?.slice(0, 10) ?? '',
    time:                event.time ?? '',
    location:            event.location,
    category:            event.category,
    department:          event.department,
    capacity:            event.capacity,
    status:              event.status,
    isFree:              event.isFree,
    price:               event.price ?? '',
    paymentUPI:          event.paymentUPI ?? '',
    paymentInstructions: event.paymentInstructions ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await axiosInstance.put(`/events/${event._id}`, form)
      onSaved()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        style={{ margin: 0 }}
      />
    </div>
  )

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', padding: '1rem'
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card"
        style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', padding: '2.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>✏️ Edit Event</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1.5rem' }}>✕</button>
        </div>

        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {field('Event Title', 'title', 'text', 'Event name')}

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ minHeight: '100px', resize: 'vertical', margin: 0 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            {field('Date', 'date', 'date')}
            {field('Time', 'time', 'time')}
            {field('Venue / Location', 'location', 'text', 'e.g. Main Hall')}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ margin: 0 }}>
                {['Workshop','Seminar','Fest','Competition','Hackathon','Cultural','Sports','Guest Lecture','Placement Drive','Orientation'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={{ margin: 0 }}>
                {['Computer Science','Mechanical','Electrical','Civil','Management'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {field('Max Capacity', 'capacity', 'number', '0 = unlimited')}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ margin: 0 }}>
                {['upcoming','ongoing','completed','cancelled'].map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Section */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={16} color="#6366f1" /> Event Fee</span>
              <div style={{ display: 'flex', gap: '0.4rem', background: '#e2e8f0', borderRadius: '8px', padding: '3px' }}>
                {[true, false].map(val => (
                  <button key={String(val)} type="button"
                    onClick={() => setForm({ ...form, isFree: val })}
                    style={{ padding: '0.35rem 1rem', borderRadius: '6px', border: 'none', fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                      background: form.isFree === val ? '#6366f1' : 'transparent',
                      color:      form.isFree === val ? 'white' : '#64748b', transition: 'all 0.2s'
                    }}
                  >{val ? 'Free' : 'Paid'}</button>
                ))}
              </div>
            </div>
            {!form.isFree && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {field('Fee Amount (₹)', 'price', 'number', 'e.g. 199')}
                  {field('UPI Payment ID', 'paymentUPI', 'text', 'e.g. college@ybl')}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Payment Instructions</label>
                  <textarea value={form.paymentInstructions}
                    onChange={e => setForm({ ...form, paymentInstructions: e.target.value })}
                    style={{ minHeight: '70px', resize: 'vertical', margin: 0 }}
                  />
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose}
              style={{ flex: 1, padding: '0.9rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary"
              style={{ flex: 2, padding: '0.9rem', justifyContent: 'center', opacity: saving ? 0.7 : 1 }}
              disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────── */
const ManageEvents = () => {
  const [events, setEvents]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { userInfo } = useSelector(s => s.user)
  const navigate = useNavigate()

  const fetchMyEvents = async () => {
    try {
      const { data } = await axiosInstance.get('/events')
      // Only show events this user organised
      setEvents(data.filter(e => e.organizer?._id === userInfo?._id || e.organizer === userInfo?._id))
    } catch {
      console.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMyEvents() }, [])

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/events/${id}`)
      setDeleteConfirm(null)
      fetchMyEvents()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete event')
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#94a3b8' }}>Loading your events...</div>

  return (
    <div className="container">
      {/* Edit Modal */}
      <AnimatePresence>
        {editTarget && (
          <EditModal
            key="edit"
            event={editTarget}
            onClose={() => setEditTarget(null)}
            onSaved={fetchMyEvents}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div key="del-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="card" style={{ width: '90%', maxWidth: '420px', padding: '2rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <AlertTriangle size={32} color="#ef4444" />
              </div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Delete Event?</h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                "<strong>{deleteConfirm.title}</strong>" will be permanently removed along with all registrations. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '700', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(deleteConfirm._id)}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: 'none', background: '#ef4444', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.4rem' }}>Manage My Events</h1>
          <p style={{ color: '#64748b' }}>Edit, update status, or remove events you have hosted.</p>
        </div>
        <Link to="/create-event" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
          <Plus size={18} /> Host New Event
        </Link>
      </div>

      {/* College Identity Badge */}
      {userInfo?.college && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: '#f5f3ff', border: '1.5px solid #e0e7ff', borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '2rem' }}>
          <Building2 size={20} color="#6366f1" />
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.1rem' }}>Managing Events For</p>
            <p style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>{userInfo.college?.name || userInfo.college}</p>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '700' }}>Verified</span>
        </div>
      )}

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {Object.entries(STATUS_COLORS).map(([status, meta]) => (
          <div key={status} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.3rem' }}>
                {status === 'upcoming' ? '📅' : status === 'ongoing' ? '🟢' : status === 'completed' ? '✅' : '❌'}
              </span>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>{meta.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>{events.filter(e => e.status === status).length}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Calendar size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
          <h3>No events hosted yet</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Create your first event to get started.</p>
          <Link to="/create-event" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={18} /> Create Event
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {events.map(event => {
              const statusMeta = STATUS_COLORS[event.status] || STATUS_COLORS.upcoming
              return (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="card"
                  style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}
                >
                  {/* Poster thumbnail */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '16px', backgroundColor: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                    {event.poster
                      ? <img src={event.poster} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={28} color="#cbd5e1" /></div>
                    }
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0 }}>{event.title}</h3>
                      <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', backgroundColor: statusMeta.bg, color: statusMeta.color, fontSize: '0.72rem', fontWeight: '800' }}>
                        {statusMeta.label}
                      </span>
                      {!event.isFree && (
                        <span style={{ padding: '0.2rem 0.7rem', borderRadius: '999px', backgroundColor: '#fff7ed', color: '#f59e0b', fontSize: '0.72rem', fontWeight: '800' }}>
                          ₹{event.price}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                        <Calendar size={13} /> {new Date(event.date).toLocaleDateString()} {event.time && `at ${event.time}`}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                        <MapPin size={13} /> {event.location}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                        <Tag size={13} /> {event.category}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.82rem', color: '#64748b' }}>
                        <Users size={13} /> {event.registeredStudents?.length ?? 0} registered
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setEditTarget(event)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1.5px solid #6366f1', background: 'white', color: '#6366f1', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <Edit3 size={15} /> Edit
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => setDeleteConfirm(event)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', borderRadius: '10px', border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} /> Delete
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

export default ManageEvents
