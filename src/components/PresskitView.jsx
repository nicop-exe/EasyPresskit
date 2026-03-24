import React, { useEffect, useState } from 'react';
import { loadPresskit } from '../services/presskitService';
import { Music, Instagram, Youtube, ExternalLink, FileDown } from 'lucide-react';
import { DJBoothPreview } from './DJBooth3D';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Default accent for loading/error states
const DEFAULT_ACCENT = '#ff1744';

const SoundCloudLogo = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.169h-8.18a.68.68 0 0 1-.675-.683V7.862a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.763.755 5.433 5.433 0 0 1 2.57 3.54c.282-.08.574-.121.868-.12.884 0 1.73.358 2.347.992s.948 1.49.922 2.373ZM10.721 8.421c.247 2.98.427 5.697 0 8.672a.264.264 0 0 1-.53 0c-.395-2.946-.22-5.718 0-8.672a.264.264 0 0 1 .53 0ZM9.072 9.448c.285 2.659.37 4.986-.006 7.655a.277.277 0 0 1-.55 0c-.331-2.63-.256-5.02 0-7.655a.277.277 0 0 1 .556 0Zm-1.663-.257c.27 2.726.39 5.171 0 7.904a.266.266 0 0 1-.532 0c-.38-2.69-.257-5.21 0-7.904a.266.266 0 0 1 .532 0Zm-1.647.77a26.108 26.108 0 0 1-.008 7.147.272.272 0 0 1-.542 0 27.955 27.955 0 0 1 0-7.147.275.275 0 0 1 .55 0Zm-1.67 1.769c.421 1.865.228 3.5-.029 5.388a.257.257 0 0 1-.514 0c-.21-1.858-.398-3.549 0-5.389a.272.272 0 0 1 .543 0Zm-1.655-.273c.388 1.897.26 3.508-.01 5.412-.026.28-.514.283-.54 0-.244-1.878-.347-3.54-.01-5.412a.283.283 0 0 1 .56 0Zm-1.668.911c.4 1.268.257 2.292-.026 3.572a.257.257 0 0 1-.514 0c-.241-1.262-.354-2.312-.023-3.572a.283.283 0 0 1 .563 0Z" />
    </svg>
);

const XLogo = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
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
                background: 'var(--tpl-btn-bg)',
                border: '1px solid var(--tpl-btn-border)',
                borderRadius: '8px',
                color: 'var(--tpl-text-dim)', textDecoration: 'none',
                fontSize: '0.85rem', fontFamily: 'var(--tpl-font-body)',
                transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--tpl-btn-hover)';
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--tpl-btn-bg)';
                e.currentTarget.style.borderColor = 'var(--tpl-btn-border)';
                e.currentTarget.style.color = 'var(--tpl-text-dim)';
            }}
        >
            <Icon size={20} />
            <span style={{ fontWeight: 600 }}>{label}</span>
            <ExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.4 }} />
        </a>
    );
};

export const PresskitView = ({ slug, previewData = null, isPreview = false }) => {
    const [data, setData] = useState(previewData || null);
    const [loading, setLoading] = useState(!previewData);
    const [error, setError] = useState(null);

    // Check if URL has ?mode=public
    const searchParams = new URLSearchParams(window.location.search);
    const isPublicMode = searchParams.get('mode') === 'public';

    useEffect(() => {
        if (previewData) {
            setData(previewData);
            setLoading(false);
            return;
        }
        if (slug) {
            setLoading(true);
            loadPresskit(slug)
                .then((result) => { if (!result) setError('Presskit not found'); else setData(result); })
                .catch(() => setError('Failed to load presskit'))
                .finally(() => setLoading(false));
        }
    }, [slug, previewData]);

    const handleDownloadMedia = async () => {
        if (!data || !data.media) return;
        const mediaItems = data.media.filter(m => m.type === 'image' || !m.type);
        if (!mediaItems.length) return;

        try {
            const zip = new JSZip();
            const promises = mediaItems.map(async (item, i) => {
                const url = item.url;
                let blob;
                if (url.startsWith('data:')) {
                    // Base64 data URL — convert directly
                    const res = await fetch(url);
                    blob = await res.blob();
                } else {
                    // Storage URL — fetch with CORS
                    const res = await fetch(url, { mode: 'cors' });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    blob = await res.blob();
                }
                const ext = blob.type.split('/')[1] || 'jpg';
                zip.file(`${data.artistName.replace(/[^a-zA-Z0-9]/g, '_')}_media_${i + 1}.${ext}`, blob);
            });

            await Promise.all(promises);
            const content = await zip.generateAsync({ type: 'blob' });
            saveAs(content, `${data.artistName.replace(/[^a-zA-Z0-9]/g, '_')}_Presskit_Media.zip`);
        } catch (err) {
            console.error("Zip download failed:", err);
            // Fallback: open each image in a new tab
            const storageUrls = mediaItems.filter(m => !m.url.startsWith('data:')).map(m => m.url);
            if (storageUrls.length > 0) {
                alert('Downloading images individually. Please allow pop-ups if prompted.');
                storageUrls.forEach(url => window.open(url, '_blank'));
            } else {
                alert('Download failed. Please try again.');
            }
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh',  }}>
                <p style={{ color: DEFAULT_ACCENT, fontFamily: 'var(--tpl-font-display)', fontSize: '0.9rem', letterSpacing: '0.2em' }}>LOADING...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: DEFAULT_ACCENT, fontFamily: 'var(--tpl-font-display)', fontSize: '1rem' }}>{error}</p>
                <a href="./" style={{ color: 'var(--tpl-text-muted)', fontSize: '0.85rem' }}>← Create your own presskit</a>
            </div>
        );
    }

    const socials = data.socials || {};
    const hasSocials = Object.values(socials).some(v => v);
    const theme = data.theme || { accentColor: DEFAULT_ACCENT, backgroundImage: null };
    const ACCENT = theme.accentColor || DEFAULT_ACCENT;

    const verifyUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    return (
        <div className={`epk-template-${theme.templateId || 'neon'}`} style={{
            background: 'var(--tpl-bg)',
            backgroundImage: theme.backgroundImage && theme.templateId !== 'minimal' ? `url(${theme.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: isPreview ? 'scroll' : 'fixed',
            minHeight: '100vh',
            color: 'var(--tpl-text-main)',
            fontFamily: 'var(--tpl-font-body)',
            position: 'relative'
        }}>
            {theme.backgroundImage && theme.templateId !== 'minimal' && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 0, pointerEvents: 'none'
                }} />
            )}
            <style>{`
                :root {
                    --accent: ${ACCENT};
                    --accent-dim: ${ACCENT}25;
                    --accent-glow: ${ACCENT}66;
                }
            `}</style>
            <div style={{ position: 'relative', zIndex: 1 }}>

                {/* ── HERO ── */}
                <header style={{
                    position: 'relative',
                    overflow: 'hidden',
                    padding: '0',
                }}>
                    {/* Header gradient overlay */}
                    <div style={{
                        position: 'relative',
                        padding: '5rem 2rem 4rem',
                        background: `linear-gradient(180deg, ${ACCENT}10 0%, var(--tpl-bg-header) 100%)`,
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
                                fontFamily: 'var(--tpl-font-display)',
                                fontSize: '0.6rem',
                                letterSpacing: '0.4em',
                                color: ACCENT,
                                marginBottom: '2rem',
                            }}>
                                OFFICIAL PRESS KIT
                            </p>

                            <div className="epk-hero-content" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
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
                                        fontFamily: 'var(--tpl-font-display)',
                                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                                        fontWeight: 900, color: 'var(--tpl-text-main)',
                                        lineHeight: 0.95, letterSpacing: '0.05em',
                                        textTransform: 'uppercase',
                                    }}>
                                        {data.artistName}
                                    </h1>
                                    {data.artistConcept && (
                                        <p style={{
                                            fontFamily: 'var(--tpl-font-display)',
                                            fontSize: '0.7rem', letterSpacing: '0.2em',
                                            color: 'var(--tpl-text-muted)', marginTop: '0.6rem',
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
                                            <SocialButton href={verifyUrl(socials.twitter)} icon={XLogo} label="X / Twitter" color="#ffffff" />
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
                                fontFamily: 'var(--tpl-font-display)',
                                fontSize: '0.7rem', letterSpacing: '0.25em',
                                color: ACCENT, marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: `2px solid ${ACCENT}`,
                                display: 'inline-block',
                            }}>
                                About
                            </h2>
                            <p style={{ lineHeight: '1.8', color: 'var(--tpl-text-dim)', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{data.bio}</p>
                        </section>
                    )}

                    {/* Stats & Highlights */}
                    {(data.stats?.some(s => s.value && s.label) || data.supportedBy) && (
                        <section style={{
                            marginBottom: '3rem',
                            background: 'var(--tpl-bg-card)',
                            border: '1px solid var(--tpl-border)',
                            padding: '1.5rem', borderRadius: '12px'
                        }}>
                            {/* Key Metrics */}
                            {data.stats && data.stats.some(s => s.value && s.label) && (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '1.5rem',
                                    marginBottom: data.supportedBy ? '2rem' : '0'
                                }}>
                                    {data.stats.filter(s => s.value && s.label).map((stat, i) => (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div style={{
                                                fontFamily: 'var(--tpl-font-display)',
                                                fontSize: '2rem',
                                                fontWeight: 900,
                                                color: ACCENT,
                                                marginBottom: '0.2rem'
                                            }}>{stat.value}</div>
                                            <div style={{
                                                fontSize: '0.75rem',
                                                color: 'var(--tpl-text-muted)',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em'
                                            }}>{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Supported By */}
                            {data.supportedBy && (
                                <div style={{ textAlign: 'center', marginTop: data.stats?.some(s => s.value && s.label) ? '1.5rem' : '0', paddingTop: data.stats?.some(s => s.value && s.label) ? '1.5rem' : '0', borderTop: data.stats?.some(s => s.value && s.label) ? '1px solid var(--tpl-border)' : 'none' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--tpl-text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>SUPPORTED BY</div>
                                    <div style={{
                                        color: 'var(--tpl-text-main)',
                                        fontSize: '1.1rem',
                                        lineHeight: 1.6,
                                        fontStyle: 'italic',
                                        fontFamily: 'Georgia, serif'
                                    }}>
                                        {data.supportedBy}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Technical Rider - Hidden if Public Mode */}
                    {!isPublicMode && data.selectedGear && data.selectedGear.length > 0 && (
                        <section className="print-break-before" style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontFamily: 'var(--tpl-font-display)',
                                fontSize: '0.7rem', letterSpacing: '0.25em',
                                color: ACCENT, marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: `2px solid ${ACCENT}`,
                                display: 'inline-block',
                            }}>
                                Technical Rider
                            </h2>
                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                {data.selectedGear.filter(item => item !== 'Technics SL-1200').map((item, i) => (
                                    <span key={i} style={{
                                        padding: '0.5rem 1rem',
                                        border: `1px solid var(--tpl-border)`,
                                        borderRadius: '6px', color: 'var(--tpl-text-main)',
                                        fontSize: '0.85rem',
                                        fontFamily: 'var(--tpl-font-display)',
                                        background: 'var(--tpl-bg-card)',
                                        letterSpacing: '0.05em',
                                    }}>
                                        {item}
                                    </span>
                                ))}
                            </div>

                            {/* 3D Booth Preview in Public View */}
                            <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                                <DJBoothPreview
                                    selectedEquipmentNames={data.selectedGear ? data.selectedGear.filter(item => item !== 'Technics SL-1200') : []}
                                    cdjCount={data.cdjCount || 2}
                                />
                            </div>

                            {/* Additional Tech Specs */}
                            <div style={{ display: 'grid', gap: '1.5rem' }}>
                                {data.monitoring && (
                                    <div>
                                        <h3 style={{
                                            color: 'var(--tpl-text-muted)', fontSize: '0.8rem',
                                            fontFamily: 'var(--tpl-font-display)', letterSpacing: '0.1em',
                                            marginBottom: '0.5rem', textTransform: 'uppercase'
                                        }}>
                                            Monitoring
                                        </h3>
                                        <p style={{ color: 'var(--tpl-text-dim)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                            {data.monitoring}
                                        </p>
                                    </div>
                                )}

                                {data.tableSpecs && (
                                    <div>
                                        <h3 style={{
                                            color: 'var(--tpl-text-muted)', fontSize: '0.8rem',
                                            fontFamily: 'var(--tpl-font-display)', letterSpacing: '0.1em',
                                            marginBottom: '0.5rem', textTransform: 'uppercase'
                                        }}>
                                            Stage / Booth
                                        </h3>
                                        <p style={{ color: 'var(--tpl-text-dim)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                            {data.tableSpecs}
                                        </p>
                                    </div>
                                )}

                                {data.otherTech && (
                                    <div>
                                        <h3 style={{
                                            color: 'var(--tpl-text-muted)', fontSize: '0.8rem',
                                            fontFamily: 'var(--tpl-font-display)', letterSpacing: '0.1em',
                                            marginBottom: '0.5rem', textTransform: 'uppercase'
                                        }}>
                                            Other Requirements
                                        </h3>
                                        <p style={{ color: 'var(--tpl-text-dim)', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                                            {data.otherTech}
                                        </p>
                                    </div>
                                )}

                                {data.techRiderPdf && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <h3 style={{
                                            color: 'var(--tpl-text-muted)', fontSize: '0.8rem',
                                            fontFamily: 'var(--tpl-font-display)', letterSpacing: '0.1em',
                                            marginBottom: '0.5rem', textTransform: 'uppercase'
                                        }}>
                                            Full Tech Rider
                                        </h3>
                                        <a href={data.techRiderPdf} target="_blank" rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                                background: ACCENT, color: 'var(--tpl-text-main)',
                                                padding: '0.8rem 1.5rem', borderRadius: '8px',
                                                textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem',
                                                transition: 'opacity 0.2s'
                                            }}>
                                            <FileDown size={18} /> Download Tech Rider (PDF)
                                        </a>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* Hospitality - Hidden if Public Mode */}
                    {!isPublicMode && data.hospitality && (
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{
                                fontFamily: 'var(--tpl-font-display)',
                                fontSize: '0.7rem', letterSpacing: '0.25em',
                                color: ACCENT, marginBottom: '1rem',
                                paddingBottom: '0.5rem',
                                borderBottom: `2px solid ${ACCENT}`,
                                display: 'inline-block',
                            }}>
                                Hospitality Rider
                            </h2>
                            <p style={{ lineHeight: '1.8', color: 'var(--tpl-text-dim)', fontSize: '1.05rem' }}>{data.hospitality}</p>
                        </section>
                    )}

                    {/* Social Links (Removed from main content) */}
                    {/* {hasSocials && (
                    <section style={{ marginBottom: '3rem' }}>
                        <h2 style={{
                            fontFamily: 'var(--tpl-font-display)',
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
                                fontFamily: 'var(--tpl-font-display)',
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
                                        border: `1px solid var(--tpl-border)`,
                                        background: 'var(--tpl-bg-card)', aspectRatio: '16/9'
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

                    {/* Gallery Print fallback */}
                    <div className="print-only">
                        <p style={{ color: 'var(--tpl-text-muted)', fontStyle: 'italic', fontSize: '0.8rem' }}>Note: Media gallery is available in the web version of the presskit.</p>
                    </div>

                    {/* Media Gallery (Hidden in print to save ink/pages) */}
                    {/* Media Gallery (Hidden in print to save ink/pages) */}
                    <div className="no-print">
                        {data.media && data.media.filter(m => m.type === 'image' || !m.type).length > 0 && (
                            <section style={{ marginBottom: '3rem' }}>
                                <h2 style={{
                                    fontFamily: 'var(--tpl-font-display)',
                                    fontSize: '0.7rem', letterSpacing: '0.25em',
                                    color: ACCENT, marginBottom: '1rem',
                                    paddingBottom: '0.5rem',
                                    borderBottom: `2px solid ${ACCENT}`,
                                    display: 'inline-block',
                                }}>
                                    Gallery
                                </h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                                    {data.media.filter(m => m.type === 'image' || !m.type).map((item, index) => (
                                        <div key={index} style={{
                                            borderRadius: '8px', overflow: 'hidden',
                                            border: `1px solid var(--tpl-border)`,
                                            background: 'var(--tpl-bg-card)', aspectRatio: '16/9'
                                        }}>
                                            <img
                                                src={item.url}
                                                alt="Gallery"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <button onClick={handleDownloadMedia} style={{
                                        background: ACCENT, color: 'var(--tpl-bg)', border: 'none',
                                        padding: '0.8rem 1.5rem', borderRadius: '4px',
                                        fontFamily: 'var(--tpl-font-display)', fontSize: '0.8rem',
                                        fontWeight: 'bold', cursor: 'pointer', letterSpacing: '0.1em'
                                    }}>
                                        DOWNLOAD ALL MEDIA
                                    </button>
                                </div>
                            </section>
                        )}
                    </div>
                </main>

                {/* Footer */}
                <footer className="no-print" style={{
                    textAlign: 'center', padding: '3rem 2rem',
                    borderTop: '1px solid var(--tpl-border)',
                    color: 'var(--tpl-text-dim)', fontSize: '0.75rem',
                    display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center'
                }}>
                    <a href="./" style={{
                        display: 'inline-block',
                        padding: '0.8rem 1.5rem',
                        border: `1px solid ${ACCENT}`,
                        borderRadius: '4px',
                        color: ACCENT,
                        textDecoration: 'none',
                        fontFamily: 'var(--tpl-font-display)',
                        fontSize: '0.8rem',
                        letterSpacing: '0.1em',
                        transition: 'all 0.2s',
                        background: `${ACCENT}10`
                    }}>
                        CREATE YOUR OWN PRESSKIT
                    </a>
                    <p>Easy Presskit by <a href="https://www.instagram.com/nicop.exe" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid currentColor' }}>nicop.exe</a></p>
                </footer>
            </div>
        </div>
    );
};
