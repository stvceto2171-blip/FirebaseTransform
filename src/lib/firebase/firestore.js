// Import helper function that generates mock team and discussion data for testing or demo purposes
import { generateFakeTeamsAndDiscussions } from "@/src/lib/fakeTeams.js";

// Import necessary Firestore functions from Firebase SDK
import {
  collection,      // Reference a Firestore collection
  onSnapshot,      // Real-time listener for query/document updates
  query,           // Build a Firestore query
  getDocs,         // Fetch query results once
  doc,             // Reference a specific Firestore document
  getDoc,          // Fetch a single document by reference
  updateDoc,       // Update fields in a document
  orderBy,         // Sort query results
  Timestamp,       // Firestore timestamp object
  runTransaction,  // Perform atomic read-write operations safely
  where,           // Apply conditional filters to queries
  addDoc,          // Add a new document to a collection
} from "firebase/firestore";

// Import the shared Firestore database instance from the Firebase client
import { db } from "@/src/lib/firebase/clientApp";

/**
 * Updates the photo URL reference for a team document in Firestore.
 * @param {string} teamId - The team's Firestore document ID.
 * @param {string} publicImageUrl - The public image URL to store.
 */
export async function updateTeamImageReference(teamId, publicImageUrl) {
  // Get a reference to the specific team document
  const teamRef = doc(collection(db, "teams"), teamId);

  // Update the document's photo field with the new image URL
  if (teamRef) {
    await updateDoc(teamRef, { photo: publicImageUrl });
  }
}

/**
 * Internal helper for Firestore transaction that updates team rating statistics.
 * Calculates and updates new averages after a discussion is added.
 */
const updateWithRating = async (transaction, docRef, newDiscussionDocument, discussion) => {
  // Read the current team document inside a transaction
  const team = await transaction.get(docRef);
  const data = team.data();

  // Compute updated rating statistics
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(discussion.rating);
  const newAverage = newSumRating / newNumRatings;

  // Update team's aggregate rating data
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  // Add the new discussion under the team's "discussions" subcollection
  transaction.set(newDiscussionDocument, {
    ...discussion,
    timestamp: Timestamp.fromDate(new Date()), // Use a server-friendly timestamp
  });
};

/**
 * Adds a new discussion document and updates the team's rating statistics atomically.
 */
export async function addDiscussionToTeam(db, teamId, discussion) {
  if (!teamId) {
    throw new Error("No team ID has been provided.");
  }

  if (!discussion) {
    throw new Error("A valid discussion has not been provided.");
  }

  try {
    // Get a reference to the team document
    const docRef = doc(collection(db, "teams"), teamId);

    // Prepare a new discussion document reference within the discussions subcollection
    const newDiscussionDocument = doc(collection(db, `teams/${teamId}/discussions`));

    // Run Firestore transaction to update both team and discussion atomically
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newDiscussionDocument, discussion)
    );
  } catch (error) {
    console.error("There was an error adding the discussion to the team", error);
    throw error;
  }
}

/**
 * Helper function that applies filtering and sorting to a Firestore team query.
 */
function applyQueryFilters(q, { division, city, conference, sort }) {
  // Filter by division, if specified
  if (division) {
    q = query(q, where("division", "==", division));
  }

  // Filter by city, if specified
  if (city) {
    q = query(q, where("city", "==", city));
  }

  // Filter by conference, if specified
  if (conference) {
    q = query(q, where("conference", "==", conference));
  }

  // Sort results based on user's selected sort option
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Wins") {
    q = query(q, orderBy("wins", "desc"));
  } else if (sort === "Discussions") {
    q = query(q, orderBy("numRatings", "desc"));
  }

  return q;
}

/**
 * Retrieves a list of teams from Firestore, optionally filtered/sorted.
 * Converts Firestore timestamps into plain Date objects.
 */
export async function getTeams(db = db, filters = {}) {
  let q = query(collection(db, "teams"));
  q = applyQueryFilters(q, filters);

  const results = await getDocs(q);

  // Map Firestore documents into plain JavaScript objects
  return results.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp
  }));
}

/**
 * Sets up a real-time listener for the teams collection.
 * Calls the provided callback whenever data changes.
 */
export function getTeamsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "teams"));
  q = applyQueryFilters(q, filters);

  // Listen to snapshot changes in real-time
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));

    cb(results);
  });
}

/**
 * Fetch a single team document by its Firestore ID.
 */
export async function getTeamById(db, teamId) {
  if (!teamId) {
    console.log("Error: Invalid ID received: ", teamId);
    return;
  }

  const docRef = doc(db, "teams", teamId);
  const docSnap = await getDoc(docRef);

  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

/**
 * Real-time listener for updates to a single team document.
 */
export function getTeamSnapshotById(teamId, cb) {
  if (!teamId) {
    console.log("Error: Invalid ID received: ", teamId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "teams", teamId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

/**
 * Fetch all discussions for a specific team, ordered by most recent first.
 */
export async function getDiscussionsByTeamId(db, teamId) {
  if (!teamId) {
    console.log("Error: Invalid teamId received: ", teamId);
    return;
  }

  const q = query(
    collection(db, "teams", teamId, "discussions"),
    orderBy("timestamp", "desc")
  );

  const results = await getDocs(q);

  return results.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    timestamp: doc.data().timestamp.toDate(),
  }));
}

/**
 * Real-time listener for discussions on a specific team.
 * Updates the provided callback whenever discussions change.
 */
export function getDiscussionsSnapshotByTeamId(teamId, cb) {
  if (!teamId) {
    console.log("Error: Invalid teamId received: ", teamId);
    return;
  }

  const q = query(
    collection(db, "teams", teamId, "discussions"),
    orderBy("timestamp", "desc")
  );

  // Subscribe to real-time updates on this team's discussions
  return onSnapshot(q, (querySnapshot) => {
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    }));
    cb(results);
  });
}

/**
 * Seeds the Firestore database with fake team and discussion data.
 * Useful for testing and demo environments.
 */
export async function addFakeTeamsAndDiscussions() {
  // Generate fake team and discussion data
  const data = await generateFakeTeamsAndDiscussions();

  for (const { teamData, discussionsData } of data) {
    try {
      // Add each fake team to Firestore
      const docRef = await addDoc(collection(db, "teams"), teamData);

      // Add each associated discussion under the team's "discussions" subcollection
      for (const discussionData of discussionsData) {
        await addDoc(collection(db, "teams", docRef.id, "discussions"), discussionData);
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
