'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

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
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
        <h1 style={{ color: '#1e8e5a', fontSize: '32px', marginBottom: '20px' }}>
          Payment Successful!
        </h1>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>
          Thank you for your purchase. Your Citizen Activation System access is being set up.
        </p>
        <div style={{
          background: '#f0f9f4',
          border: '2px solid #1e8e5a',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#1e8e5a', marginBottom: '15px' }}>What Happens Next?</h3>
          <ul style={{ textAlign: 'left', color: '#333', lineHeight: '1.8' }}>
            <li>You'll receive a confirmation email within 5 minutes</li>
            <li>Your account credentials will be sent to your email</li>
            <li>You can log in to your dashboard immediately</li>
            <li>Our team will reach out to help you get started</li>
          </ul>
        </div>
        {sessionId && (
          <p style={{ color: '#999', fontSize: '14px', marginBottom: '20px' }}>
            Reference ID: {sessionId.slice(0, 20)}...
          </p>
        )}
        <a 
          href="https://hub.citizenactivation.com"
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
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
