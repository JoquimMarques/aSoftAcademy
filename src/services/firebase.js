// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration - aSoftAcademy
const firebaseConfig = {
  apiKey: "AIzaSyB0rxeCXblsf6Pfgk8b-4fh0JUKd2kOnuU",
  authDomain: "a-soft-c6728.firebaseapp.com",
  projectId: "a-soft-c6728",
  storageBucket: "a-soft-c6728.firebasestorage.app",
  messagingSenderId: "1098717363478",
  appId: "1:1098717363478:web:cf49f177539562a569e437",
  measurementId: "G-49E1J39W64"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Initialize Analytics (only in browser)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { app, auth, db, storage, analytics }
