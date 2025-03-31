// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDSX0-K9dnN30fx2T3nvVa-ZHX5_AKizkY",
  authDomain: "cricverse-fb6f1.firebaseapp.com",
  projectId: "cricverse-fb6f1",
  storageBucket: "cricverse-fb6f1.firebasestorage.app",
  messagingSenderId: "867858092129",
  appId: "1:867858092129:web:559fd35aaae2c487c2da20",
  measurementId: "G-2Q3P716CQS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Function to create an admin account
export const createAdminAccount = async (email, password, displayName) => {
  try {
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's profile with display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Create admin document in Firestore with retry mechanism
    const adminData = {
      uid: user.uid,
      email: email,
      displayName: displayName,
      isAdmin: true,
      role: 'ADMIN',
      permissions: ['MANAGE_MATCHES', 'MANAGE_SCORES', 'MANAGE_AUCTIONS'],
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid), adminData);
    } catch (firestoreError) {
      console.error('First attempt to write to Firestore failed:', firestoreError);
      // Wait a moment and try again
      await new Promise(resolve => setTimeout(resolve, 1000));
      await setDoc(doc(db, 'users', user.uid), adminData);
    }

    return user;
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};

// Function to check if a user is an admin
export const checkIsAdmin = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() && userDoc.data().isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export { auth, db, analytics, app as default };