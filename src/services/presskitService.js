import { db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Generate a URL-safe slug from an artist name.
 */

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
 * Save a presskit to Firestore (and photo to Storage).
 * Returns { slug }.
 */
export async function savePresskit({ artistName, artistConcept, bio, hospitality, selectedGear, cdjCount, profilePic, socials }) {
    console.log('Starting savePresskit for:', artistName);
    const slug = generateSlug(artistName);
    console.log('Generated slug:', slug);

    let photoURL = null;

    // Save profile photo as base64 string directly
    if (profilePic) {
        console.log('Profile pic size:', profilePic.length);
        photoURL = profilePic;
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
