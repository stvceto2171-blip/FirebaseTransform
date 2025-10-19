// Import the TeamListings React component
// This component is responsible for displaying a list of teams
import TeamListings from "@/src/components/TeamListings.jsx";

// Import a helper function to fetch team data from Firestore
import { getTeams } from "@/src/lib/firebase/firestore.js";

// Import a helper function that returns a Firebase app configured for the currently authenticated user
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp.js";

// Import the Firestore SDK method for accessing the Firestore instance
import { getFirestore } from "firebase/firestore";

// Tell Next.js that this route must always be rendered on the server side
// By default, Next.js might try to pre-render this page statically at build time
// Setting this forces dynamic server-side rendering (SSR)
export const dynamic = "force-dynamic";

// (Alternative approach)
// Setting revalidate = 0 would also force SSR by disabling ISR (Incremental Static Regeneration)
// This line is commented out but serves the same purpose as above
// export const revalidate = 0;

// Define the default exported async function that represents the main page component
export default async function Home(props) {
  // Retrieve URL search parameters provided by Next.js (like ?city=London&category=Indian)
  // This allows for filtering on the server side before the page is rendered
  const searchParams = await props.searchParams;

  // Get an authenticated Firebase app instance for the current user (server-side)
  // This ensures that the Firestore queries are made securely and with the proper permissions
  const { firebaseServerApp } = await getAuthenticatedAppForUser();

  // Fetch teams from Firestore based on the search parameters
  // The getTeams() function handles Firestore querying and filtering logic
  const teams = await getTeams(
    getFirestore(firebaseServerApp), // Firestore instance for this user
    searchParams                      // Filters such as city, division, or sort order
  );

  // Return the JSX to render on the page
  // It renders a <main> tag containing the TeamListings component
  // The initial list of teams and the search parameters are passed down as props
  return (
    <main className="main__home">
      <TeamListings
        initialTeams={teams}
        searchParams={searchParams}
      />
    </main>
  );
}
