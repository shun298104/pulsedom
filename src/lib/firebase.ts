import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator  } from "firebase/firestore";

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqQVlAns151ipS4zVz9EQlb7AaJdo63o0",
  authDomain: "pulsedom-2131a.firebaseapp.com",
  projectId: "pulsedom-2131a",
  storageBucket: "pulsedom-2131a.firebasestorage.app",
  messagingSenderId: "1068092725649",
  appId: "1:1068092725649:web:82623f144183d36cb02230",
  measurementId: "G-5CYXRNSX0F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firestoreのexport（同期サンプルで使う！）
export const db = getFirestore(app);
// ローカル開発時のみエミュ接続
if (location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
}