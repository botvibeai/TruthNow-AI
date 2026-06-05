'use client';

import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test",
  currency: "USD",
  intent: "subscription",
  vault: true,
};

export default function Pricing() {
  return (
    <main className="main-container" style={{ textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', margin: '3rem 0 1rem' }}>Choose Your Plan</h1>
      <p style={{ color: '#94a3b8', fontSize: '1.2rem', marginBottom: '4rem' }}>Flexible SaaS pricing to suit your needs.</p>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Basic Plan */}
        <div className="glass-panel" style={{ padding: '2rem', width: '300px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Basic</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$19<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem', color: '#cbd5e1' }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ 10,000 API Calls</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ Basic Cloudmersive Auth</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ Community Support</li>
          </ul>
          
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              createSubscription={(data, actions) => {
                return actions.subscription.create({
                  plan_id: "P-BASIC_PLAN_ID_HERE" // Replace with your PayPal Plan ID
                });
              }}
              onApprove={async (data, actions) => {
                alert(`You have successfully subscribed to the Basic plan! Subscription ID: ${data.subscriptionID}`);
              }}
              style={{ label: 'subscribe' }}
            />
          </PayPalScriptProvider>
        </div>

        {/* Pro Plan */}
        <div className="glass-panel" style={{ padding: '2rem', width: '300px', border: '1px solid var(--primary-color)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>Pro</h2>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>$49<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#94a3b8' }}>/mo</span></div>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', marginBottom: '2rem', color: '#cbd5e1' }}>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ 100,000 API Calls</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ Full Cloudmersive Suite</li>
            <li style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--glass-border)' }}>✓ Priority 24/7 Support</li>
          </ul>
          
          <PayPalScriptProvider options={initialOptions}>
            <PayPalButtons
              createSubscription={(data, actions) => {
                return actions.subscription.create({
                  plan_id: "P-PRO_PLAN_ID_HERE" // Replace with your PayPal Plan ID
                });
              }}
              onApprove={async (data, actions) => {
                alert(`You have successfully subscribed to the Pro plan! Subscription ID: ${data.subscriptionID}`);
              }}
              style={{ label: 'subscribe' }}
            />
          </PayPalScriptProvider>
        </div>

      </div>
    </main>
  );
}
