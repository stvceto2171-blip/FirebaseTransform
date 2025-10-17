// Import helper function that generates mock restaurant and review data for testing or demo purposes
import { generateFakeRestaurantsAndReviews } from "@/src/lib/fakeRestaurants.js";

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
 * Updates the photo URL reference for a restaurant document in Firestore.
 * @param {string} restaurantId - The restaurant’s Firestore document ID.
 * @param {string} publicImageUrl - The public image URL to store.
 */
export async function updateRestaurantImageReference(restaurantId, publicImageUrl) {
  // Get a reference to the specific restaurant document
  const restaurantRef = doc(collection(db, "restaurants"), restaurantId);

  // Update the document’s photo field with the new image URL
  if (restaurantRef) {
    await updateDoc(restaurantRef, { photo: publicImageUrl });
  }
}

/**
 * Internal helper for Firestore transaction that updates restaurant rating statistics.
 * Calculates and updates new averages after a review is added.
 */
const updateWithRating = async (transaction, docRef, newRatingDocument, review) => {
  // Read the current restaurant document inside a transaction
  const restaurant = await transaction.get(docRef);
  const data = restaurant.data();

  // Compute updated rating statistics
  const newNumRatings = data?.numRatings ? data.numRatings + 1 : 1;
  const newSumRating = (data?.sumRating || 0) + Number(review.rating);
  const newAverage = newSumRating / newNumRatings;

  // Update restaurant’s aggregate rating data
  transaction.update(docRef, {
    numRatings: newNumRatings,
    sumRating: newSumRating,
    avgRating: newAverage,
  });

  // Add the new review under the restaurant’s “ratings” subcollection
  transaction.set(newRatingDocument, {
    ...review,
    timestamp: Timestamp.fromDate(new Date()), // Use a server-friendly timestamp
  });
};

/**
 * Adds a new review document and updates the restaurant’s rating statistics atomically.
 */
export async function addReviewToRestaurant(db, restaurantId, review) {
  if (!restaurantId) {
    throw new Error("No restaurant ID has been provided.");
  }

  if (!review) {
    throw new Error("A valid review has not been provided.");
  }

  try {
    // Get a reference to the restaurant document
    const docRef = doc(collection(db, "restaurants"), restaurantId);

    // Prepare a new review document reference within the ratings subcollection
    const newRatingDocument = doc(collection(db, `restaurants/${restaurantId}/ratings`));

    // Run Firestore transaction to update both restaurant and review atomically
    await runTransaction(db, (transaction) =>
      updateWithRating(transaction, docRef, newRatingDocument, review)
    );
  } catch (error) {
    console.error("There was an error adding the rating to the restaurant", error);
    throw error;
  }
}

/**
 * Helper function that applies filtering and sorting to a Firestore restaurant query.
 */
function applyQueryFilters(q, { category, city, price, sort }) {
  // Filter by category, if specified
  if (category) {
    q = query(q, where("category", "==", category));
  }

  // Filter by city, if specified
  if (city) {
    q = query(q, where("city", "==", city));
  }

  // Filter by price level (represented by string length of price symbols like "$$")
  if (price) {
    q = query(q, where("price", "==", price.length));
  }

  // Sort results based on user’s selected sort option
  if (sort === "Rating" || !sort) {
    q = query(q, orderBy("avgRating", "desc"));
  } else if (sort === "Review") {
    q = query(q, orderBy("numRatings", "desc"));
  }

  return q;
}

/**
 * Retrieves a list of restaurants from Firestore, optionally filtered/sorted.
 * Converts Firestore timestamps into plain Date objects.
 */
export async function getRestaurants(db = db, filters = {}) {
  let q = query(collection(db, "restaurants"));
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
 * Sets up a real-time listener for the restaurants collection.
 * Calls the provided callback whenever data changes.
 */
export function getRestaurantsSnapshot(cb, filters = {}) {
  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  let q = query(collection(db, "restaurants"));
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
 * Fetch a single restaurant document by its Firestore ID.
 */
export async function getRestaurantById(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  const docRef = doc(db, "restaurants", restaurantId);
  const docSnap = await getDoc(docRef);

  return {
    ...docSnap.data(),
    timestamp: docSnap.data().timestamp.toDate(),
  };
}

/**
 * Real-time listener for updates to a single restaurant document.
 */
export function getRestaurantSnapshotById(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid ID received: ", restaurantId);
    return;
  }

  if (typeof cb !== "function") {
    console.log("Error: The callback parameter is not a function");
    return;
  }

  const docRef = doc(db, "restaurants", restaurantId);
  return onSnapshot(docRef, (docSnap) => {
    cb({
      ...docSnap.data(),
      timestamp: docSnap.data().timestamp.toDate(),
    });
  });
}

/**
 * Fetch all reviews for a specific restaurant, ordered by most recent first.
 */
export async function getReviewsByRestaurantId(db, restaurantId) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
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
 * Real-time listener for reviews on a specific restaurant.
 * Updates the provided callback whenever reviews change.
 */
export function getReviewsSnapshotByRestaurantId(restaurantId, cb) {
  if (!restaurantId) {
    console.log("Error: Invalid restaurantId received: ", restaurantId);
    return;
  }

  const q = query(
    collection(db, "restaurants", restaurantId, "ratings"),
    orderBy("timestamp", "desc")
  );

  // Subscribe to real-time updates on this restaurant’s reviews
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
 * Seeds the Firestore database with fake restaurant and review data.
 * Useful for testing and demo environments.
 */
export async function addFakeRestaurantsAndReviews() {
  // Generate fake restaurant and review data
  const data = await generateFakeRestaurantsAndReviews();

  for (const { restaurantData, ratingsData } of data) {
    try {
      // Add each fake restaurant to Firestore
      const docRef = await addDoc(collection(db, "restaurants"), restaurantData);

      // Add each associated review under the restaurant’s “ratings” subcollection
      for (const ratingData of ratingsData) {
        await addDoc(collection(db, "restaurants", docRef.id, "ratings"), ratingData);
      }
    } catch (e) {
      console.log("There was an error adding the document");
      console.error("Error adding document: ", e);
    }
  }
}
