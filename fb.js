import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getDatabase} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export * from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
export const db=getDatabase(initializeApp({
  apiKey:"AIzaSyDU-sTt7ABvvbr4oLs_vkfCA3fqNtyBj8U",
  authDomain:"cloud-whale.firebaseapp.com",
  databaseURL:"https://cloud-whale-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:"cloud-whale",
  storageBucket:"cloud-whale.firebasestorage.app",
  messagingSenderId:"976584020861",
  appId:"1:976584020861:web:468a964630787288c07214"
}));
