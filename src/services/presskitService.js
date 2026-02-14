import { db, storage } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Convert a data URL (base64 image) to a Blob for upload.
 */
function dataURLtoBlob(dataURL) {
    const [header, data] = dataURL.split(',');
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(data);
    const array = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
    return new Blob([array], { type: mime });
}

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
    const slug = generateSlug(artistName);
    let photoURL = null;

    // Upload profile photo if it's a data URL
    if (profilePic && profilePic.startsWith('data:')) {
        const blob = dataURLtoBlob(profilePic);
        const photoRef = ref(storage, `presskits/${slug}/photo.jpg`);
        await uploadBytes(photoRef, blob);
        photoURL = await getDownloadURL(photoRef);
    } else if (profilePic) {
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

    await setDoc(doc(db, 'presskits', slug), presskitData);

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
