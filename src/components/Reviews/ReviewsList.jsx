// This component handles the list of discussions for a given team

import React from "react";
import { getDiscussionsByTeamId } from "@/src/lib/firebase/firestore.js";
import ReviewsListClient from "@/src/components/Reviews/ReviewsListClient";
import { ReviewSkeleton } from "@/src/components/Reviews/Review";
import { getFirestore } from "firebase/firestore";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";

export default async function ReviewsList({ teamId, userId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const discussions = await getDiscussionsByTeamId(
    getFirestore(firebaseServerApp),
    teamId
  );

  return (
    <ReviewsListClient
      initialReviews={discussions}
      teamId={teamId}
      userId={userId}
    />
  );
}

export function ReviewsListSkeleton({ numReviews }) {
  return (
    <article>
      <ul className="reviews">
        <ul>
          {Array(numReviews)
            .fill(0)
            .map((value, index) => (
              <ReviewSkeleton key={`loading-review-${index}`} />
            ))}
        </ul>
      </ul>
    </article>
  );
}
