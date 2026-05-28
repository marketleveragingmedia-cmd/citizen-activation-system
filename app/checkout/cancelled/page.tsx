'use client'

import Image from 'next/image'

export default function CheckoutCancelledPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e8e5a 0%, #155d3a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <Image
            src="/citizen-activation-logo.jpg"
            alt="Citizen Activation System"
            width={280}
            height={110}
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
        <h1 style={{ color: '#c00', fontSize: '32px', marginBottom: '20px' }}>
          Payment Cancelled
        </h1>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
          Your payment was cancelled. No charges have been made to your account.
        </p>
        <div style={{
          background: '#fff8f0',
          border: '2px solid #c9a441',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <p style={{ color: '#333', lineHeight: '1.8' }}>
            If you experienced any issues during checkout, please contact our support team. 
            We're here to help you get started with the Citizen Activation System.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <a 
            href="/checkout"
            style={{
              display: 'inline-block',
              padding: '14px 30px',
              background: '#1e8e5a',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Try Again
          </a>
          <a 
            href="https://hub.citizenactivation.com"
            style={{
              display: 'inline-block',
              padding: '14px 30px',
              background: 'white',
              color: '#1e8e5a',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              border: '2px solid #1e8e5a'
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  )
}
