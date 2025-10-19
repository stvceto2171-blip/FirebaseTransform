"use client";

import { React, useState } from "react";
import { handleDiscussionFormSubmission } from "@/src/app/actions.js";
import RatingPicker from "@/src/components/RatingPicker.jsx";

export default function DiscussionDialog({
  isOpen,
  onClose,
  teamId,
  userId,
  discussion,
  onChange,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(event.target);
      formData.append("teamId", teamId);
      formData.append("userId", userId);

      await handleDiscussionFormSubmission(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting discussion:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog open>
      <article>
        <header>
          <h3>Add Discussion</h3>
        </header>

        <form onSubmit={handleSubmit}>
          <RatingPicker
            rating={discussion.rating}
            onChange={(rating) => onChange(rating, "rating")}
          />

          <textarea
            id="discussion"
            name="text"
            placeholder="Share your thoughts about this team..."
            value={discussion.text}
            onChange={(event) => onChange(event.target.value, "text")}
            required
          />

          <footer>
            <menu>
              <button
                className="button--cancel"
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="button--confirm"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </menu>
          </footer>
        </form>
      </article>
    </dialog>
  );
}







