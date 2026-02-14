import React, { useState, useEffect } from 'react';
import { generateUniqueStyle } from './utils/uniqueness';
import { TechRider } from './components/TechRider';
import { PresskitView } from './components/PresskitView';
import { savePresskit } from './services/presskitService';
import { Camera, FileText, User, Share2, Loader, Instagram, Youtube, Music, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

/* ── Detect if we're viewing an existing presskit via hash ── */
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

  if (viewSlug) {
    return <PresskitView slug={viewSlug} />;
  }

  return <CreatorStudio />;
}

/* ── Social link input row ── */
const SocialInput = ({ icon: Icon, label, placeholder, value, onChange, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
    <div style={{
      width: '34px', height: '34px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '6px',
      flexShrink: 0,
    }}>
      <Icon size={16} color={color} />
    </div>
    <input
      type="url"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{ width: '100%', padding: '0.5rem 0.7rem', fontSize: '0.85rem' }}
    />
  </div>
);

/* ── Creator Studio ── */
function CreatorStudio() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState('');
  const [hospitality, setHospitality] = useState('');
  const [artistName, setArtistName] = useState('');
  const [artistConcept, setArtistConcept] = useState('');
  const [uniqueStyle, setUniqueStyle] = useState(generateUniqueStyle(''));
  const [selectedGear, setSelectedGear] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState(null);
  const [socials, setSocials] = useState({
    instagram: '',
    soundcloud: '',
    twitter: '',
    youtube: '',
  });

  useEffect(() => {
    setUniqueStyle(generateUniqueStyle(artistConcept));
  }, [artistConcept]);

  const toggleGear = (gearName) => {
    setSelectedGear(prev =>
      prev.includes(gearName) ? prev.filter(g => g !== gearName) : [...prev, gearName]
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateSocial = (key) => (e) => {
    setSocials(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!artistName.trim()) { alert('Please enter an artist name'); return; }
    setSaving(true);
    setSavedLink(null);
    try {
      const { slug } = await savePresskit({
        artistName, artistConcept, bio, hospitality, selectedGear, profilePic, socials,
      });
      const base = window.location.origin + window.location.pathname;
      setSavedLink(`${base}#/artist/${slug}`);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Error saving presskit: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const styleVars = {
    '--neon-cyan': uniqueStyle.primaryColor,
    '--neon-pink': uniqueStyle.secondaryColor,
  };

  return (
    <div className="app-container" style={styleVars}>
      <header className="container" style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 className="neon-text-cyan">
          EasyPresskit <span style={{ fontSize: '0.5em', color: 'var(--neon-pink)', verticalAlign: 'middle' }}>by nicop.exe</span>
        </h1>
        <p style={{ color: 'var(--text-dim)' }}>Create your unique artist identity</p>
      </header>

      <main className="container">
        <div className="grid grid-2">
          {/* Creator UI */}
          <section className="glass-panel">
            <h2 className="neon-text-cyan" style={{ marginBottom: '1.5rem' }}>Creator Studio</h2>

            <div className="grid" style={{ gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}><User size={16} /> Artist Name</label>
                <input type="text" placeholder="e.g. DJ Tiesto" value={artistName} onChange={(e) => setArtistName(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Visual Concept / Vibe</label>
                <input type="text" placeholder="e.g. Cyberpunk Acid Techno" value={artistConcept} onChange={(e) => setArtistConcept(e.target.value)} style={{ width: '100%' }} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>Determines your unique color palette.</p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '150px', height: '150px',
                  border: '2px dashed var(--neon-cyan)',
                  margin: '0 auto 1rem', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                  background: profilePic ? `url(${profilePic}) center/cover` : 'transparent'
                }}>
                  {!profilePic && <Camera size={40} opacity={0.5} />}
                </div>
                <button onClick={() => document.getElementById('photo-input').click()}>Upload Photo</button>
                <input id="photo-input" type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}><FileText size={16} /> Biography</label>
                <textarea rows="4" placeholder="Tell your story..." value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hospitality Rider</label>
                <textarea rows="3" placeholder="What do you need backstage?" value={hospitality} onChange={(e) => setHospitality(e.target.value)} style={{ width: '100%' }} />
              </div>

              {/* Social Links */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600 }}>Social Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <SocialInput icon={Instagram} label="Instagram" placeholder="https://instagram.com/..." value={socials.instagram} onChange={updateSocial('instagram')} color="#E1306C" />
                  <SocialInput icon={Music} label="SoundCloud" placeholder="https://soundcloud.com/..." value={socials.soundcloud} onChange={updateSocial('soundcloud')} color="#ff5500" />
                  <SocialInput icon={Twitter} label="X / Twitter" placeholder="https://x.com/..." value={socials.twitter} onChange={updateSocial('twitter')} color="#ffffff" />
                  <SocialInput icon={Youtube} label="YouTube" placeholder="https://youtube.com/..." value={socials.youtube} onChange={updateSocial('youtube')} color="#FF0000" />
                </div>
              </div>
            </div>
          </section>

          {/* Live Preview */}
          <section className="glass-panel neon-border-cyan">
            <h2 className="neon-text-pink" style={{ marginBottom: '1.5rem' }}>Live Preview</h2>
            <div style={{ textAlign: 'center' }}>
              {profilePic && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={profilePic}
                  style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid var(--neon-cyan)', objectFit: 'cover' }}
                />
              )}
              <h3 className="neon-text-cyan" style={{ marginTop: '1rem' }}>{artistName || 'Artist Name'}</h3>
              <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{bio || 'Biography will appear here...'}</p>

              <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                <h4 className="font-orbitron" style={{ fontSize: '0.8rem', color: 'var(--neon-pink)' }}>Equipment List</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Click equipment to add to your rider:</p>
                <TechRider primaryColor={uniqueStyle.primaryColor} onAddEquipment={toggleGear} selectedEquipment={selectedGear} />

                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  {selectedGear.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No equipment selected.</span>}
                  {selectedGear.map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem', padding: '0.3rem 0.6rem',
                      border: '1px solid var(--neon-cyan)', borderRadius: '4px',
                      color: 'white', cursor: 'pointer', background: 'rgba(0, 242, 255, 0.08)',
                    }} onClick={() => setSelectedGear(prev => prev.filter((_, i) => i !== idx))}>
                      {item} ✖
                    </span>
                  ))}
                </div>
              </div>

              {/* Social preview */}
              {Object.values(socials).some(v => v) && (
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {socials.instagram && <a href={socials.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={20} color="#E1306C" /></a>}
                  {socials.soundcloud && <a href={socials.soundcloud} target="_blank" rel="noopener noreferrer"><Music size={20} color="#ff5500" /></a>}
                  {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer"><Twitter size={20} color="#fff" /></a>}
                  {socials.youtube && <a href={socials.youtube} target="_blank" rel="noopener noreferrer"><Youtube size={20} color="#FF0000" /></a>}
                </div>
              )}
            </div>

            {/* Save */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <button
                style={{ width: '100%', opacity: saving ? 0.6 : 1, pointerEvents: saving ? 'none' : 'auto' }}
                className="neon-border-cyan"
                onClick={handleSave}
              >
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
                    background: 'rgba(0, 242, 255, 0.08)',
                    border: '1px solid var(--neon-cyan)',
                    borderRadius: '8px', textAlign: 'center',
                  }}
                >
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>✓ Presskit saved! Share this link:</p>
                  <a href={savedLink} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--neon-cyan)', wordBreak: 'break-all', fontSize: '0.85rem', textDecoration: 'underline' }}>
                    {savedLink}
                  </a>
                  <button
                    style={{ marginTop: '0.75rem', width: '100%', fontSize: '0.75rem', padding: '0.5rem' }}
                    onClick={() => { navigator.clipboard.writeText(savedLink); alert('Link copied!'); }}
                  >
                    📋 Copy Link
                  </button>
                </motion.div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <p>&copy; 2026 EasyPresskit - Modern Artist Solutions</p>
      </footer>
    </div>
  );
}

export default App;
