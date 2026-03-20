import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDm4zQB3i7h9O4Xgkmixq34ZcOxjBQFFCs",
  authDomain: "grover-907a6.firebaseapp.com",
  projectId: "grover-907a6",
  storageBucket: "grover-907a6.firebasestorage.app",
  messagingSenderId: "199782774366",
  appId: "1:199782774366:web:6d53c0be733ab843e166cf"
};  

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, provider);
export const signOutUser = () => signOut(auth);