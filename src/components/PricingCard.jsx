import React from 'react';
import { Check, Star, Zap } from 'lucide-react';

const PAYMENT_LINK = import.meta.env.VITE_STRIPE_PAYMENT_LINK;

export const PricingCard = ({ isPro, slug }) => {
    const handleSubscribe = () => {
        if (!slug) {
            alert('Please save your presskit first to generate a link before upgrading.');
            return;
        }
        // Redirect to Stripe Payment Link with client_reference_id for webhook identification
        const checkoutUrl = `${PAYMENT_LINK}?client_reference_id=${encodeURIComponent(slug)}`;
        window.open(checkoutUrl, '_blank');
    };

    return (
        <div className="pricing-container">
            {/* Free Tier */}
            <div className="pricing-card free">
                <div>
                    <h3 className="pricing-title">Free</h3>
                    <div className="pricing-price">€0<span>/mo</span></div>
                    <p className="pricing-desc">Essential tools for emerging artists.</p>
                </div>

                <ul className="pricing-features">
                    <li><Check size={16} color="#4ade80" /> Basic Presskit Profile</li>
                    <li><Check size={16} color="#4ade80" /> Standard Quality (2MB)</li>
                    <li><Check size={16} color="#4ade80" /> Social Links</li>
                    <li className="dim"><Check size={16} color="#555" /> High-Res Gallery</li>
                    <li className="dim"><Check size={16} color="#555" /> Video & Audio Embeds</li>
                </ul>

                <button disabled className="pricing-button current">
                    Current Plan
                </button>
            </div>

            {/* Pro Tier */}
            <div className="pricing-card pro">
                <div className="pricing-tag">RECOMMENDED</div>

                <div>
                    <h3 className="pricing-title">
                        Pro <Star size={18} fill="#ff1744" color="#ff1744" />
                    </h3>
                    <div className="pricing-price">€5<span>/mo</span></div>
                    <p className="pricing-desc">Professional tools for serious performers.</p>
                </div>

                <ul className="pricing-features">
                    <li><Check size={16} color="#ff1744" /> Everything in Free</li>
                    <li><Zap size={16} color="#ffd700" /> High-Res Original Photos</li>
                    <li><Zap size={16} color="#ffd700" /> YouTube Integration</li>
                    <li><Zap size={16} color="#ffd700" /> SoundCloud Embeds</li>
                </ul>

                <button onClick={handleSubscribe} className="pricing-button upgrade">
                    {isPro ? 'Manage Subscription' : 'Upgrade to Pro'}
                </button>
            </div>
        </div>
    );
};
