"use client";

// This components handles the discussion dialog and uses a next.js feature known as Server Actions to handle the form submission

import { useEffect, useLayoutEffect, useRef } from "react";
import RatingPicker from "@/src/components/RatingPicker.jsx";
import { handleDiscussionFormSubmission } from "@/src/app/actions.js";

const ReviewDialog = ({
  isOpen,
  onClose,
  discussion,
  onChange,
  userId,
  teamId,
}) => {
  const dialog = useRef();

  // dialogs only render their backdrop when called with `showModal`
  useLayoutEffect(() => {
    if (isOpen) {
      dialog.current.showModal();
    } else {
      dialog.current.close();
    }
  }, [isOpen, dialog]);

  const handleClick = (e) => {
    // close if clicked outside the modal
    if (e.target === dialog.current) {
      onClose();
    }
  };

  return (
    <dialog ref={dialog} onMouseDown={handleClick}>
      <form
        action={handleDiscussionFormSubmission}
        onSubmit={() => {
          onClose();
        }}
      >
        <header>
          <h3>Add your discussion</h3>
        </header>
        <article>
          <RatingPicker />

          <p>
            <input
              type="text"
              name="text"
              id="discussion"
              placeholder="Write your thoughts here"
              required
              value={discussion.text}
              onChange={(e) => onChange(e.target.value, "text")}
            />
          </p>

          <input type="hidden" name="teamId" value={teamId} />
          <input type="hidden" name="userId" value={userId} />
        </article>
        <footer>
          <menu>
            <button
              autoFocus
              type="reset"
              onClick={onClose}
              className="button--cancel"
            >
              Cancel
            </button>
            <button type="submit" value="confirm" className="button--confirm">
              Submit
            </button>
          </menu>
        </footer>
      </form>
    </dialog>
  );
};

export default ReviewDialog;
