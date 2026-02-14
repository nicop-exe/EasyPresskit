import React, { useState, useEffect } from 'react';
import { generateUniqueStyle } from './utils/uniqueness';
import { TechRider } from './components/TechRider';
import { PresskitView } from './components/PresskitView';
import { savePresskit } from './services/presskitService';
import { Camera, FileText, User, Share2, Loader, Instagram, Youtube, Music, Twitter } from 'lucide-react';
import { PricingCard } from './components/PricingCard';
import { PaywallModal } from './components/PaywallModal';
import { motion } from 'framer-motion';

function getSlugFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/artist\/(.+)$/);
  return match ? match[1] : null;
}

function App() {
  const [viewSlug, setViewSlug] = useState(getSlugFromHash());

  useEffect(() => {
    const onHashChange = () => setViewSlug(getSlugFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (viewSlug) return <PresskitView slug={viewSlug} />;
  return <CreatorStudio />;
}

/* ── Social input row ── */
const SocialInput = ({ icon: Icon, placeholder, value, onChange, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
    <div style={{
      width: '36px', height: '36px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.04)', borderRadius: '6px', flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <Icon size={16} color={color} />
    </div>
    <input type="url" placeholder={placeholder} value={value} onChange={onChange}
      style={{ padding: '0.55rem 0.7rem', fontSize: '0.85rem' }} />
  </div>
);

/* ── Creator Studio ── */
function CreatorStudio() {
  // Initialize state from localStorage if available
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('ep_profilePic') || null);
  const [bio, setBio] = useState(() => localStorage.getItem('ep_bio') || '');
  const [hospitality, setHospitality] = useState(() => localStorage.getItem('ep_hospitality') || '');
  const [artistName, setArtistName] = useState(() => localStorage.getItem('ep_artistName') || '');
  const [artistConcept, setArtistConcept] = useState(() => localStorage.getItem('ep_artistConcept') || '');

  const [selectedGear, setSelectedGear] = useState(() => {
    const saved = localStorage.getItem('ep_selectedGear');
    return saved ? JSON.parse(saved) : [];
  });

  const [cdjCount, setCdjCount] = useState(() => {
    const saved = localStorage.getItem('ep_cdjCount');
    return saved ? parseInt(saved, 10) : 2;
  });

  const [socials, setSocials] = useState(() => {
    const saved = localStorage.getItem('ep_socials');
    return saved ? JSON.parse(saved) : { instagram: '', soundcloud: '', twitter: '', youtube: '' };
  });

  const [media, setMedia] = useState(() => {
    const saved = localStorage.getItem('ep_media');
    return saved ? JSON.parse(saved) : [];
  });

  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState(null);

  const ACCENT = '#ff1744';

  // Persistence Effect
  useEffect(() => {
    try {
      localStorage.setItem('ep_artistName', artistName);
      localStorage.setItem('ep_artistConcept', artistConcept);
      localStorage.setItem('ep_bio', bio);
      localStorage.setItem('ep_hospitality', hospitality);
      localStorage.setItem('ep_selectedGear', JSON.stringify(selectedGear));
      localStorage.setItem('ep_cdjCount', cdjCount);
      localStorage.setItem('ep_socials', JSON.stringify(socials));
      localStorage.setItem('ep_media', JSON.stringify(media));

      if (profilePic) {
        localStorage.setItem('ep_profilePic', profilePic);
      } else {
        localStorage.removeItem('ep_profilePic');
      }
    } catch (error) {
      console.warn('LocalStorage quota exceeded or error:', error);
    }
  }, [artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, socials, media, profilePic]);

  const toggleGear = (name) => {
    setSelectedGear(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      // Smart Compression: If original is already < 200KB, don't re-encode
      if (file.size < 200 * 1024) {
        console.log('Using small profile pic directly:', (file.size / 1024).toFixed(2), 'KB');
        reader.onload = (event) => setProfilePic(event.target.result);
        reader.readAsDataURL(file);
        return;
      }

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setProfilePic(dataUrl);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMediaUpload = (e) => {
    if (media.length >= 6) { return alert('Max 6 media items allowed'); }
    const file = e.target.files[0];
    if (file) {
      // Free Tier: Max 2MB for gallery items too
      if (!isPro && file.size > 2 * 1024 * 1024) {
        alert('Free Plan Limit: Please upload images smaller than 2MB or Upgrade to Pro.');
        setPaywallFeature('High-Res Gallery');
        setShowPaywall(true);
        return;
      }

      if (file.size > 5 * 1024 * 1024) return alert('File too large (max 5MB source)');

      const reader = new FileReader();

      // Smart Compression: If original is already < 200KB, don't re-encode
      if (file.size < 200 * 1024) {
        console.log('Using small gallery pic directly:', (file.size / 1024).toFixed(2), 'KB');
        reader.onload = (event) => setMedia(prev => [...prev, { type: 'image', url: event.target.result }]);
        reader.readAsDataURL(file);
        return;
      }

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          // Pro: 1600px, Free: 1000px
          const MAX_SIZE = isPro ? 1600 : 1000;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Pro: 0.8, Free: 0.5
          const quality = isPro ? 0.8 : 0.5;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          setMedia(prev => [...prev, { type: 'image', url: dataUrl }]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const addYoutube = (url) => {
    // Pro Feature: YouTube Embeds
    if (!checkProFeature('YouTube Embeds')) return;

    if (media.length >= 6) { return alert('Max 6 media items allowed'); }
    if (!url) return;

    // Extract ID (supports youtu.be and youtube.com)
    let videoId = '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    } else {
      return alert('Invalid YouTube URL');
    }

    setMedia(prev => [...prev, { type: 'youtube', url: videoId }]);
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const ensureHttps = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
  };

  const updateSocial = (key) => (e) => {
    // Only sanitize on blur or submit, but here we just update state. 
    // The ensureHttps will be applied before saving or in the input onBlur if we want.
    // Actually, let's just keep the input raw but sanitize before save.
    setSocials(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!artistName.trim()) { alert('Please enter an artist name'); return; }
    setSaving(true); setSavedLink(null);

    // Sanitize socials
    const sanitizedSocials = {
      instagram: ensureHttps(socials.instagram),
      soundcloud: ensureHttps(socials.soundcloud),
      twitter: ensureHttps(socials.twitter),
      youtube: ensureHttps(socials.youtube),
    };

    // 1. Check Payload Size Limit (Firestore max is 1MB)
    const payloadString = JSON.stringify({
      artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials: sanitizedSocials, media
    });

    // String length is a good enough proxy for bytes in base64/JSON context
    const sizeInChars = payloadString.length;
    const sizeInMB = sizeInChars / (1024 * 1024);
    console.log(`Payload size: ${sizeInMB.toFixed(2)} MB`);

    if (sizeInMB > 0.95) {
      setSaving(false);
      alert(`Data too large (${sizeInMB.toFixed(2)} MB). Firestore has a 1MB limit. Please remove some photos or use smaller ones.`);
      return;
    }

    try {
      // Race the save operation against a 90-second timeout
      const savePromise = savePresskit({
        artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials: sanitizedSocials, media
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out. If you have many photos, try removing one.')), 90000);
      });

      const { slug } = await Promise.race([savePromise, timeoutPromise]);

      const base = window.location.origin + window.location.pathname;
      const finalLink = `${base}#/artist/${slug}`;
      setSavedLink(finalLink);
    } catch (err) {
      console.error('Save error details:', err);
      alert(`Error saving presskit: ${err.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{
        textAlign: 'center',
        padding: '2.5rem 2rem 1.5rem',
        borderBottom: '1px solid var(--border)',
      }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', color: '#fff', letterSpacing: '0.1em' }}>
          EASYPRESSKIT
        </h1>
        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
          Create your official press kit
        </p>
      </header>

      <main className="container">

        {/* Pro Subscription Modal */}
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName={paywallFeature}
        />

        {/* Pricing Section (Visible if not Pro) */}
        {!isPro && (
          <div style={{ marginBottom: '3rem' }}>
            <PricingCard isPro={isPro} onSubscribe={() => {
              // Simulating Checkout for MVP
              if (confirm('Proceed to Stripe Checkout? (Simulation)')) {
                alert('Payment Successful! You are now a Pro member.');
                setIsPro(true);
                localStorage.setItem('ep_isPro', 'true');
              }
            }} />
          </div>
        )}

        <div className="grid grid-2">

          {/* ── LEFT: Editor ── */}
          <section className="glass-panel">

            {/* Artist Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label><User size={14} /> Artist Name</label>
              <input type="text" placeholder="e.g. DJ Tiesto" value={artistName}
                onChange={(e) => setArtistName(e.target.value)} />
            </div>

            {/* Concept */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Genre / Style</label>
              <input type="text" placeholder="e.g. Dark Techno" value={artistConcept}
                onChange={(e) => setArtistConcept(e.target.value)} />
            </div>

            {/* Photo */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '130px', height: '130px',
                border: `2px dashed ${ACCENT}`,
                margin: '0 auto 0.8rem', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                background: profilePic ? `url(${profilePic}) center/cover` : 'transparent',
              }}>
                {!profilePic && <Camera size={32} color="#555" />}
              </div>
              <button onClick={() => document.getElementById('photo-input').click()}
                style={{ fontSize: '0.7rem', padding: '0.5rem 1.2rem' }}>
                Upload Photo
              </button>
              <input id="photo-input" type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
            </div>

            {/* Bio */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label><FileText size={14} /> Biography</label>
              <textarea rows="4" placeholder="Tell your story..." value={bio}
                onChange={(e) => setBio(e.target.value)} />
            </div>

            {/* Hospitality */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Hospitality Rider</label>
              <textarea rows="3" placeholder="What do you need backstage?" value={hospitality}
                onChange={(e) => setHospitality(e.target.value)} />
            </div>

            {/* Social Links */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.7rem' }}>Social Links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SocialInput icon={Instagram} placeholder="https://instagram.com/..." value={socials.instagram} onChange={updateSocial('instagram')} color="#E1306C" />
                <SocialInput icon={Music} placeholder="https://soundcloud.com/..." value={socials.soundcloud} onChange={updateSocial('soundcloud')} color="#ff5500" />
                <SocialInput icon={Twitter} placeholder="https://x.com/..." value={socials.twitter} onChange={updateSocial('twitter')} color="#999" />
                <SocialInput icon={Youtube} placeholder="https://youtube.com/..." value={socials.youtube} onChange={updateSocial('youtube')} color="#FF0000" />
              </div>
            </div>

            {/* Media Gallery */}
            <div>
              <label style={{ marginBottom: '0.7rem' }}>Media Gallery (Max 6 items)</label>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <input
                  type="text"
                  placeholder="Paste YouTube Link"
                  id="yt-input"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('yt-input');
                    addYoutube(input.value);
                    input.value = '';
                  }}
                  style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  Add Video
                </button>
              </div>

              <div style={{ marginBottom: '0.8rem' }}>
                <button onClick={() => document.getElementById('media-upload').click()}
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444' }}>
                  + Upload Photo (Limit 2MB)
                </button>
                <input id="media-upload" type="file" hidden onChange={handleMediaUpload} accept="image/*" />
              </div>

              {/* Media List */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {media.map((item, index) => (
                  <div key={index} style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                    {item.type === 'image' ? (
                      <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <img src={`https://img.youtube.com/vi/${item.url}/mqdefault.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    <button
                      onClick={() => removeMedia(index)}
                      style={{
                        position: 'absolute', top: 2, right: 2,
                        background: 'rgba(0,0,0,0.8)', color: '#fff',
                        border: 'none', borderRadius: '50%',
                        width: '20px', height: '20px',
                        fontSize: '0.8rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── RIGHT: Live Preview ── */}
          <section className="glass-panel accent-border">

            {/* Artist Header */}
            <div style={{
              position: 'relative',
              padding: '2rem 1.5rem',
              marginBottom: '1.5rem',
              background: `linear-gradient(135deg, ${ACCENT}15 0%, transparent 60%)`,
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>


              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                {profilePic ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={profilePic}
                    style={{
                      width: '80px', height: '80px', borderRadius: '50%',
                      border: `3px solid ${ACCENT}`, objectFit: 'cover', flexShrink: 0,
                    }}
                  />
                ) : (
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: '#1a1a1a', border: `2px dashed #333`, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <User size={24} color="#444" />
                  </div>
                )}
                <div>
                  <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
                    fontWeight: 900, color: '#fff', letterSpacing: '0.05em', lineHeight: 1.1,
                  }}>
                    {artistName || 'ARTIST NAME'}
                  </h2>
                  {artistConcept && (
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: '0.6rem',
                      letterSpacing: '0.15em', color: '#999', marginTop: '0.3rem',
                    }}>
                      {artistConcept.toUpperCase()}
                    </p>
                  )}
                </div>
              </div>

              {/* Diagonal accent stripe */}
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '60px', height: '100%',
                background: `linear-gradient(135deg, transparent 40%, ${ACCENT}20 40%, ${ACCENT}25 60%, transparent 60%)`,
                borderRadius: '0 8px 8px 0',
              }} />
            </div>

            {/* Biography */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">About</div>
              <p style={{ color: '#bbb', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {bio || 'Biography will appear here...'}
              </p>
            </div>

            {/* Equipment List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Technical Rider</div>
              <TechRider
                onAddEquipment={toggleGear}
                selectedEquipment={selectedGear}
                cdjCount={cdjCount}
                onCdjCountChange={setCdjCount}
              />
            </div>

            {/* Hospitality */}
            {hospitality && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="section-title">Hospitality Rider</div>
                <p style={{ color: '#bbb', lineHeight: '1.7', fontSize: '0.95rem' }}>{hospitality}</p>
              </div>
            )}

            {/* Social preview */}
            {Object.values(socials).some(v => v) && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="section-title">Follow</div>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {socials.instagram && <a href={ensureHttps(socials.instagram)} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}><Instagram size={22} /></a>}
                  {socials.soundcloud && <a href={ensureHttps(socials.soundcloud)} target="_blank" rel="noopener noreferrer" style={{ color: '#ff5500' }}><Music size={22} /></a>}
                  {socials.twitter && <a href={ensureHttps(socials.twitter)} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><Twitter size={22} /></a>}
                  {socials.youtube && <a href={ensureHttps(socials.youtube)} target="_blank" rel="noopener noreferrer" style={{ color: '#FF0000' }}><Youtube size={22} /></a>}
                </div>
              </div>
            )}

            {/* Save */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <button style={{
                width: '100%', opacity: saving ? 0.6 : 1,
                pointerEvents: saving ? 'none' : 'auto',
              }} onClick={handleSave}>
                {saving
                  ? <><Loader size={16} style={{ marginRight: '0.5rem', animation: 'spin 1s linear infinite' }} /> Saving...</>
                  : <><Share2 size={16} style={{ marginRight: '0.5rem' }} /> Generate Link</>
                }
              </button>

              {savedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    marginTop: '1rem', padding: '1rem',
                    background: `${ACCENT}10`, border: `1px solid ${ACCENT}`,
                    borderRadius: '8px', textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>✓ Presskit saved!</p>
                  <a href={savedLink} target="_blank" rel="noopener noreferrer"
                    style={{ color: ACCENT, wordBreak: 'break-all', fontSize: '0.8rem', textDecoration: 'underline' }}>
                    {savedLink}
                  </a>
                  <button style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.7rem', padding: '0.5rem' }}
                    onClick={() => { navigator.clipboard.writeText(savedLink); alert('Link copied!'); }}>
                    📋 Copy Link
                  </button>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: '#333', fontSize: '0.75rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
        <p>© 2026 EasyPresskit — Modern Artist Solutions</p>
      </footer>
    </div>
  );
}

export default App;
