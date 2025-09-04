// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// 🔹 Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyAzLGXDj1RaqvQ3eGplX90Gh2W26koXCz4",
  authDomain: "sample-1-c91d6.firebaseapp.com",
  projectId: "sample-1-c91d6",
  messagingSenderId: "613975455386",
  appId: "1:613975455386:web:0e6b71f125393398a6d123"
};

// 🔹 初期化とエクスポート
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);