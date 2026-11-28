import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";l
const firebaseConfig = {
  apiKey: "AIzaSyDU-sTt7ABvvbr4oLs_vkfCA3fqNtyBj8U",
    authDomain: "cloud-whale.firebaseapp.com",
      databaseURL: "https://cloud-whale-default-rtdb.europe-west1.firebasedatabase.app",
        projectId: "cloud-whale",
          storageBucket: "cloud-whale.firebasestorage.app",
            messagingSenderId: "976584020861",
              appId: "1:976584020861:web:468a964630787288c07214",
                measurementId: "G-VSZK70EWG9"
                };

                // Initialize Firebase
                const app = initializeApp(firebaseConfig);
                const analytics = getAnalytics(app);
