// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBjCOdVYEZ3HTVn6ATuz5KZXMNVR0pAYzY",
    authDomain: "farmersmarket-7586e.firebaseapp.com",
    projectId: "farmersmarket-7586e",
    storageBucket: "farmersmarket-7586e.firebasestorage.app",
    messagingSenderId: "935576037682",
    appId: "1:935576037682:web:091ee3581f1d5fab050f2b",
    measurementId: "G-5KS2X2VTF3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);