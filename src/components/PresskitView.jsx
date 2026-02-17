import React, { useEffect, useState } from 'react';
import { loadPresskit } from '../services/presskitService';
import { Music, Instagram, Youtube, Twitter, ExternalLink } from 'lucide-react';
import { DJBoothPreview } from './DJBooth3D';

const ACCENT = '#ff1744';

const SoundCloudLogo = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M11.562 8.868v8.125h1.364V4.76c0-.52-.412-.937-.923-.937-.52 0-.912.417-.912.937v4.108h.47zm-2.062.664v7.46h1.365V6.99c0-.52-.413-.936-.924-.936-.52 0-.913.416-.913.936v2.54h.472zm-2.063 1.626v5.827h1.365V9.32c0-.51-.412-.937-.922-.937-.522 0-.914.426-.914.937v1.838h.47zm-2.06 1.84v3.993h1.363v-5.06c0-.52-.413-.945-.924-.945-.52 0-.913.424-.913.944v1.068h.474zm-2.094 1.93v2.063h1.365v-2.99c0-.548-.44-.96-.948-.96-.53 0-.95.412-.95.96v.928h.532zm16.136-5.35c-2.35 0-4.322 1.63-4.8 3.822v7.19h4.8c2.613 0 4.733-2.112 4.733-4.726 0-2.614-2.12-4.734-4.734-4.286z" />
    </svg>
);

/* ── Social button ── */
const SocialButton = ({ href, icon: Icon, label, color }) => {
    if (!href) return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" title={label}
            style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.7rem 1.2rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                color: '#ccc', textDecoration: 'none',
                fontSize: '0.85rem', fontFamily: 'Rajdhani, sans-serif',
                transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = color + '18';
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#ccc';
            }}
        >
            <Icon size={20} />
            <span style={{ fontWeight: 600 }}>{label}</span>
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
        </a>
    );
};

export const PresskitView = ({ slug }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPresskit(slug)
            .then((result) => { if (!result) setError('Presskit not found'); else setData(result); })
            .catch(() => setError('Failed to load presskit'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a' }}>
                <p style={{ color: ACCENT, fontFamily: 'Orbitron, sans-serif', fontSize: '0.9rem', letterSpacing: '0.2em' }}>LOADING...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0a', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: ACCENT, fontFamily: 'Orbitron, sans-serif', fontSize: '1rem' }}>{error}</p>
                <a href="./" style={{ color: '#888', fontSize: '0.85rem' }}>← Create your own presskit</a>
            </div>
        );
    }

    const socials = data.socials || {};
    const hasSocials = Object.values(socials).some(v => v);
    const verifyUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#e0e0e0', fontFamily: 'Rajdhani, sans-serif' }}>

            {/* ── HERO ── */}
            <header style={{
                position: 'relative',
                overflow: 'hidden',
                padding: '0',
            }}>
                {/* Dark gradient overlay */}
                <div style={{
                    position: 'relative',
                    padding: '5rem 2rem 4rem',
                    background: `linear-gradient(180deg, ${ACCENT}10 0%, #0a0a0a 100%)`,
                }}>
                    {/* Accent stripe top */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0,
                        height: '4px', background: ACCENT,
                    }} />

                    {/* Diagonal accent */}
                    <div style={{
                        position: 'absolute', top: 0, right: '-50px',
                        width: '200px', height: '100%',
                        background: `linear-gradient(135deg, transparent 30%, ${ACCENT}12 30%, ${ACCENT}18 50%, transparent 50%)`,
                    }} />

                    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                        <p style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.6rem',
                            letterSpacing: '0.4em',
                            color: ACCENT,
                            marginBottom: '2rem',
                        }}>
                            OFFICIAL PRESS KIT
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                            {data.photoURL && (
                                <img src={data.photoURL} alt={data.artistName}
                                    style={{
                                        width: '140px', height: '140px',
                                        borderRadius: '8px',
                                        border: `3px solid ${ACCENT}`,
                                        objectFit: 'cover',
                                        boxShadow: `0 0 40px ${ACCENT}25`,
                                    }}
                                />
                            )}
                            <div>
                                <h1 style={{
                                    fontFamily: 'Orbitron, sans-serif',
                                    fontSize: 'clamp(2rem, 6vw, 4rem)',
                                    fontWeight: 900, color: '#fff',
                                    lineHeight: 0.95, letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    {data.artistName}
                                </h1>
                                {data.artistConcept && (
                                    <p style={{
                                        fontFamily: 'Orbitron, sans-serif',
                                        fontSize: '0.7rem', letterSpacing: '0.2em',
                                        color: '#666', marginTop: '0.6rem',
                                        textTransform: 'uppercase',
                                    }}>
                                        {data.artistConcept}
                                    </p>
                                )}
                                {/* Social Links (Hero) */}
                                {hasSocials && (
                                    <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                                        <SocialButton href={verifyUrl(socials.instagram)} icon={Instagram} label="Instagram" color="#E1306C" />
                                        <SocialButton href={verifyUrl(socials.soundcloud)} icon={SoundCloudLogo} label="SoundCloud" color="#ff5500" />
                                        <SocialButton href={verifyUrl(socials.twitter)} icon={Twitter} label="X / Twitter" color="#ffffff" />
                                        <SocialButton href={verifyUrl(socials.youtube)} icon={Youtube} label="YouTube" color="#FF0000" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── CONTENT ── */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

                {/* About */}
                {data.bio && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            About
                        </h2>
                        <p style={{ lineHeight: '1.8', color: '#bbb', fontSize: '1.05rem' }}>{data.bio}</p>
                    </section>
                )}

                {/* Technical Rider */}
                {data.selectedGear && data.selectedGear.length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            Technical Rider
                        </h2>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                            {data.selectedGear.map((item, i) => (
                                <span key={i} style={{
                                    padding: '0.5rem 1rem',
                                    border: `1px solid ${ACCENT}50`,
                                    borderRadius: '6px', color: '#fff',
                                    fontSize: '0.85rem',
                                    fontFamily: 'Orbitron, sans-serif',
                                    background: `${ACCENT}12`,
                                    letterSpacing: '0.05em',
                                }}>
                                    {item}
                                </span>
                            ))}
                        </div>

                        {/* 3D Booth Preview in Public View */}
                        <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                            <DJBoothPreview
                                selectedEquipmentNames={data.selectedGear || []}
                                cdjCount={data.cdjCount || 2}
                            />
                        </div>

                        {/* Additional Tech Specs */}
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {data.monitoring && (
                                <div>
                                    <h3 style={{
                                        color: '#888', fontSize: '0.8rem',
                                        fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em',
                                        marginBottom: '0.5rem', textTransform: 'uppercase'
                                    }}>
                                        Monitoring
                                    </h3>
                                    <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {data.monitoring}
                                    </p>
                                </div>
                            )}

                            {data.tableSpecs && (
                                <div>
                                    <h3 style={{
                                        color: '#888', fontSize: '0.8rem',
                                        fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em',
                                        marginBottom: '0.5rem', textTransform: 'uppercase'
                                    }}>
                                        Stage / Booth
                                    </h3>
                                    <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {data.tableSpecs}
                                    </p>
                                </div>
                            )}

                            {data.otherTech && (
                                <div>
                                    <h3 style={{
                                        color: '#888', fontSize: '0.8rem',
                                        fontFamily: 'Orbitron, sans-serif', letterSpacing: '0.1em',
                                        marginBottom: '0.5rem', textTransform: 'uppercase'
                                    }}>
                                        Other Requirements
                                    </h3>
                                    <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                        {data.otherTech}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Hospitality */}
                {data.hospitality && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            Hospitality Rider
                        </h2>
                        <p style={{ lineHeight: '1.8', color: '#bbb', fontSize: '1.05rem' }}>{data.hospitality}</p>
                    </section>
                )}

                {/* Social Links (Removed from main content) */}
                {/* {hasSocials && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            Follow
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.6rem' }}>
                            <SocialButton href={verifyUrl(socials.instagram)} icon={Instagram} label="Instagram" color="#E1306C" />
                            <SocialButton href={verifyUrl(socials.soundcloud)} icon={Music} label="SoundCloud" color="#ff5500" />
                            <SocialButton href={verifyUrl(socials.twitter)} icon={Twitter} label="X / Twitter" color="#ffffff" />
                            <SocialButton href={verifyUrl(socials.youtube)} icon={Youtube} label="YouTube" color="#FF0000" />
                        </div>
                    </section>
                )} */}

                {/* Releases / Podcasts */}
                {data.media && data.media.filter(m => m.type === 'youtube' || m.type === 'soundcloud').length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            Releases / Podcasts
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {data.media.filter(m => m.type === 'youtube' || m.type === 'soundcloud').map((item, index) => (
                                <div key={index} style={{
                                    borderRadius: '8px', overflow: 'hidden',
                                    border: `1px solid ${ACCENT}30`,
                                    background: '#0d0d0d', aspectRatio: '16/9'
                                }}>
                                    {item.type === 'youtube' ? (
                                        <iframe
                                            width="100%" height="100%"
                                            src={`https://www.youtube.com/embed/${item.url}`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            style={{ display: 'block' }}
                                        ></iframe>
                                    ) : (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            scrolling="no"
                                            frameBorder="no"
                                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(item.url)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true`}
                                        ></iframe>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Media Gallery */}
                {data.media && data.media.filter(m => m.type === 'image' || !m.type).length > 0 && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '0.7rem', letterSpacing: '0.25em',
                            color: ACCENT, marginBottom: '1rem',
                            paddingBottom: '0.5rem',
                            borderBottom: `2px solid ${ACCENT}`,
                            display: 'inline-block',
                        }}>
                            Gallery
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {data.media.filter(m => m.type === 'image' || !m.type).map((item, index) => (
                                <div key={index} style={{
                                    borderRadius: '8px', overflow: 'hidden',
                                    border: `1px solid ${ACCENT}30`,
                                    background: '#0d0d0d', aspectRatio: '16/9'
                                }}>
                                    <img
                                        src={item.url}
                                        alt="Gallery"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>

            {/* Footer */}
            <footer style={{
                textAlign: 'center', padding: '2rem',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                color: '#333', fontSize: '0.75rem',
            }}>
                <p>Made with <a href="./" style={{ color: ACCENT, textDecoration: 'none' }}>EasyPresskit</a></p>
            </footer>
        </div>
    );
};
