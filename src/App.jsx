import React, { useState, useEffect } from 'react';
import { generateUniqueStyle } from './utils/uniqueness';
import { TechRider } from './components/TechRider';
import { Camera, FileText, Music, User, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [profilePic, setProfilePic] = useState(null);
  const [bio, setBio] = useState('');
  const [hospitality, setHospitality] = useState('');
  const [artistInput, setArtistInput] = useState('');
  const [uniqueStyle, setUniqueStyle] = useState(generateUniqueStyle(''));
  const [selectedGear, setSelectedGear] = useState([]);

  useEffect(() => {
    setUniqueStyle(generateUniqueStyle(artistInput));
  }, [artistInput]);

  const toggleGear = (gearName) => {
    setSelectedGear(prev => [...prev, gearName]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const styleVariables = {
    '--neon-cyan': uniqueStyle.primaryColor,
    '--neon-pink': uniqueStyle.secondaryColor,
    '--glow-scale': uniqueStyle.glowIntensity,
  };

  return (
    <div className="app-container" style={styleVariables}>
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
                <label style={{ display: 'block', marginBottom: '0.5rem' }}><User size={16} /> Artist Name / Concept</label>
                <input
                  type="text"
                  placeholder="Type something to change styles..."
                  value={artistInput}
                  onChange={(e) => setArtistInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ textAlign: 'center' }}>
                <div
                  className="preview-photo"
                  style={{
                    width: '150px',
                    height: '150px',
                    border: '2px dashed var(--neon-cyan)',
                    margin: '0 auto 1rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    background: profilePic ? `url(${profilePic}) center/cover` : 'transparent'
                  }}
                >
                  {!profilePic && <Camera size={40} opacity={0.5} />}
                </div>
                <button onClick={() => document.getElementById('photo-input').click()}>
                  Upload Photo
                </button>
                <input
                  id="photo-input"
                  type="file"
                  hidden
                  onChange={handlePhotoUpload}
                  accept="image/*"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}><FileText size={16} /> Biography</label>
                <textarea
                  rows="4"
                  placeholder="Tell your story..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Hospitality Rider</label>
                <textarea
                  rows="3"
                  placeholder="What do you need backstage?"
                  value={hospitality}
                  onChange={(e) => setHospitality(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </section>

          {/* Real-time Preview */}
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
              <h3 className="neon-text-cyan" style={{ marginTop: '1rem' }}>{artistInput || 'Artist Name'}</h3>
              <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>{bio || 'Biography will appear here...'}</p>

              <div style={{ marginTop: '2rem', textAlign: 'left' }}>
                <h4 className="font-orbitron" style={{ fontSize: '0.8rem', color: 'var(--neon-pink)' }}>Equipment List</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>Click on 3D models to add:</p>
                <TechRider
                  primaryColor={uniqueStyle.primaryColor}
                  onAddEquipment={toggleGear}
                  selectedEquipment={selectedGear}
                />
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {selectedGear.length === 0 && <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No equipment selected.</span>}
                  {selectedGear.map((item, idx) => (
                    <span key={idx} style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      border: '1px solid var(--neon-cyan)',
                      borderRadius: '4px',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                      onClick={() => setSelectedGear(prev => prev.filter((_, i) => i !== idx))}
                    >
                      {item} ✖
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
              <button
                style={{ width: '100%' }}
                className="neon-border-cyan"
                onClick={() => {
                  const slug = artistInput.toLowerCase().replace(/\s+/g, '-');
                  alert(`Presskit link generated: https://easypresskit.io/${slug || 'artist'}`);
                }}
              >
                <Share2 size={16} style={{ marginRight: '0.5rem' }} /> Generate Link
              </button>
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
