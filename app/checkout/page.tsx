'use client'

import { useState } from 'react'

export default function CheckoutPage() {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async (option: string, tier?: string) => {
    if (!email || !name) {
      setError('Please enter your name and email')
      return
    }

    setLoading(true)
    setError('')

    try {
      let endpoint = ''
      let body: any = { email, name }

      if (option === 'team-admin') {
        endpoint = '/api/checkout/team-admin'
      } else if (option === 'organization-admin') {
        endpoint = '/api/checkout/organization-admin'
      } else if (option === 'white-label') {
        endpoint = '/api/checkout/white-label'
        body.tier = tier || 'regular'
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Failed to create checkout session')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e8e5a 0%, #155d3a 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: 'white', fontSize: '36px', marginBottom: '10px' }}>
            Citizen Activation System
          </h1>
          <p style={{ color: '#e0e0e0', fontSize: '18px' }}>
            Choose Your Access Level
          </p>
        </div>

        {/* Customer Info Form */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#1e8e5a', marginBottom: '20px' }}>Your Information</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600 }}>
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px'
              }}
            />
          </div>
          {error && (
            <div style={{
              background: '#fee',
              border: '2px solid #fcc',
              padding: '12px',
              borderRadius: '6px',
              color: '#c00',
              marginTop: '15px'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Pricing Options */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {/* Option 1: Team Admin */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: selectedOption === 'team-admin' ? '3px solid #1e8e5a' : '3px solid transparent'
          }}>
            <h2 style={{ color: '#1e8e5a', marginBottom: '10px' }}>Team Admin Access</h2>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
              $497<span style={{ fontSize: '18px', fontWeight: 'normal' }}>/year</span>
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Year 1: $497 | Year 2+: $497/year
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>✅ Team Admin dashboard access</li>
              <li style={{ marginBottom: '10px' }}>✅ Manage Strategic Partners</li>
              <li style={{ marginBottom: '10px' }}>✅ Request tracking & automation</li>
              <li style={{ marginBottom: '10px' }}>✅ Email automation included</li>
              <li style={{ marginBottom: '10px' }}>✅ Part of larger network</li>
            </ul>
            <button
              onClick={() => handleCheckout('team-admin')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#1e8e5a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'Get Team Admin Access'}
            </button>
          </div>

          {/* Option 2: Organization Admin */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: selectedOption === 'organization-admin' ? '3px solid #c9a441' : '3px solid transparent',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-12px',
              right: '20px',
              background: '#c9a441',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              POPULAR
            </div>
            <h2 style={{ color: '#1e8e5a', marginBottom: '10px' }}>Organization Admin</h2>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
              $997<span style={{ fontSize: '18px', fontWeight: 'normal' }}> Year 1</span>
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Year 1: $997 | Year 2+: $497/year
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>✅ Everything in Team Admin</li>
              <li style={{ marginBottom: '10px' }}>✅ Dedicated branding (custom logo)</li>
              <li style={{ marginBottom: '10px' }}>✅ Custom subdomain (optional)</li>
              <li style={{ marginBottom: '10px' }}>✅ Single organization focus</li>
              <li style={{ marginBottom: '10px' }}>✅ Enhanced features</li>
            </ul>
            <button
              onClick={() => handleCheckout('organization-admin')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#c9a441',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'Get Organization Admin'}
            </button>
          </div>

          {/* Option 3: White-Label */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: selectedOption === 'white-label' ? '3px solid #1e8e5a' : '3px solid transparent'
          }}>
            <h2 style={{ color: '#1e8e5a', marginBottom: '10px' }}>White-Label System</h2>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
              $1,997<span style={{ fontSize: '18px', fontWeight: 'normal' }}> Year 1</span>
            </div>
            <p style={{ color: '#666', marginBottom: '5px' }}>
              Promotional: $1,997 | Regular: $2,997
            </p>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Year 2+: $497/year
            </p>
            <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
              <li style={{ marginBottom: '10px' }}>✅ Your own separate system</li>
              <li style={{ marginBottom: '10px' }}>✅ Full independence & control</li>
              <li style={{ marginBottom: '10px' }}>✅ Own domain/subdomain</li>
              <li style={{ marginBottom: '10px' }}>✅ Main Admin access</li>
              <li style={{ marginBottom: '10px' }}>✅ Unlimited Team Admins</li>
              <li style={{ marginBottom: '10px' }}>✅ White-label branding</li>
            </ul>
            <button
              onClick={() => handleCheckout('white-label', 'promo')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#1e8e5a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: '10px'
              }}
            >
              {loading ? 'Processing...' : 'Get White-Label (Promo - $1,997)'}
            </button>
            <button
              onClick={() => handleCheckout('white-label', 'regular')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#155d3a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'Get White-Label (Regular - $2,997)'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '40px', color: '#e0e0e0' }}>
          <p>All payments are secure and processed through Stripe.</p>
          <p style={{ marginTop: '10px' }}>Year 2+ renewals are automatic at $497/year for all options.</p>
        </div>
      </div>
    </div>
  )
}
