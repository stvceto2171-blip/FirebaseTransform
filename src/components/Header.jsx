// Enable Next.js "client component" mode
// This tells Next.js that this file should run in the browser (not on the server)
"use client";

import React, { useEffect } from "react";
import Link from "next/link";

// Import Firebase authentication helper functions
import {
  signInWithGoogle,  // Function to trigger Google sign-in
  signOut,           // Function to sign the user out
  onIdTokenChanged,  // Listener that triggers when a user's ID token changes
} from "@/src/lib/firebase/auth.js";

// Import a Firestore helper to populate fake restaurants and reviews
import { addFakeRestaurantsAndReviews } from "@/src/lib/firebase/firestore.js";

// Import utilities for managing cookies
import { setCookie, deleteCookie } from "cookies-next";

/**
 * Custom React hook to manage user authentication state.
 * 
 * @param {Object|null} initialUser - The initial user object passed from the server.
 * @returns {Object|null} The current user object.
 */
function useUserSession(initialUser) {
  // useEffect runs after the component mounts and whenever initialUser changes
  useEffect(() => {
    // Subscribe to Firebase's ID token changes (login/logout/refresh events)
    return onIdTokenChanged(async (user) => {
      if (user) {
        // If a user is logged in, get their Firebase ID token
        const idToken = await user.getIdToken();
        // Store it in a cookie named "__session" for server-side access
        await setCookie("__session", idToken);
      } else {
        // If no user is logged in, remove the session cookie
        await deleteCookie("__session");
      }

      // If the user hasn’t actually changed, don’t reload the page
      if (initialUser?.uid === user?.uid) {
        return;
      }

      // Otherwise, reload the page so the UI updates to reflect new auth state
      window.location.reload();
    });
  }, [initialUser]);

  // Return the current user (from props, initially)
  return initialUser;
}

/**
 * Header component displayed at the top of the app.
 * Shows either the user’s profile (if signed in) or a "Sign In" link.
 */
export default function Header({ initialUser }) {
  // Get the user session using the custom hook
  const user = useUserSession(initialUser);

  // Handle the "Sign Out" button click
  const handleSignOut = (event) => {
    event.preventDefault(); // Prevent page reload
    signOut();              // Call Firebase sign-out
  };

  // Handle the "Sign In" button click
  const handleSignIn = (event) => {
    event.preventDefault(); // Prevent page reload
    signInWithGoogle();     // Trigger Google sign-in flow
  };

  return (
    <header>
      {/* Logo and link to home page */}
      <Link href="/" className="logo">
        <img src="/friendly-eats.svg" alt="FriendlyEats" />
        Friendly Eats
      </Link>

      {/* Conditional rendering: show user profile if logged in, or sign-in button otherwise */}
      {user ? (
        <>
          <div className="profile">
            <p>
              {/* Show user's profile photo (or a placeholder if missing) */}
              <img
                className="profileImage"
                src={user.photoURL || "/profile.svg"}
                alt={user.email}
              />
              {user.displayName}
            </p>

            {/* Dropdown-style menu with user options */}
            <div className="menu">
              ...
              <ul>
                <li>{user.displayName}</li>

                <li>
                  {/* Add sample data for testing/demo purposes */}
                  <a href="#" onClick={addFakeRestaurantsAndReviews}>
                    Add sample restaurants
                  </a>
                </li>

                <li>
                  {/* Sign out link */}
                  <a href="#" onClick={handleSignOut}>
                    Sign Out
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </>
      ) : (
        // If not signed in, show the "Sign in with Google" button
        <div className="profile">
          <a href="#" onClick={handleSignIn}>
            <img src="/profile.svg" alt="A placeholder user image" />
            Sign In with Google
          </a>
        </div>
      )}
    </header>
  );
}
