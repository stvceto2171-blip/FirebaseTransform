import React from "react";
import renderStars from "@/src/components/Stars.jsx";

export default function Discussion({ discussion, userId }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="discussion__item">
      <div className="discussion__rating">
        <ul>{renderStars(discussion.rating)}</ul>
      </div>
      
      <div className="discussion__content">
        <p className="discussion__text">{discussion.text}</p>
        <time className="discussion__time">
          {formatDate(discussion.timestamp)}
        </time>
      </div>
    </div>
  );
}







