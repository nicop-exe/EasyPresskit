import React from 'react';
import { Lock, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

export const PaywallModal = ({ isOpen, onClose, featureName, slug }) => {
    if (!isOpen) return null;

    const handleUpgrade = () => {
        if (!slug) {
            alert('Please save your presskit first to generate a link before upgrading.');
            return;
        }
        const checkoutUrl = `${PAYMENT_LINK}?client_reference_id=${encodeURIComponent(slug)}`;
        window.open(checkoutUrl, '_blank');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000
                }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    style={{
                        background: '#111',
                        border: '1px solid #ff1744',
                        borderRadius: '16px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        position: 'relative',
                        boxShadow: '0 0 50px rgba(255, 23, 68, 0.2)',
                        textAlign: 'center'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: '16px', right: '16px',
                            background: 'transparent', border: 'none', color: '#666', cursor: 'pointer'
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{
                        width: '60px', height: '60px',
                        background: 'rgba(255, 23, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <Lock size={32} color="#ff1744" />
                    </div>

                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontFamily: 'Orbitron, sans-serif' }}>
                        Unlock {featureName}
                    </h2>

                    <p style={{ color: '#aaa', lineHeight: '1.6', marginBottom: '2rem' }}>
                        This feature is available exclusively for <strong>Pro</strong> members. Upgrade now to access high-res uploads, video embeds, and more.
                    </p>

                    <ul style={{ textAlign: 'left', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', paddingLeft: '1rem' }}>
                        <li style={{ color: '#eee', display: 'flex', gap: '10px' }}>
                            <Zap size={16} color="#ffd700" /> High-Resolution Photo Uploads
                        </li>
                        <li style={{ color: '#eee', display: 'flex', gap: '10px' }}>
                            <Zap size={16} color="#ffd700" /> YouTube & SoundCloud Embeds
                        </li>
                        <li style={{ color: '#eee', display: 'flex', gap: '10px' }}>
                            <Zap size={16} color="#ffd700" /> Remove Branding
                        </li>
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            background: '#ff1744',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontFamily: 'Orbitron, sans-serif',
                            letterSpacing: '1px'
                        }}>
                        UPGRADE FOR €5/mo
                    </button>

                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
                        Cancel anytime. Secure checkout via Stripe.
                    </p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
