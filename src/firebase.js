import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCdpqREVda-R82LHaaRLd-sicgnLy7vuO0",
    authDomain: "easypresskit.firebaseapp.com",
    projectId: "easypresskit",
    storageBucket: "easypresskit.firebasestorage.app",
    messagingSenderId: "491409397664",
    appId: "1:491409397664:web:ec2b6197aaf78322edf6c5",
    measurementId: "G-Y3JP68TEYH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
