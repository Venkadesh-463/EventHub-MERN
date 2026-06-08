import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../services/axiosInstance'
import registrationService from '../services/RegistrationService'
import { motion } from 'framer-motion'
import { CreditCard, Upload, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, IndianRupee } from 'lucide-react'

const Payment = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axiosInstance.get(`/events/${id}`)
        setEvent(data)
      } catch (err) {
        console.error('Failed to fetch event')
        setError('Could not load event details.')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreview(URL.createObjectURL(selectedFile))
      setError('')
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please upload payment proof (screenshot).')
      return
    }

    const formData = new FormData()
    formData.append('eventId', id)
    formData.append('paymentProof', file)

    try {
      setUploading(true)
      await registrationService.registerForEvent(formData)
      alert('Registration successful! Your payment proof has been submitted.')
      navigate('/my-events')
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Payment Gateway...</div>
  if (!event) return <div style={{ textAlign: 'center', padding: '5rem' }}>Event not found.</div>

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', background: 'none', marginBottom: '2rem', cursor: 'pointer', border: 'none', fontWeight: '600' }}
      >
        <ArrowLeft size={18} /> Cancel & Go Back
      </button>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Secure Checkout</h1>
        <p style={{ color: '#64748b' }}>Complete your registration for <strong>{event.title}</strong></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left Side: Payment Instructions */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#f5f3ff', padding: '0.75rem', borderRadius: '12px' }}>
              <IndianRupee size={24} color="#6366f1" />
            </div>
            <h3 style={{ margin: 0 }}>Payment Details</h3>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Amount to Pay</p>
            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b' }}>₹{event.price}</p>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#64748b', marginBottom: '1rem' }}>Scan to Pay via UPI:</p>
            
            {/* UPI QR Code */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '1rem', 
              borderRadius: '12px', 
              display: 'inline-block', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              marginBottom: '1rem',
              border: '1px solid #e2e8f0'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`upi://pay?pa=${event.paymentUPI || 'university@upi'}&pn=${encodeURIComponent(event.title)}&am=${event.price}&cu=INR`)}`} 
                alt="Payment QR Code" 
                style={{ width: '180px', height: '180px' }}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: 'white', 
              padding: '0.6rem 0.75rem', 
              borderRadius: '10px', 
              border: '1.5px dashed #6366f1',
              wordBreak: 'break-all'
            }}>
              <span style={{ fontWeight: '800', color: '#6366f1', fontSize: '0.9rem' }}>{event.paymentUPI || 'university@upi'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
            <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
            <p>Please pay the exact amount using any UPI app (GPay, PhonePe, etc.) and take a screenshot of the success message.</p>
          </div>
        </motion.div>

        {/* Right Side: Proof Upload */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '12px' }}>
              <Upload size={24} color="#10b981" />
            </div>
            <h3 style={{ margin: 0 }}>Upload Proof</h3>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.75rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit}>
            <div 
              style={{ 
                border: '2px dashed #e2e8f0', 
                borderRadius: '20px', 
                padding: '2rem', 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: preview ? '#f8fafc' : 'transparent',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = '#6366f1'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              {preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '10px' }} />
                  <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>Proof Selected: {file?.name}</p>
                </div>
              ) : (
                <>
                  <Upload size={40} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                  <p style={{ fontWeight: '600', color: '#475569', marginBottom: '0.25rem' }}>Select Payment Screenshot</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG or WEBP up to 5MB</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} 
              />
            </div>

            <button 
              type="submit" 
              disabled={uploading}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '2rem', padding: '1rem', justifyContent: 'center', gap: '0.75rem', fontSize: '1.1rem' }}
            >
              {uploading ? 'Processing Registration...' : <>Confirm Payment & Register <ArrowRight size={20} /></>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <CheckCircle size={14} color="#10b981" /> Verified Payment Gateway
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Payment
