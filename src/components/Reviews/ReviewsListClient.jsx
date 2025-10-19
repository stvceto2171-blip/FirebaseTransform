"use client";

import React, { useState, useEffect } from "react";
import { getDiscussionsSnapshotByTeamId } from "@/src/lib/firebase/firestore.js";
import { Review } from "@/src/components/Reviews/Review";

export default function ReviewsListClient({
  initialReviews,
  teamId,
  userId,
}) {
  const [reviews, setReviews] = useState(initialReviews);

  useEffect(() => {
    return getDiscussionsSnapshotByTeamId(teamId, (data) => {
      setReviews(data);
    });
  }, [teamId]);
  return (
    <article>
      <ul className="reviews">
        {reviews.length > 0 ? (
          <ul>
            {reviews.map((review) => (
              <Review
                key={review.id}
                rating={review.rating}
                text={review.text}
                timestamp={review.timestamp}
              />
            ))}
          </ul>
        ) : (
          <p>
            This team has not been discussed yet,{" "}
            {!userId ? "first login and then" : ""} add your own discussion!
          </p>
        )}
      </ul>
    </article>
  );
}
