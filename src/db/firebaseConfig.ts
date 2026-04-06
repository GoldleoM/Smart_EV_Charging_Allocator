import { initializeApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCts_-4sPu1raYqjBbfenyuTfmGguRT1sI",
  authDomain: "ev-charging-7354b.firebaseapp.com",
  projectId: "ev-charging-7354b",
  storageBucket: "ev-charging-7354b.firebasestorage.app",
  messagingSenderId: "265867944795",
  appId: "1:265867944795:web:8b7dc0b0c6fddb6431b07e",
  measurementId: "G-K8NJ71LNDK",
  databaseURL: "https://ev-charging-7354b-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db: Database = getDatabase(app);

console.log("Firebase initialized successfully.");

export { db };
