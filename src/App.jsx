import React, { useState, useEffect } from 'react';
import { generateUniqueStyle } from './utils/uniqueness';
import { TechRider } from './components/TechRider';
import { PresskitView } from './components/PresskitView';
import { savePresskit, checkProStatus, getUserPresskit } from './services/presskitService';
import { Camera, FileText, User, Share2, Loader, Instagram, Youtube, Music, Twitter } from 'lucide-react';
import { PricingCard } from './components/PricingCard';
import { PaywallModal } from './components/PaywallModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserMenu } from './components/UserMenu';
import { motion } from 'framer-motion';

function getSlugFromHash() {
  const hash = window.location.hash;
  const match = hash.match(/^#\/artist\/(.+)$/);
  return match ? match[1] : null;
}

function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { currentUser, loginWithGoogle } = useAuth();
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
  const { currentUser, loginWithGoogle } = useAuth();
  // Initialize state from localStorage if available (v2 keys)
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('ep_profilePic_v2') || null);
  const [bio, setBio] = useState(() => localStorage.getItem('ep_bio_v2') || '');
  const [hospitality, setHospitality] = useState(() => localStorage.getItem('ep_hospitality_v2') || '');

  // Enhanced Tech Rider State
  const [monitoring, setMonitoring] = useState(() => localStorage.getItem('ep_monitoring_v2') || '');
  const [tableSpecs, setTableSpecs] = useState(() => localStorage.getItem('ep_tableSpecs_v2') || '');
  const [otherTech, setOtherTech] = useState(() => localStorage.getItem('ep_otherTech_v2') || '');

  const [artistName, setArtistName] = useState(() => localStorage.getItem('ep_artistName_v2') || '');
  const [artistConcept, setArtistConcept] = useState(() => localStorage.getItem('ep_artistConcept_v2') || '');

  // Pro State
  const [isPro, setIsPro] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState('');

  // Derive slug from artistName for Stripe & Firestore
  const currentSlug = artistName
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '';

  const [selectedGear, setSelectedGear] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_selectedGear_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [cdjCount, setCdjCount] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_cdjCount_v2');
      return saved ? parseInt(saved, 10) : 2;
    } catch (e) { return 2; }
  });

  const [socials, setSocials] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_socials_v2');
      return saved ? JSON.parse(saved) : { instagram: '', soundcloud: '', twitter: '', youtube: '' };
    } catch (e) { return { instagram: '', soundcloud: '', twitter: '', youtube: '' }; }
  });

  const [media, setMedia] = useState(() => {
    try {
      const saved = localStorage.getItem('ep_media_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [saving, setSaving] = useState(false);
  const [savedLink, setSavedLink] = useState(null);

  const ACCENT = '#ff1744';

  // Persistence Effect (v2 keys)
  useEffect(() => {
    try {
      localStorage.setItem('ep_artistName_v2', artistName);
      localStorage.setItem('ep_artistConcept_v2', artistConcept);
      localStorage.setItem('ep_bio_v2', bio);
      localStorage.setItem('ep_hospitality_v2', hospitality);
      localStorage.setItem('ep_monitoring_v2', monitoring);
      localStorage.setItem('ep_tableSpecs_v2', tableSpecs);
      localStorage.setItem('ep_otherTech_v2', otherTech);
      localStorage.setItem('ep_selectedGear_v2', JSON.stringify(selectedGear));
      localStorage.setItem('ep_cdjCount_v2', cdjCount);
      localStorage.setItem('ep_socials_v2', JSON.stringify(socials));
      localStorage.setItem('ep_media_v2', JSON.stringify(media));

      if (profilePic) {
        localStorage.setItem('ep_profilePic_v2', profilePic);
      } else {
        localStorage.removeItem('ep_profilePic_v2');
      }

      // Check pro status from localStorage as fallback
      const savedPro = localStorage.getItem('ep_isPro_v2');
      if (savedPro === 'true' && !isPro) {
        setIsPro(true);
      }
    } catch (error) {
      console.warn('LocalStorage quota exceeded or error:', error);
    }
  }, [artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, socials, media, profilePic, isPro, monitoring, tableSpecs, otherTech]);

  // Check Firestore isPro status when slug changes
  useEffect(() => {
    if (!currentSlug) return;
    checkProStatus(currentSlug).then(proStatus => {
      if (proStatus) {
        setIsPro(true);
        localStorage.setItem('ep_isPro_v2', 'true');
      }
    }).catch(err => console.warn('Pro status check failed:', err));
  }, [currentSlug]);

  // Reset Editor Data
  const resetEditor = () => {
    // Clear State
    setArtistName('');
    setArtistConcept('');
    setBio('');
    setHospitality('');
    setMonitoring('');
    setTableSpecs('');
    setOtherTech('');
    setSelectedGear([]);
    setCdjCount(2);
    setProfilePic(null);
    setSocials({ instagram: '', soundcloud: '', twitter: '', youtube: '' });
    setMedia([]);
    setIsPro(false);
    setSavedLink(null);

    // Clear LocalStorage
    localStorage.removeItem('ep_artistName_v2');
    localStorage.removeItem('ep_artistConcept_v2');
    localStorage.removeItem('ep_bio_v2');
    localStorage.removeItem('ep_hospitality_v2');
    localStorage.removeItem('ep_monitoring_v2');
    localStorage.removeItem('ep_tableSpecs_v2');
    localStorage.removeItem('ep_otherTech_v2');
    localStorage.removeItem('ep_selectedGear_v2');
    localStorage.removeItem('ep_cdjCount_v2');
    localStorage.removeItem('ep_socials_v2');
    localStorage.removeItem('ep_media_v2');
    localStorage.removeItem('ep_profilePic_v2');
    localStorage.removeItem('ep_isPro_v2');
  };

  // Detect Logout
  const [prevUser, setPrevUser] = useState(currentUser);
  useEffect(() => {
    // If we had a user, and now we don't -> It's a logout
    if (prevUser && !currentUser) {
      if (confirm('You have logged out. Would you like to clear the current presskit data?')) {
        resetEditor();
      }
    }
    setPrevUser(currentUser);
  }, [currentUser, prevUser]);

  // Sync Data on Login
  useEffect(() => {
    if (currentUser) {
      getUserPresskit(currentUser.uid).then(data => {
        if (data) {
          console.log('Syncing data from Firestore for user:', currentUser.uid);
          if (data.artistName) setArtistName(data.artistName);
          if (data.artistConcept) setArtistConcept(data.artistConcept);
          if (data.bio) setBio(data.bio);
          if (data.hospitality) setHospitality(data.hospitality);
          if (data.monitoring) setMonitoring(data.monitoring);
          if (data.tableSpecs) setTableSpecs(data.tableSpecs);
          if (data.otherTech) setOtherTech(data.otherTech);
          if (data.selectedGear) setSelectedGear(data.selectedGear);
          if (data.cdjCount) setCdjCount(data.cdjCount);
          if (data.photoURL) setProfilePic(data.photoURL);
          if (data.socials) setSocials(data.socials);
          if (data.media) setMedia(data.media);
          if (data.isPro) setIsPro(true);
        }
      });
    }
  }, [currentUser]);

  // Handle Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      // Clean the URL
      window.history.replaceState({}, '', window.location.pathname);
      // Recheck pro status after a short delay (webhook may take a moment)
      setTimeout(() => {
        if (currentSlug) {
          checkProStatus(currentSlug).then(proStatus => {
            if (proStatus) {
              setIsPro(true);
              localStorage.setItem('ep_isPro_v2', 'true');
            }
          });
        }
      }, 3000);
    }
  }, []);

  // Helper to check pro feature
  const checkProFeature = (featureName) => {
    if (isPro) return true;
    setPaywallFeature(featureName);
    setShowPaywall(true);
    return false;
  };

  const toggleGear = (name) => {
    setSelectedGear(prev => prev.includes(name) ? prev.filter(g => g !== name) : [...prev, name]);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Free Tier: Max 2MB check
      if (!isPro && file.size > 2 * 1024 * 1024) {
        alert('Free Plan Limit: Please upload images smaller than 2MB or Upgrade to Pro.');
        setPaywallFeature('High-Res Profile Photo');
        setShowPaywall(true);
        return;
      }

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
          // Pro: 1600px, Free: 800px
          const MAX_SIZE = isPro ? 1600 : 800;

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
          // Pro: 0.8, Free: 0.6
          const quality = isPro ? 0.8 : 0.6;
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
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

  const addSoundCloud = (input) => {
    // Pro Feature: SoundCloud Embeds
    if (!checkProFeature('SoundCloud Embeds')) return;

    if (media.length >= 6) { return alert('Max 6 media items allowed'); }
    if (!input) return;

    let finalUrl = '';

    // Check for iframe embed code
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src="([^"]+)"/);
      if (srcMatch && srcMatch[1]) {
        const urlParamMatch = srcMatch[1].match(/url=([^&]+)/);
        if (urlParamMatch && urlParamMatch[1]) {
          finalUrl = decodeURIComponent(urlParamMatch[1]);
        }
      }
    } else {
      // Assume direct URL
      finalUrl = input;
    }

    if (!finalUrl) {
      return alert('Could not parse SoundCloud URL from input.');
    }

    // Validate extracted or direct URL
    // It could be a permalink (soundcloud.com/...) or an API link (api.soundcloud.com/...)
    if (finalUrl.includes('soundcloud.com') || finalUrl.includes('snd.sc')) {
      setMedia(prev => [...prev, { type: 'soundcloud', url: finalUrl }]);
    } else {
      return alert('Invalid SoundCloud URL. Please paste a full link or the embed code.');
    }
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
    setSocials(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleSave = async () => {
    if (!currentUser) {
      if (confirm("You must be logged in to save and manage your presskit. Sign in with Google now?")) {
        try {
          await loginWithGoogle();
        } catch (e) {
          console.error(e);
          alert("Login failed: " + e.message);
        }
      }
      return;
    }
    if (!artistName.trim()) { alert('Please enter an artist name'); return; }
    setSaving(true); setSavedLink(null);
    const sanitizedSocials = {
      instagram: ensureHttps(socials.instagram),
      soundcloud: ensureHttps(socials.soundcloud),
      twitter: ensureHttps(socials.twitter),
      youtube: ensureHttps(socials.youtube),
    };
    const payloadString = JSON.stringify({
      artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials: sanitizedSocials, media
    });
    const sizeInChars = payloadString.length;
    const sizeInMB = sizeInChars / (1024 * 1024);
    if (sizeInMB > 0.95) {
      setSaving(false);
      alert(`Data too large (${sizeInMB.toFixed(2)} MB). Firestore has a 1MB limit.`);
      return;
    }
    try {
      const savePromise = savePresskit({
        artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials: sanitizedSocials, media,
        monitoring, tableSpecs, otherTech,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email
      });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Connection timed out.')), 90000);
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
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
          <UserMenu />
        </div>
      </header>

      <main className="container">

        {/* Pro Subscription Modal */}
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName={paywallFeature}
          slug={currentSlug}
        />



        <div className="grid grid-2">
          {/* ── LEFT: Editor ── */}
          <section className="glass-panel">
            <div style={{ marginBottom: '1.5rem' }}>
              <label><User size={14} /> Artist Name</label>
              <input type="text" placeholder="e.g. DJ Tiesto" value={artistName}
                onChange={(e) => setArtistName(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Genre / Style</label>
              <input type="text" placeholder="e.g. Dark Techno" value={artistConcept}
                onChange={(e) => setArtistConcept(e.target.value)} />
            </div>
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
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                <button onClick={() => document.getElementById('photo-input').click()}
                  style={{ fontSize: '0.7rem', padding: '0.5rem 1.2rem' }}>
                  Upload Photo
                </button>
                <button onClick={() => { if (confirm('Clear all data?')) resetEditor(); }}
                  style={{ fontSize: '0.7rem', padding: '0.5rem 1.2rem', background: 'rgba(255,50,50,0.2)', border: '1px solid rgba(255,50,50,0.3)', color: '#ffaaaa' }}>
                  Clear Data
                </button>
              </div>
              <input id="photo-input" type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label><FileText size={14} /> Biography</label>
              <textarea rows="4" placeholder="Tell your story..." value={bio}
                onChange={(e) => setBio(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label>Hospitality Rider</label>
              <textarea rows="3" placeholder="What do you need backstage?" value={hospitality}
                onChange={(e) => setHospitality(e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label>Monitoring Requirements</label>
              <textarea rows="2" placeholder="e.g. 2 x L-Acoustics 115XT, controllable from booth" value={monitoring}
                onChange={(e) => setMonitoring(e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label>Stage / Booth Specs</label>
              <textarea rows="2" placeholder="e.g. Table Height 100cm, Vibration-free, Min width 2m" value={tableSpecs}
                onChange={(e) => setTableSpecs(e.target.value)} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label>Other Technical Req.</label>
              <textarea rows="2" placeholder="Power, Lighting, Network, Security..." value={otherTech}
                onChange={(e) => setOtherTech(e.target.value)} />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ marginBottom: '0.7rem' }}>Social Links</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <SocialInput icon={Instagram} placeholder="https://instagram.com/..." value={socials.instagram} onChange={updateSocial('instagram')} color="#E1306C" />
                <SocialInput icon={Music} placeholder="https://soundcloud.com/..." value={socials.soundcloud} onChange={updateSocial('soundcloud')} color="#ff5500" />
                <SocialInput icon={Twitter} placeholder="https://x.com/..." value={socials.twitter} onChange={updateSocial('twitter')} color="#999" />
                <SocialInput icon={Youtube} placeholder="https://youtube.com/..." value={socials.youtube} onChange={updateSocial('youtube')} color="#FF0000" />
              </div>
            </div>
            <div>
              <label style={{ marginBottom: '0.7rem' }}>Releases / Podcasts</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem' }}>
                <input
                  type="text"
                  placeholder="Paste YouTube Link or SoundCloud Embed Code"
                  id="release-input"
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }}
                />
                <button
                  onClick={() => {
                    const input = document.getElementById('release-input');
                    const val = input.value;
                    if (val.includes('youtu')) {
                      addYoutube(val);
                    } else if (val.includes('soundcloud.com') || val.includes('src="')) {
                      addSoundCloud(val);
                    } else {
                      alert('Please paste a valid YouTube or SoundCloud link/embed.');
                    }
                    input.value = '';
                  }}
                  style={{ padding: '0.5rem', fontSize: '0.8rem' }}
                >
                  Add Release
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {media.map((item, index) => {
                  if (item.type === 'image') return null;
                  return (
                    <div key={index} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.5rem', background: '#0d0d0d', border: '1px solid #333', borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                        {item.type === 'youtube' && <Youtube size={16} color="#FF0000" />}
                        {item.type === 'soundcloud' && <Music size={16} color="#ff5500" />}
                        <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {item.url.substring(0, 40)}...
                        </span>
                      </div>
                      <button onClick={() => removeMedia(index)} style={{ color: '#fff', background: 'transparent', padding: '2px 6px', fontSize: '0.8rem' }}>×</button>
                    </div>
                  );
                })}
              </div>

              <label style={{ marginBottom: '0.7rem' }}>Gallery</label>
              <div style={{ marginBottom: '0.8rem' }}>
                <button onClick={() => document.getElementById('media-upload').click()}
                  style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed #444' }}>
                  + Upload Photo (Limit 2MB)
                </button>
                <input id="media-upload" type="file" hidden onChange={handleMediaUpload} accept="image/*" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {media.map((item, index) => {
                  if (item.type !== 'image') return null;
                  return (
                    <div key={index} style={{ position: 'relative', aspectRatio: '16/9', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                      <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  );
                })}
              </div>
            </div>
          </section>

          {/* ── RIGHT: Live Preview ── */}
          <section className="glass-panel accent-border">
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
              <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '60px', height: '100%',
                background: `linear-gradient(135deg, transparent 40%, ${ACCENT}20 40%, ${ACCENT}25 60%, transparent 60%)`,
                borderRadius: '0 8px 8px 0',
              }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">About</div>
              <p style={{ color: '#bbb', lineHeight: '1.7', fontSize: '0.95rem' }}>
                {bio || 'Biography will appear here...'}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="section-title">Technical Rider</div>
              <TechRider
                onAddEquipment={toggleGear}
                selectedEquipment={selectedGear}
                cdjCount={cdjCount}
                onCdjCountChange={setCdjCount}
              />

              {(monitoring || tableSpecs || otherTech) && (
                <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1.2rem' }}>
                  {monitoring && (
                    <div>
                      <h4 style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>Monitoring</h4>
                      <p style={{ color: '#ccc', lineHeight: '1.5', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{monitoring}</p>
                    </div>
                  )}
                  {tableSpecs && (
                    <div>
                      <h4 style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>Stage / Booth</h4>
                      <p style={{ color: '#ccc', lineHeight: '1.5', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{tableSpecs}</p>
                    </div>
                  )}
                  {otherTech && (
                    <div>
                      <h4 style={{ color: '#888', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.1em' }}>Other Specs</h4>
                      <p style={{ color: '#ccc', lineHeight: '1.5', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>{otherTech}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {hospitality && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="section-title">Hospitality Rider</div>
                <p style={{ color: '#bbb', lineHeight: '1.7', fontSize: '0.95rem' }}>{hospitality}</p>
              </div>
            )}

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

        {/* Pricing Section (Moved to bottom) */}
        {!isPro && (
          <div style={{ marginBottom: '3rem' }}>
            <PricingCard isPro={isPro} slug={currentSlug} />
          </div>
        )}

        <p>© 2026 EasyPresskit — Modern Artist Solutions</p>
      </footer>
    </div>
  );
}

export default AppWrapper;
