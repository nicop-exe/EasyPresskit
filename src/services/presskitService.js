import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Generate a URL-safe slug from an artist name.
 */
function generateSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'artist';
}

/**
 * Save a presskit to Firestore (and photo as base64).
 * Returns { slug }.
 */
export async function savePresskit({ artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials, media }) {
    console.log('Starting savePresskit for:', artistName);
    const slug = generateSlug(artistName);
    console.log('Generated slug:', slug);

    let photoURL = null;

    // Save profile photo as base64 string directly
    if (profilePic) {
        console.log('Profile pic size:', profilePic.length);
        photoURL = profilePic;
    }

    // Check if an existing doc has isPro set (preserve it during save)
    let existingIsPro = false;
    try {
        const existing = await getDoc(doc(db, 'presskits', slug));
        if (existing.exists() && existing.data().isPro) {
            existingIsPro = true;
        }
    } catch (e) {
        console.warn('Could not check existing pro status:', e);
    }

    const presskitData = {
        artistName,
        artistConcept,
        bio,
        hospitality,
        selectedGear,
        cdjCount: cdjCount || 2,
        photoURL,
        socials: socials || {},
        media: media || [],
        isPro: existingIsPro,
        slug, // Store slug in the document for webhook queries
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log('Saving to Firestore...', presskitData);
    await setDoc(doc(db, 'presskits', slug), presskitData);
    console.log('Saved successfully!');

    return { slug };
}

/**
 * Load a presskit from Firestore by slug.
 */
export async function loadPresskit(slug) {
    const snap = await getDoc(doc(db, 'presskits', slug));
    if (!snap.exists()) return null;
    return snap.data();
}

/**
 * Check Pro status for a given slug from Firestore.
 * Returns true if the presskit has isPro: true.
 */
export async function checkProStatus(slug) {
    if (!slug) return false;
    try {
        const snap = await getDoc(doc(db, 'presskits', slug));
        if (snap.exists()) {
            return snap.data().isPro === true;
        }
    } catch (e) {
        console.warn('Error checking pro status:', e);
    }
    return false;
}
