import React from 'react';
import { Check, Star, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual Publishable Key from Stripe Dashboard
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

export const PricingCard = ({ isPro, onSubscribe }) => {
    const handleSubscribe = async () => {
        // In a real app, you'd call your backend to create a checkout session
        // For now, we'll simulate the redirect or use a client-only approach (less secure but okay for MVP demo)

        // Example: Redirect to a Stripe Payment Link (simplest no-code solution)
        // window.location.href = 'https://buy.stripe.com/test_...';

        // OR: Call backend to get sessionId
        /*
        const response = await fetch('/api/create-checkout-session', { method: 'POST' });
        const session = await response.json();
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: session.id });
        */

        onSubscribe(); // For demo purposes, we'll just trigger the parent handler
    };

    return (
        <div className="pricing-container" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            padding: '2rem',
            maxWidth: '900px',
            margin: '0 auto'
        }}>
            {/* Free Tier */}
            <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Free</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>€0<span style={{ fontSize: '1rem', color: '#888' }}>/mo</span></div>
                    <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Essential tools for emerging artists.</p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Check size={18} color="#4ade80" /> Basic Presskit Profile
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Check size={18} color="#4ade80" /> Standard Quality Images (max 2MB)
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Check size={18} color="#4ade80" /> Social Links
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888' }}>
                        <Check size={18} color="#555" /> High-Res Photo Gallery
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#888' }}>
                        <Check size={18} color="#555" /> Video & Audio Embeds
                    </li>
                </ul>

                <button disabled style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: '#888',
                    cursor: 'default'
                }}>
                    Current Plan
                </button>
            </div>

            {/* Pro Tier */}
            <div style={{
                background: 'linear-gradient(145deg, rgba(20,20,25,0.9) 0%, rgba(20,0,20,0.4) 100%)',
                border: '1px solid #ff1744',
                borderRadius: '16px',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                boxShadow: '0 0 30px rgba(255, 23, 68, 0.15)'
            }}>
                <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    background: '#ff1744', color: 'white', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.1em'
                }}>
                    RECOMMENDED
                </div>

                <div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Pro <Star size={20} fill="#ff1744" color="#ff1744" />
                    </h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>€5<span style={{ fontSize: '1rem', color: '#888' }}>/mo</span></div>
                    <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Professional tools for serious performers.</p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Check size={18} color="#ff1744" /> Everything in Free
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Zap size={18} color="#ffd700" /> High-Res Original Photos
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Zap size={18} color="#ffd700" /> YouTube Video Integration
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: '#eee' }}>
                        <Zap size={18} color="#ffd700" /> SoundCloud Audio Embeds
                    </li>
                </ul>

                <button onClick={handleSubscribe} style={{
                    marginTop: 'auto',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#ff1744',
                    color: 'white',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(255, 23, 68, 0.3)'
                }}>
                    {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                </button>
            </div>
        </div>
    );
};
