import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Initialize Firebase Admin SDK only once
if (!getApps().length && process.env.FIREBASE_PROJECT_ID) {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }
  initializeApp({
    credential: cert(serviceAccount),
  })
}

export const db = getFirestore()
try {
  db.settings({ ignoreUndefinedProperties: true })
} catch {
  // settings() already called on this Firestore instance (hot-reload)
}

// Collection references
export const usersCollection = db.collection('users')
export const announcementsCollection = db.collection('announcements')
export const serviceRequestsCollection = db.collection('serviceRequests')
export const savedAnnouncementsCollection = db.collection('savedAnnouncements')
export const conversationsCollection = db.collection('conversations')
export const messagesCollection = db.collection('messages')
