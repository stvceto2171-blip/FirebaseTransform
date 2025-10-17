// Import Firebase Authentication utilities
import {
  GoogleAuthProvider,      // Provider for Google sign-in
  signInWithPopup,         // Opens a Google sign-in popup
  onAuthStateChanged as _onAuthStateChanged, // Firebase listener for auth state changes (login/logout)
  onIdTokenChanged as _onIdTokenChanged,     // Firebase listener for token refresh or ID token updates
} from "firebase/auth";

// Import the initialized Firebase Auth instance from your client app configuration
import { auth } from "@/src/lib/firebase/clientApp";

/**
 * Wraps Firebase's onAuthStateChanged to automatically use the shared `auth` instance.
 * 
 * @param {Function} cb - A callback function that runs whenever the authentication state changes.
 * @returns {Function} Unsubscribe function to stop listening to changes.
 */
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

/**
 * Wraps Firebase's onIdTokenChanged to automatically use the shared `auth` instance.
 * 
 * @param {Function} cb - A callback that runs whenever the user's ID token changes or refreshes.
 * @returns {Function} Unsubscribe function to stop listening.
 */
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

/**
 * Initiates Google sign-in using a popup window.
 * 
 * This function creates a GoogleAuthProvider instance and opens a sign-in popup.
 * On success, Firebase automatically updates the current user in `auth`.
 */
export async function signInWithGoogle() {
  // Create a new Google Auth provider
  const provider = new GoogleAuthProvider();

  try {
    // Open a popup for Google sign-in and authenticate the user
    await signInWithPopup(auth, provider);
  } catch (error) {
    // Log any errors to the console for debugging
    console.error("Error signing in with Google", error);
  }
}

/**
 * Signs the current user out of Firebase Authentication.
 * 
 * @returns {Promise<void>} A promise that resolves when the user is signed out.
 */
export async function signOut() {
  try {
    // Call Firebase's built-in signOut method
    return auth.signOut();
  } catch (error) {
    // Log any errors that occur during sign-out
    console.error("Error signing out with Google", error);
  }
}
