'use client';

import { useState } from 'react';

export default function StandaloneTeamAdminCheckout() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/checkout/create-standalone-team-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName })
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to create checkout session');
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1E8E5A 0%, #0f5d3a 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1E8E5A',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Standalone Team Admin
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Your Independent Citizen Activation System
        </p>

        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Initial Setup</div>
            <div style={{ fontSize: '32px', fontWeight: '700', color: '#1E8E5A' }}>$497</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Annual Renewal</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#333' }}>$497/year</div>
          </div>
        </div>

        <div style={{
          background: '#fff8e1',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            ✅ Includes:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
            <li>3 Strategic Partner slots</li>
            <li>Request management dashboard</li>
            <li>Round Robin assignment system</li>
            <li>Independent tenant (your own system)</li>
          </ul>
        </div>

        <div style={{
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
            💡 Available Add-Ons:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#666' }}>
            <li>Solo Org capabilities (upgrade)</li>
            <li>Additional Team Admins (expand team)</li>
          </ul>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
            Note: Main Admin functionality only available via White Label
          </p>
        </div>

        <form onSubmit={handleCheckout}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '14px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#ccc' : '#1E8E5A',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {loading ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>

        <p style={{
          fontSize: '12px',
          color: '#999',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
}
