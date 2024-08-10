import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyAWMkXS2mcuWTEvWwBauYYeI2PRkdxhKGg",
  authDomain: "inventorymanagementapp-e0e39.firebaseapp.com",
  projectId: "inventorymanagementapp-e0e39",
  storageBucket: "inventorymanagementapp-e0e39.appspot.com",
  messagingSenderId: "548963089045",
  appId: "1:548963089045:web:5528f4a8d9d48e0165f99c",
  measurementId: "G-6JNPSFZ7CV"
};
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };