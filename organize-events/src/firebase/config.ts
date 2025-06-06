import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyAK_TOb75b9U0VDx93GLq1VkpCnzZm-DE4",
  authDomain: "participants-seva.firebaseapp.com",
  projectId: "participants-seva",
  databaseURL:
    "https://participants-seva-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "participants-seva.appspot.com",
  messagingSenderId: "587560809720",
  appId: "1:587560809720:web:87dd4167777a3d799b770d",
  measurementId: "G-MLLV2HH2NH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { app, db };
