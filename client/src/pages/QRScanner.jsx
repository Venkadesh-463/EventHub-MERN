import React, { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import axiosInstance from '../services/axiosInstance'
import { motion, AnimatePresence } from 'framer-motion'
import { ScanLine, CheckCircle, XCircle, Users, Calendar, Download, Eye, ExternalLink } from 'lucide-react'

const QRScanner = () => {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null) // { type: 'success'|'error', message, data }
  const [attendees, setAttendees] = useState([])
  const [myEvents, setMyEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [showProof, setShowProof] = useState(null) // stores registration object
  const scannerRef = useRef(null)

  // Fetch college's events on mount
  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const { data } = await axiosInstance.get('/events/my')
        setMyEvents(data)
      } catch (err) {
        console.error('Failed to fetch events')
      }
    }
    fetchMyEvents()
    return () => stopScanner()
  }, [])

  // Fetch attendees when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchAttendees()
    }
  }, [selectedEvent])

  const fetchAttendees = async () => {
    try {
      const { data } = await axiosInstance.get(`/registrations/event/${selectedEvent}`)
      setAttendees(data.data)
    } catch (err) {
      console.error('Failed to fetch attendees')
    }
  }

  const downloadCertificate = async (registrationId, studentName) => {
    try {
      const response = await axiosInstance.get(`/certificates/${registrationId}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${studentName}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Certificate can only be generated for attended students.')
    }
  }

  const startScanner = async () => {
    if (scannerRef.current) return
    setResult(null)
    setScanning(true)

    const qrScanner = new Html5Qrcode('qr-reader')
    scannerRef.current = qrScanner

    try {
      await qrScanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner()
          await handleScan(decodedText)
        },
        () => {}
      )
    } catch (err) {
      setScanning(false)
      setResult({ type: 'error', message: 'Could not access camera. Please allow camera permissions.' })
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
      } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  const fileInputRef = useRef(null)
  const [manualCode, setManualCode] = useState('')

  const handleScan = async (qrCodeData) => {
    try {
      const { data } = await axiosInstance.post('/registrations/checkin', { qrCodeData })
      setResult({ type: 'success', message: data.message, data: data.data })
      fetchAttendees()
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Check-in failed'
      })
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setScanning(true)
    const qrScanner = new Html5Qrcode('qr-reader-hidden')
    try {
      const decodedText = await qrScanner.scanFile(file, true)
      await handleScan(decodedText)
    } catch (err) {
      setResult({ type: 'error', message: 'Could not find a QR code in this image.' })
    } finally {
      setScanning(false)
    }
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (!manualCode) return
    handleScan(manualCode)
    setManualCode('')
  }

  const handleVerifyPayment = async (regId, status) => {
    try {
      await axiosInstance.put(`/registrations/${regId}/verify-payment`, { status });
      alert(`Payment ${status}!`);
      fetchAttendees();
      setShowProof(null);
    } catch (err) {
      alert('Failed to update payment status');
    }
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <ScanLine size={36} color="#6366f1" /> QR Check-in Scanner
        </h1>
        <p style={{ color: '#64748b' }}>Scan student tickets to mark attendance in real-time.</p>
      </header>

      {/* Event Selector */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Calendar size={22} color="#6366f1" />
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          style={{ flex: 1, border: 'none', background: 'transparent', fontWeight: '600', fontSize: '1rem', cursor: 'pointer' }}
        >
          <option value="">-- Select Event to Manage --</option>
          {myEvents.map(ev => (
            <option key={ev._id} value={ev._id}>{ev.title}</option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderLeft: '4px solid #6366f1' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Registered</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>{attendees.length}</p>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Checked In</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>{attendees.filter(a => a.status === 'checked-in').length}</p>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Verified</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '800' }}>{attendees.filter(a => a.status === 'attended').length}</p>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Scanner Section */}
        <div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Scanner Options</h3>

            {/* Hidden elements for file scanning */}
            <div id="qr-reader-hidden" style={{ display: 'none' }} />
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleFileUpload} 
            />

            {/* QR reader container */}
            <div id="qr-reader" style={{ 
              width: '100%', 
              borderRadius: '16px', 
              overflow: 'hidden',
              display: scanning ? 'block' : 'none',
              marginBottom: '1.5rem'
            }} />

            {!scanning && (
              <div style={{ padding: '2rem 1rem', color: '#94a3b8' }}>
                <ScanLine size={64} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                <p>Choose an attendance method below</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {!scanning ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary"
                    onClick={startScanner}
                    style={{ flex: 1, padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <ScanLine size={18} /> Camera
                  </motion.button>
                ) : (
                  <button
                    onClick={stopScanner}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', fontWeight: '600', border: '2px solid #fee2e2', color: '#ef4444', cursor: 'pointer' }}
                  >
                    Stop Camera
                  </button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current.click()}
                  style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', fontWeight: '600', border: '2px solid #e2e8f0', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white' }}
                >
                  <Download size={18} style={{ transform: 'rotate(180deg)' }} /> Upload Image
                </motion.button>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>— OR ENTER MANUALLY —</p>
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. EH-A1B2C3" 
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
                  />
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ padding: '0.8rem 1.5rem', borderRadius: '12px' }}
                  >
                    Check-in
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card"
                style={{ 
                  marginTop: '1.5rem', 
                  padding: '1.5rem', 
                  backgroundColor: result.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  borderColor: result.type === 'success' ? '#bbf7d0' : '#fecaca',
                  textAlign: 'center'
                }}
              >
                {result.type === 'success' ? (
                  result.data?.step === 1 ? (
                    <div style={{ color: '#6366f1' }}>
                      <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                      <h3 style={{ marginBottom: '0.5rem' }}>Check-in Recorded!</h3>
                    </div>
                  ) : (
                    <div style={{ color: '#22c55e' }}>
                      <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                      <h3 style={{ marginBottom: '0.5rem' }}>Attendance Verified!</h3>
                    </div>
                  )
                ) : (
                  <XCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                )}
                <p style={{ color: result.type === 'success' ? '#15803d' : '#b91c1c', fontWeight: '500' }}>{result.message}</p>
                {result.data?.registration?.student && (
                  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: '700', fontSize: '1.1rem' }}>{result.data.registration.student.name}</p>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{result.data.registration.student.email}</p>
                  </div>
                )}
                <button
                  onClick={() => { setResult(null); startScanner() }}
                  className="btn-primary"
                  style={{ marginTop: '1rem', padding: '0.7rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <ScanLine size={16} /> Scan Next
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attendees List */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <Users size={22} color="#6366f1" /> Registrations 
            <span style={{ marginLeft: 'auto', fontSize: '0.9rem', color: '#94a3b8' }}>{attendees.length} total</span>
          </h3>
          
          {attendees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <Users size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>Select an event to see registrations</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
              {attendees.map((reg) => (
                <motion.div
                  key={reg._id}
                  layout
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: '12px',
                    backgroundColor: reg.status === 'attended' ? '#f0fdf4' : '#f8fafc',
                    border: `1px solid ${reg.status === 'attended' ? '#bbf7d0' : '#e2e8f0'}`
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{reg.student.name}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        backgroundColor: reg.status === 'attended' ? '#dcfce7' : reg.status === 'checked-in' ? '#e0e7ff' : '#f1f5f9',
                        color: reg.status === 'attended' ? '#166534' : reg.status === 'checked-in' ? '#3730a3' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}>
                        {reg.status === 'attended' ? '✓ VERIFIED' : reg.status === 'checked-in' ? '◷ IN PROGRESS' : 'REGISTERED'}
                      </span>
                      
                      {reg.paymentStatus !== 'n/a' && (
                        <span style={{
                          padding: '0.3rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          backgroundColor: reg.paymentStatus === 'verified' ? '#dcfce7' : reg.paymentStatus === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: reg.paymentStatus === 'verified' ? '#166534' : reg.paymentStatus === 'pending' ? '#92400e' : '#991b1b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          cursor: reg.paymentProof ? 'pointer' : 'default'
                        }} onClick={() => reg.paymentProof && setShowProof(reg)}>
                          💰 {reg.paymentStatus.toUpperCase()} {reg.paymentProof && <Eye size={12} style={{ marginLeft: '4px' }} />}
                        </span>
                      )}

                      {reg.status === 'attended' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => downloadCertificate(reg._id, reg.student.name)}
                          title="Download Certificate"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.4rem 0.6rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Download size={14} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Proof Verification Modal */}
      <AnimatePresence>
        {showProof && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(8px)', padding: '2rem'
          }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ width: '100%', maxWidth: '600px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '0.2rem' }}>Payment Verification</h2>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{showProof.student.name} • EH-{showProof.qrCodeData.split('-')[1]}</p>
                </div>
                <button 
                  onClick={() => setShowProof(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                >✕</button>
              </div>

              <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '0.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={showProof.paymentProof} 
                  alt="Payment Proof" 
                  style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', objectFit: 'contain' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => handleVerifyPayment(showProof._id, 'rejected')}
                  style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1px solid #fee2e2', backgroundColor: '#fff', color: '#ef4444', fontWeight: '700', cursor: 'pointer' }}
                >Reject Payment</button>
                <button 
                  onClick={() => handleVerifyPayment(showProof._id, 'verified')}
                  className="btn-primary" 
                  style={{ flex: 2, padding: '1rem', justifyContent: 'center' }}
                >Verify Success</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default QRScanner
