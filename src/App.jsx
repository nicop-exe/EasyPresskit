import React, { useState, useEffect } from 'react';
import { generateUniqueStyle } from './utils/uniqueness';
import { TechRider } from './components/TechRider';
import { PresskitView } from './components/PresskitView';
import { savePresskit } from './services/presskitService';
import { Camera, FileText, User, Share2, Loader, Instagram, Youtube, Music, Twitter } from 'lucide-react';
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
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState('');
  const [hospitality, setHospitality] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistConcept, setArtistConcept] = useState('');
  const [selectedGear, setSelectedGear] = useState([]);
  const [cdjCount, setCdjCount] = useState(2);
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState(null);
  const [socials, setSocials] = useState({ instagram: '', soundcloud: '', twitter: '', youtube: '' });

  const ACCENT = '#ff1744';

  const toggleGear = (name) => {
    setSelectedGear(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateSocial = (key) => (e) => setSocials(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!artistName.trim()) { alert('Please enter an artist name'); return; }
    setSaving(true); setSavedLink(null);
    try {
      const { slug } = await savePresskit({ artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials });
      const base = window.location.origin + window.location.pathname;
      setSavedLink(`${base}#/artist/${slug}`);
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally { setSaving(false); }
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
            <div>
              <label style={{ marginBottom: '0.7rem' }}>Social Links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SocialInput icon={Instagram} placeholder="https://instagram.com/..." value={socials.instagram} onChange={updateSocial('instagram')} color="#E1306C" />
                <SocialInput icon={Music} placeholder="https://soundcloud.com/..." value={socials.soundcloud} onChange={updateSocial('soundcloud')} color="#ff5500" />
                <SocialInput icon={Twitter} placeholder="https://x.com/..." value={socials.twitter} onChange={updateSocial('twitter')} color="#999" />
                <SocialInput icon={Youtube} placeholder="https://youtube.com/..." value={socials.youtube} onChange={updateSocial('youtube')} color="#FF0000" />
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
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer" style={{ color: '#E1306C' }}><Instagram size={22} /></a>}
                  {socials.soundcloud && <a href={socials.soundcloud} target="_blank" rel="noopener noreferrer" style={{ color: '#ff5500' }}><Music size={22} /></a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}><Twitter size={22} /></a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer" style={{ color: '#FF0000' }}><Youtube size={22} /></a>}
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
