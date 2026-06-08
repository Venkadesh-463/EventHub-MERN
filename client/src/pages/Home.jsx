import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Users, Shield, ArrowRight } from 'lucide-react'

const Home = () => {
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <section style={{ 
        minHeight: '90vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 5%',
        textAlign: 'center',
        position: 'relative'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: '900px', zIndex: 1 }}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ 
              backgroundColor: 'rgba(99, 102, 241, 0.1)', 
              color: '#6366f1', 
              padding: '0.5rem 1.5rem', 
              borderRadius: '100px', 
              fontSize: '0.9rem', 
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Empowering Campus Life
          </motion.span>
          
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', 
            fontWeight: '800', 
            lineHeight: '1.1', 
            margin: '1.5rem 0',
            background: 'linear-gradient(135deg, #0f172a 0%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Manage and Discover <br /> Campus Events Effortlessly
          </h1>
          
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#64748b', 
            marginBottom: '2.5rem', 
            maxWidth: '650px', 
            marginInline: 'auto' 
          }}>
            The all-in-one platform for students, colleges, and administrators to organize, register, and track academic events.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
              <Link to="/events" className="btn-primary" style={{ 
                fontSize: '1rem', 
                padding: '0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.75rem',
                height: '56px',
                width: '100%'
              }}>
                Browse Events <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: '1', minWidth: '200px', maxWidth: '250px' }}>
              <Link to="/register" style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '56px',
                width: '100%',
                padding: '0', 
                borderRadius: '12px', 
                fontWeight: '700', 
                border: '2px solid #e2e8f0',
                color: '#0f172a',
                fontSize: '1rem',
                backgroundColor: 'white'
              }}>
                Get Started
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative Background Elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ 
            position: 'absolute', 
            top: '20%', 
            left: '10%', 
            width: '300px', 
            height: '300px', 
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }} 
        />
      </section>

      {/* Stats Section (Hidden for now, can be restored later)
      <section style={{ padding: '3rem 5%', backgroundColor: 'white' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', textAlign: 'center' }}>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem' }}>50+</h2>
            <p style={{ color: '#64748b', fontWeight: '600' }}>Active Colleges</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem' }}>10k+</h2>
            <p style={{ color: '#64748b', fontWeight: '600' }}>Registered Students</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem' }}>1.2k</h2>
            <p style={{ color: '#64748b', fontWeight: '600' }}>Events Hosted</p>
          </div>
          <div>
            <h2 style={{ fontSize: '3rem', fontWeight: '800', color: '#6366f1', marginBottom: '0.5rem' }}>99%</h2>
            <p style={{ color: '#64748b', fontWeight: '600' }}>Attendance Verified</p>
          </div>
        </div>
      </section>
      */}

      {/* Features Section */}
      <section style={{ padding: '8rem 10%' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>Everything you need in one place</h2>
          <p style={{ color: '#64748b', maxWidth: '600px', margin: 'auto' }}>
            Built for modern campus ecosystems. Secure, scalable, and easy to use.
          </p>
        </div>

        <div className="interactive-grid">
          <div className="card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Calendar color="#6366f1" />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Smart Event Management</h3>
            <p style={{ color: '#64748b' }}>Create, manage and publish events with rich media and departmental targeting.</p>
          </div>

          <div className="card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Shield color="#a855f7" />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>QR-Powered Attendance</h3>
            <p style={{ color: '#64748b' }}>Advanced two-step QR verification system to track precise presence duration.</p>
          </div>

          <div className="card">
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Users color="#10b981" />
            </div>
            <h3 style={{ marginBottom: '1rem' }}>Live Analytics</h3>
            <p style={{ color: '#64748b' }}>Real-time dashboards for students, organizers, and platform administrators.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '3rem 5%', marginBottom: '5rem' }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
          color: 'white', 
          padding: '2.5rem 1.5rem', 
          textAlign: 'center',
          borderRadius: '32px'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Ready to transform your campus?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '600px', marginInline: 'auto' }}>
            Join hundreds of colleges already using Event Hub to streamline their academic life.
          </p>
          <Link to="/register" className="btn-primary" style={{ padding: '1rem 3rem' }}>Join Event Hub Now</Link>
        </div>
      </section>

    </div>
  )
}

export default Home
