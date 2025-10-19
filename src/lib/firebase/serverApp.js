// ✅ Enforce that this file can only be executed in a server environment.
// Next.js will throw an error if it’s accidentally imported into client code.
// Reference: https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#keeping-server-only-code-out-of-the-client-environment
import "server-only";

// Import Next.js server-side cookies API for reading HTTP cookies
import { cookies } from "next/headers";

// Import Firebase SDK initialization functions
// - `initializeApp`: creates a standard Firebase app instance
// - `initializeServerApp`: creates a Firebase app that can use client credentials on the server
import { initializeServerApp, initializeApp } from "firebase/app";
import firebaseConfig from "./config.js";

// Import method to get the Firebase Authentication service for a given app
import { getAuth } from "firebase/auth";

/**
 * Retrieves an authenticated Firebase App instance that can safely be used on the server.
 * 
 * This function enables secure server-side rendering (SSR) and static site generation (SSG)
 * by passing the client’s Firebase ID token (stored in cookies) to the server.
 *
 * @returns {Promise<{ firebaseServerApp: FirebaseApp, currentUser: FirebaseUser | null }>}
 */
export async function getAuthenticatedAppForUser() {
  // Read the "__session" cookie value from the incoming HTTP request
  // This cookie contains the Firebase Authentication ID token set by the client
  const authIdToken = (await cookies()).get("__session")?.value;

  /**
   * Initialize a Firebase “Server App” using the client’s ID token.
   * 
   * - `initializeServerApp()` is a special Firebase API that allows
   *   the SDK to use authentication tokens on the server side.
   * - The second argument `{ authIdToken }` tells Firebase who the
   *   authenticated user is when executing server operations.
   * 
   * Note: This feature is new to the Firebase JS SDK and provides a
   * safe way to hydrate user context during SSR.
   */
  const firebaseServerApp = initializeServerApp(
    // The base Firebase App instance with configuration
    initializeApp(firebaseConfig),
    {
      authIdToken, // Attach the user's authentication token
    }
  );

  // Get the Firebase Auth service tied to this server app instance
  const auth = getAuth(firebaseServerApp);

  // Wait until Firebase has finished restoring the user's authentication state
  await auth.authStateReady();

  // Return both the server app instance and the authenticated user (if any)
  return { firebaseServerApp, currentUser: auth.currentUser };
}
