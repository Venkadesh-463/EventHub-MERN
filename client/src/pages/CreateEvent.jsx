import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import { useSelector } from 'react-redux'
import { Calendar, MapPin, Tag, Users, AlignLeft, ArrowLeft, Image as ImageIcon, IndianRupee, CreditCard, Building2, Map as MapIcon } from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: '',
    department: '',
    capacity: 0,
    isFree: true,
    price: '',
    paymentUPI: '',
    paymentInstructions: '',
    isTeamEvent: false,
    minTeamSize: 1,
    maxTeamSize: 4,
    coordinates: [12.9716, 77.5946], // Default to a central location
  })
  const [poster, setPoster] = useState(null)
  const [error, setError] = useState('')
  const { userInfo } = useSelector(state => state.user)

  const navigate = useNavigate()


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('date', formData.date)
      data.append('time', formData.time)
      data.append('location', formData.location)
      data.append('category', formData.category)
      data.append('department', formData.department)
      data.append('capacity', formData.capacity)
      data.append('isFree', formData.isFree)
      data.append('price', formData.price || 0)
      data.append('paymentUPI', formData.paymentUPI || '')
      data.append('paymentInstructions', formData.paymentInstructions || '')
      data.append('isTeamEvent', formData.isTeamEvent)
      data.append('minTeamSize', formData.minTeamSize)
      data.append('maxTeamSize', formData.maxTeamSize)
      data.append('coordinates', JSON.stringify(formData.coordinates))
      if (poster) {
        data.append('poster', poster)
      }

      await axiosInstance.post('/events', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      navigate('/events')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event')
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: '500' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="card" style={{ padding: '2.5rem', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Host a New Event</h2>
          <p style={{ color: '#94a3b8' }}>Fill in the essential details to get your event live.</p>
        </header>

        {/* College Badge */}
        {userInfo?.college && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            backgroundColor: '#f5f3ff', border: '1.5px solid #e0e7ff',
            borderRadius: '12px', padding: '0.9rem 1.25rem', marginBottom: '1.5rem'
          }}>
            <Building2 size={20} color="#6366f1" />
            <div>
              <p style={{ fontSize: '0.72rem', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.1rem' }}>Hosting College</p>
              <p style={{ fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
                {userInfo.college?.name || userInfo.college}
              </p>
            </div>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '700' }}>Verified</span>
          </div>
        )}

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Event Title</label>
            <input 
              type="text" 
              placeholder="Give your event a catchy name" 
              required
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Event Logo / Poster</label>
            <div style={{ 
              border: '2px dashed #e2e8f0', 
              borderRadius: '12px', 
              padding: '2rem', 
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer'
            }} onClick={() => document.getElementById('poster-upload').click()}>
              {poster ? (
                <p style={{ color: '#6366f1', fontWeight: '600' }}>{poster.name}</p>
              ) : (
                <div style={{ color: '#94a3b8' }}>
                  <ImageIcon size={32} style={{ marginBottom: '0.5rem' }} />
                  <p>Click to upload event logo</p>
                </div>
              )}
              <input 
                id="poster-upload"
                type="file" 
                hidden
                onChange={(e) => setPoster(e.target.files[0])} 
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Detailed Description</label>
            <textarea 
              placeholder="What is this event about? Mention key highlights..." 
              required
              style={{ minHeight: '120px', resize: 'vertical' }}
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Date</label>
              <input 
                type="date" 
                required
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Time</label>
              <input 
                type="time" 
                required
                value={formData.time} 
                onChange={(e) => setFormData({...formData, time: e.target.value})} 
              />
            </div>

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Venue / Location</label>
              <input 
                type="text" 
                placeholder="e.g. Main Hall" 
                required
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>
          </div>

          {/* === TEAM SETTINGS SECTION === */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Users size={20} color="#6366f1" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>Team Registration</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', borderRadius: '10px', padding: '4px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isTeamEvent: false})}
                  style={{
                    padding: '0.4rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: '700',
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: !formData.isTeamEvent ? '#6366f1' : 'transparent',
                    color: !formData.isTeamEvent ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >Individual</button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isTeamEvent: true})}
                  style={{
                    padding: '0.4rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: '700',
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: formData.isTeamEvent ? '#6366f1' : 'transparent',
                    color: formData.isTeamEvent ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >Team</button>
              </div>
            </div>

            {formData.isTeamEvent && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Min Team Size</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minTeamSize}
                    onChange={(e) => setFormData({...formData, minTeamSize: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Max Team Size</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxTeamSize}
                    onChange={(e) => setFormData({...formData, maxTeamSize: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          {/* === MAP LOCATION PICKER === */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <MapIcon size={20} color="#6366f1" />
              <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>Pin Venue Location</span>
            </div>
            <div id="location-map" style={{ height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}></div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
              Click on the map to mark the exact spot where the event will take place.
            </p>
          </div>

          {/* Leaflet Initialization Script */}
          <script dangerouslySetInnerHTML={{ __html: `
            (function() {
              const initMap = () => {
                const mapEl = document.getElementById('location-map');
                if (!mapEl || mapEl._leaflet_id) return;
                
                const initialCoords = [${formData.coordinates[0]}, ${formData.coordinates[1]}];
                const map = L.map('location-map').setView(initialCoords, 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
                
                let marker = L.marker(initialCoords).addTo(map);
                
                map.on('click', function(e) {
                  const { lat, lng } = e.latlng;
                  if (marker) map.removeLayer(marker);
                  marker = L.marker([lat, lng]).addTo(map);
                  window.dispatchEvent(new CustomEvent('map-location-selected', { detail: [lat, lng] }));
                });
                
                setTimeout(() => map.invalidateSize(), 500);
              };
              setTimeout(initMap, 800);
            })();
          `}} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Category</label>
              <select 
                required
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
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

            <div className="form-group">
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Host Department</label>
              <select 
                required
                value={formData.department} 
                onChange={(e) => setFormData({...formData, department: e.target.value})}
              >
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Electrical">Electrical</option>
                <option value="Civil">Civil</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Max Capacity (0 for unlimited)</label>
            <input 
              type="number" 
              value={formData.capacity} 
              onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
            />
          </div>

          {/* === PAYMENT SECTION === */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CreditCard size={20} color="#6366f1" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1e293b' }}>Event Fee</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', borderRadius: '10px', padding: '4px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isFree: true})}
                  style={{
                    padding: '0.4rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: '700',
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: formData.isFree ? '#6366f1' : 'transparent',
                    color: formData.isFree ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >Free</button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isFree: false})}
                  style={{
                    padding: '0.4rem 1.2rem', borderRadius: '8px', border: 'none', fontWeight: '700',
                    fontSize: '0.85rem', cursor: 'pointer',
                    background: !formData.isFree ? '#6366f1' : 'transparent',
                    color: !formData.isFree ? 'white' : '#64748b',
                    transition: 'all 0.2s'
                  }}
                >Paid</button>
              </div>
            </div>

            {formData.isFree ? (
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', padding: '0.5rem 0' }}>This event is <strong>FREE</strong> — no payment required from students.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <IndianRupee size={14} /> Registration Fee (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 199"
                      min="1"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>UPI Payment ID</label>
                    <input
                      type="text"
                      placeholder="e.g. college@ybl"
                      value={formData.paymentUPI}
                      onChange={(e) => setFormData({...formData, paymentUPI: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569', marginBottom: '0.4rem', display: 'block' }}>Payment Instructions</label>
                  <textarea
                    placeholder="e.g. Pay via GPay/PhonePe to the UPI ID, screenshot required at venue."
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    value={formData.paymentInstructions}
                    onChange={(e) => setFormData({...formData, paymentInstructions: e.target.value})}
                  />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '1rem', justifyContent: 'center', marginTop: '1rem', fontSize: '1rem' }}>
            Launch Event
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
