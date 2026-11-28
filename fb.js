import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {getAuth,signInAnonymously} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
export * from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
const app=initializeApp({
  apiKey:"AIzaSyDU-sTt7ABvvbr4oLs_vkfCA3fqNtyBj8U",
  authDomain:"cloud-whale.firebaseapp.com",
  databaseURL:"https://cloud-whale-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:"cloud-whale",
  storageBucket:"cloud-whale.firebasestorage.app",
  messagingSenderId:"976584020861",
  appId:"1:976584020861:web:468a964630787288c07214"
});
export const db=getDatabase(app);
export const auth=getAuth(app);
/* every player silently gets an anonymous account; the save lives under users/<uid> and only that uid can touch it */
export const authReady=signInAnonymously(auth).then(c=>c.user.uid).catch(e=>{console.warn('anonymous sign-in failed',e);return null});
