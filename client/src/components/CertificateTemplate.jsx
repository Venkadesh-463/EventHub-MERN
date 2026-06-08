import React from 'react'
import Logo from './Logo'
import { Award, CheckCircle } from 'lucide-react'

const CertificateTemplate = ({ studentName, eventTitle, date, certificateId }) => {
  return (
    <div 
      id="certificate-to-print"
      style={{
        width: '800px',
        height: '600px',
        padding: '40px',
        background: 'white',
        border: '20px solid #6366f1',
        position: 'relative',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      {/* Decorative corners */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', width: '100px', height: '100px', borderTop: '5px solid #a855f7', borderLeft: '5px solid #a855f7' }} />
      <div style={{ position: 'absolute', top: '20px', right: '20px', width: '100px', height: '100px', borderTop: '5px solid #a855f7', borderRight: '5px solid #a855f7' }} />
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '100px', height: '100px', borderBottom: '5px solid #a855f7', borderLeft: '5px solid #a855f7' }} />
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '100px', height: '100px', borderBottom: '5px solid #a855f7', borderRight: '5px solid #a855f7' }} />

      <div style={{ marginBottom: '10px' }}>
        <Logo height={60} />
      </div>

      <h4 style={{ color: '#6366f1', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>Certificate of Participation</h4>
      
      <p style={{ fontSize: '1.2rem', color: '#64748b', marginBottom: '25px' }}>This is to certify that</p>
      
      <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '5px 0', color: '#0f172a' }}>{studentName}</h1>
      
      <p style={{ fontSize: '1.2rem', color: '#64748b', margin: '15px 0' }}>has successfully participated in and completed</p>
      
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#6366f1', marginBottom: '30px' }}>{eventTitle}</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '2rem', width: '100%', marginTop: '20px' }}>
        <div style={{ width: '180px', textAlign: 'center' }}>
          <p style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>Date</p>
          <p style={{ fontWeight: '700' }}>{new Date(date).toLocaleDateString()}</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '-10px' }}>
          <div style={{ 
            width: '70px', height: '70px', borderRadius: '50%', 
            backgroundColor: '#fef3c7', border: '4px solid #f59e0b',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
          }}>
            <Award color="#f59e0b" size={35} />
          </div>
          <p style={{ fontSize: '0.65rem', fontWeight: '800', color: '#f59e0b', marginTop: '5px' }}>VERIFIED</p>
        </div>

        <div style={{ width: '180px', textAlign: 'center' }}>
          <p style={{ borderTop: '1px solid #cbd5e1', paddingTop: '10px', fontSize: '0.9rem', color: '#64748b', marginBottom: '5px' }}>Certificate ID</p>
          <p style={{ fontWeight: '700', fontSize: '0.8rem' }}>{certificateId}</p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '40px', opacity: 0.08 }}>
        <Logo height={120} />
      </div>
    </div>
  )
}

export default CertificateTemplate
