"use client";

import { React, useState, useEffect } from "react";
import { getDiscussionsSnapshotByTeamId } from "@/src/lib/firebase/firestore.js";
import Discussion from "./Discussion.jsx";

export default function DiscussionsList({ teamId, userId }) {
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    return getDiscussionsSnapshotByTeamId(teamId, (data) => {
      setDiscussions(data);
    });
  }, [teamId]);

  return (
    <section className="discussions">
      {discussions.map((discussion) => (
        <Discussion
          key={discussion.id}
          discussion={discussion}
          userId={userId}
        />
      ))}
    </section>
  );
}

export function DiscussionsListSkeleton({ numDiscussions }) {
  return (
    <section className="discussions">
      {Array.from({ length: numDiscussions || 3 }).map((_, index) => (
        <div key={index} className="discussion__item">
          <div className="discussion__skeleton">
            <div className="skeleton__rating"></div>
            <div className="skeleton__text"></div>
            <div className="skeleton__text short"></div>
            <div className="skeleton__time"></div>
          </div>
        </div>
      ))}
    </section>
  );
}







