import React, { useState, useEffect } from 'react'
import registrationService from '../services/RegistrationService'
import axiosInstance from '../services/axiosInstance'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Ticket, Download, CheckCircle, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import CertificateTemplate from '../components/CertificateTemplate'

const MyEvents = () => {
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [certData, setCertData] = useState(null)
  const { userInfo } = useSelector((state) => state.user)

  useEffect(() => {
    const fetchMyRegistrations = async () => {
      try {
        const { data } = await registrationService.getMyRegistrations()
        setRegistrations(data)
      } catch (err) {
        console.error('Failed to fetch registrations')
      } finally {
        setLoading(false)
      }
    }
    fetchMyRegistrations()
  }, [])

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading your tickets...</div>

  const handleDownloadCertificate = async (reg) => {
    setCertData({
      studentName: userInfo.name,
      eventTitle: reg.event.title,
      date: reg.event.date,
      certificateId: 'EH-' + reg._id.slice(-8).toUpperCase()
    })
    
    setGenerating(true)
    
    // Wait for the component to render
    setTimeout(async () => {
      const element = document.getElementById('certificate-to-print')
      if (!element) {
        setGenerating(false)
        return
      }

      try {
        const canvas = await html2canvas(element, {
          scale: 1.5, // Balanced resolution for smaller file size
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: true
        })
        
        // Use JPEG for better compression/smaller size
        const imgData = canvas.toDataURL('image/jpeg', 0.8)
        const pdf = new jsPDF('landscape', 'px', [800, 600])
        pdf.addImage(imgData, 'JPEG', 0, 0, 800, 600)
        pdf.save(`Certificate_${reg.event.title.replace(/\s+/g, '_')}.pdf`)
      } catch (err) {
        console.error('Detailed Certificate Error:', err)
        alert('Failed to generate certificate. Please ensure your browser supports canvas and try again.')
      } finally {
        setGenerating(false)
        setCertData(null)
      }
    }, 500)
  }

  return (
    <div style={{ padding: '2rem 10%', minHeight: '100vh' }}>
      <header style={{ marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>My Event Tickets</h1>
        <p style={{ color: '#64748b' }}>Show these QR codes at the venue for quick check-in.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
        {registrations.map((reg) => (
          <motion.div
            key={reg._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
            style={{ padding: 0, display: 'flex', overflow: 'hidden', borderLeft: '6px solid #6366f1' }}
          >
            {/* Ticket Info */}
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366f1', marginBottom: '1rem' }}>
                <Ticket size={20} />
                <span style={{ fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase' }}>Entry Ticket</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{reg.event.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <Calendar size={14} /> {new Date(reg.event.date).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>
                  <MapPin size={14} /> {reg.event.location}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ 
                  padding: '0.4rem 0.9rem', 
                  borderRadius: '8px', 
                  backgroundColor: reg.status === 'attended' ? '#dcfce7' : '#f1f5f9',
                  color: reg.status === 'attended' ? '#166534' : '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.8rem',
                  fontWeight: '700'
                }}>
                  {reg.status === 'attended' && <CheckCircle size={14} />}
                  {reg.status.toUpperCase()}
                </div>

                {reg.status === 'attended' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownloadCertificate(reg)}
                    style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.4rem',
                      padding: '0.4rem 0.9rem',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '0.8rem',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {generating ? <Loader2 className="animate-spin" size={14} /> : <Download size={14} />}
                    {generating ? 'Generating...' : 'Get Certificate'}
                  </motion.button>
                )}
              </div>
            </div>

            {/* QR Code Side */}
            <div style={{ 
              width: '160px', 
              backgroundColor: '#fafafa', 
              borderLeft: '2px dashed #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${reg.qrCodeData}`} 
                alt="QR Code" 
                style={{ width: '120px', height: '120px', marginBottom: '0.5rem' }}
              />
              <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>SCAN TO CHECK-IN</span>
              <div style={{ 
                background: '#eef2ff', 
                border: '1.5px solid #6366f1', 
                borderRadius: '8px', 
                padding: '4px 8px',
                textAlign: 'center'
              }}>
                <p style={{ fontSize: '0.55rem', color: '#6366f1', fontWeight: '700', margin: '0 0 2px 0' }}>REG ID</p>
                <p style={{ fontSize: '0.8rem', fontWeight: '900', fontFamily: 'monospace', color: '#1e293b', letterSpacing: '2px', margin: 0 }}>{reg.qrCodeData}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {registrations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Ticket size={64} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
          <h3>No registrations yet</h3>
          <p style={{ color: '#94a3b8' }}>Browse events and join one to see your tickets here.</p>
        </div>
      )}
      {/* Hidden Certificate for Printing */}
      <div style={{ position: 'fixed', left: '-9999px', top: '-9999px' }}>
        {certData && <CertificateTemplate {...certData} />}
      </div>
    </div>
  )
}

export default MyEvents
