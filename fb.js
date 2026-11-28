import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
export * from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export {onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,updateProfile,sendPasswordResetEmail};
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
/* resolves once with the signed-in user (restored from the last visit) or null. Accounts are email + password + username, no anonymous play. */
export const authReady=new Promise(res=>{const off=onAuthStateChanged(auth,u=>{off();res(u)})});
