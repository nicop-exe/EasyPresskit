import React, { useEffect, useState } from 'react';
import { loadPresskit } from '../services/presskitService';
import { generateUniqueStyle } from '../utils/uniqueness';
import { Music, Instagram, Youtube, Twitter, ExternalLink } from 'lucide-react';

/* ── Social icon button ── */
const SocialButton = ({ href, icon: Icon, label, color }) => {
    if (!href) return null;
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.6rem 1.2rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: '#fff',
                textDecoration: 'none',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-body, Rajdhani, sans-serif)',
                transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = color + '20';
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.color = '#fff';
            }}
        >
            <Icon size={18} />
            <span>{label}</span>
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.5 }} />
        </a>
    );
};

export const PresskitView = ({ slug }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPresskit(slug)
            .then((result) => {
                if (!result) setError('Presskit not found');
                else setData(result);
            })
            .catch(() => setError('Failed to load presskit'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505' }}>
                <p style={{ color: '#00f2ff', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>Loading presskit...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#050505', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#ff4444', fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>{error}</p>
                <a href="./" style={{ color: '#00f2ff', fontSize: '0.9rem' }}>← Create your own presskit</a>
            </div>
        );
    }

    const style = generateUniqueStyle(data.artistConcept || '');
    const socials = data.socials || {};
    const hasSocials = Object.values(socials).some(v => v);

    return (
        <div style={{ background: '#050505', minHeight: '100vh', color: '#e0e0e0' }}>

            {/* Hero Section */}
            <header style={{
                position: 'relative',
                padding: '4rem 2rem 3rem',
                textAlign: 'center',
                background: `linear-gradient(180deg, ${style.primaryColor}12 0%, transparent 70%)`,
                borderBottom: `1px solid ${style.primaryColor}25`,
            }}>
                <p style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: style.secondaryColor,
                    marginBottom: '1.5rem',
                }}>
                    Official Press Kit
                </p>

                {data.photoURL && (
                    <img
                        src={data.photoURL}
                        alt={data.artistName}
                        style={{
                            width: '150px', height: '150px',
                            borderRadius: '50%',
                            border: `3px solid ${style.primaryColor}`,
                            objectFit: 'cover',
                            margin: '0 auto 1.5rem',
                            display: 'block',
                            boxShadow: `0 0 40px ${style.primaryColor}30`,
                        }}
                    />
                )}

                <h1 style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    margin: 0,
                }}>
                    {data.artistName}
                </h1>

                {data.artistConcept && (
                    <p style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '0.75rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: style.primaryColor,
                        marginTop: '0.5rem',
                    }}>
                        {data.artistConcept}
                    </p>
                )}
            </header>

            {/* Content */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>

                {/* Biography */}
                {data.bio && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: style.primaryColor,
                            marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `1px solid ${style.primaryColor}30`,
                        }}>
                            About
                        </h2>
                        <p style={{
                            lineHeight: '1.8',
                            color: '#ccc',
                            fontSize: '1rem',
                            fontFamily: 'Rajdhani, sans-serif',
                        }}>
                            {data.bio}
                        </p>
                    </section>
                )}

                {/* Technical Rider */}
                {data.selectedGear && data.selectedGear.length > 0 && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: style.primaryColor,
                            marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `1px solid ${style.primaryColor}30`,
                        }}>
                            Technical Rider
                        </h2>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {data.selectedGear.map((item, i) => (
                                <span key={i} style={{
                                    padding: '0.5rem 1rem',
                                    border: `1px solid ${style.primaryColor}50`,
                                    borderRadius: '6px',
                                    color: '#fff',
                                    fontSize: '0.85rem',
                                    fontFamily: 'Orbitron, sans-serif',
                                    background: `${style.primaryColor}10`,
                                    letterSpacing: '0.05em',
                                }}>
                                    {item}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

                {/* Hospitality */}
                {data.hospitality && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: style.primaryColor,
                            marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `1px solid ${style.primaryColor}30`,
                        }}>
                            Hospitality Rider
                        </h2>
                        <p style={{
                            lineHeight: '1.8',
                            color: '#ccc',
                            fontSize: '1rem',
                            fontFamily: 'Rajdhani, sans-serif',
                        }}>
                            {data.hospitality}
                        </p>
                    </section>
                )}

                {/* Social Links */}
                {hasSocials && (
                    <section style={{ marginBottom: '2.5rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: style.primaryColor,
                            marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `1px solid ${style.primaryColor}30`,
                        }}>
                            Follow
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
                            <SocialButton href={socials.instagram} icon={Instagram} label="Instagram" color="#E1306C" />
                            <SocialButton href={socials.soundcloud} icon={Music} label="SoundCloud" color="#ff5500" />
                            <SocialButton href={socials.twitter} icon={Twitter} label="X / Twitter" color="#ffffff" />
                            <SocialButton href={socials.youtube} icon={Youtube} label="YouTube" color="#FF0000" />
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer style={{
                textAlign: 'center',
                padding: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                color: '#555',
                fontSize: '0.75rem',
            }}>
                <p>Made with <a href="./" style={{ color: style.primaryColor, textDecoration: 'none' }}>EasyPresskit</a></p>
            </footer>
        </div>
    );
};
