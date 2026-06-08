import React from 'react'
import logoImg from '../assets/Event Hub Logo.png'

const Logo = ({ height = 60 }) => {
  return (
    <div className="logo-container" style={{
      display: 'flex',
      alignItems: 'center',
      height: 'auto',
      overflow: 'hidden'
    }}>
      <img
        src={logoImg}
        alt="EventHub"
        style={{
          height: `${height}px`,
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  )
}

export default Logo
