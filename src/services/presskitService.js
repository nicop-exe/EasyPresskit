import { db, storage } from '../firebase';

import { doc, setDoc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
 * Upload Tech Rider PDF to Firebase Storage
 */
export async function uploadTechRiderPdf(file, ownerId) {
    if (!ownerId) throw new Error("User must be logged in to upload files.");

    // Create a unique filename: distinct timestamp + original name
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `tech-riders/${ownerId}/${timestamp}-${safeName}`;

    const storageRef = ref(storage, path);

    console.log(`Uploading PDF to ${path}...`);
    const snapshot = await uploadBytes(storageRef, file);
    console.log('Upload complete, getting URL...');
    const url = await getDownloadURL(snapshot.ref);
    return url;
}

/**
 * Upload Background Image to Firebase Storage.
 * Accepts a base64 data URL string, converts to blob, uploads, returns download URL.
 */
export async function uploadBackgroundImage(base64DataUrl, ownerId) {
    if (!ownerId) throw new Error("User must be logged in to upload files.");

    // Convert base64 data URL to Blob
    const response = await fetch(base64DataUrl);
    const blob = await response.blob();

    const timestamp = Date.now();
    const path = `backgrounds/${ownerId}/${timestamp}-bg.jpg`;
    const storageRef = ref(storage, path);

    console.log(`Uploading background image to ${path}...`);
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Background upload complete, getting URL...');
    const url = await getDownloadURL(snapshot.ref);
    return url;
}

/**
 * Save a presskit to Firestore (and photo as base64).
 * Returns { slug }.
 */
export async function savePresskit({ artistName, artistConcept, bio, stats, supportedBy, hospitality, selectedGear, cdjCount, profilePic, socials, media, ownerId, ownerEmail, monitoring, tableSpecs, otherTech, techRiderPdf, theme }) {
    console.log('Starting savePresskit for:', artistName);
    const slug = generateSlug(artistName);
    console.log('Generated slug:', slug);

    // Ownership Check
    try {
        const existing = await getDoc(doc(db, 'presskits', slug));
        if (existing.exists()) {
            const data = existing.data();
            // If doc has an owner and it's not the current user -> Block
            if (data.ownerId && data.ownerId !== ownerId) {
                throw new Error(`This Artist Name "${artistName}" is already claimed by another user. Please choose a different name.`);
            }
            // If doc has NO owner -> It's a legacy doc, we allow claiming it
            if (!data.ownerId) {
                console.log('Claiming legacy presskit for user:', ownerId);
            }
        }
    } catch (e) {
        // If error is ours, rethrow
        if (e.message.includes('already claimed')) throw e;
        console.warn('Error checking existence:', e);
    }

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
        stats: stats || [],
        supportedBy: supportedBy || '',
        hospitality,
        selectedGear,
        monitoring: monitoring || '',
        tableSpecs: tableSpecs || '',
        otherTech: otherTech || '',
        techRiderPdf: techRiderPdf || null,
        cdjCount: cdjCount || 2,
        photoURL,
        socials: socials || {},
        media: media || [],
        isPro: existingIsPro,
        theme: theme || { accentColor: '#ff1744', backgroundImage: null },
        slug, // Store slug in the document for webhook queries
        ownerId, // Link to Firebase Auth User
        ownerEmail, // Store email for administrative reference
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    console.log('Saving to Firestore...', presskitData);
    await setDoc(doc(db, 'presskits', slug), presskitData, { merge: true });
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

/**
 * Retrieve the first presskit owned by a specific user ID.
 */
export async function getUserPresskit(uid) {
    if (!uid) return null;
    try {
        const q = query(
            collection(db, 'presskits'),
            where('ownerId', '==', uid),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }
    } catch (e) {
        console.warn('Error fetching user presskit:', e);
    }
    return null;
}
