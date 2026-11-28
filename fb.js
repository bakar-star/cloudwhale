// Paste your Firebase web config here (Firebase console > Project settings > Your apps).
// databaseURL is required: it is the Realtime Database URL, not Firestore.
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export * from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export const db=getDatabase(initializeApp({
  apiKey:'YOUR_API_KEY',
  authDomain:'YOUR_PROJECT.firebaseapp.com',
  databaseURL:'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId:'YOUR_PROJECT'
}));
