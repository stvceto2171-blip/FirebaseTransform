"use client";

// This components shows one individual team
// It receives data from src/app/team/[id]/page.jsx

import { React, useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { getTeamSnapshotById } from "@/src/lib/firebase/firestore.js";
import { useUser } from "@/src/lib/getUser";
import TeamDetails from "@/src/components/TeamDetails.jsx";
import { updateTeamImage } from "@/src/lib/firebase/storage.js";

const DiscussionDialog = dynamic(() => import("@/src/components/DiscussionDialog.jsx"));

export default function Team({
  id,
  initialTeam,
  initialUserId,
  children,
}) {
  const [teamDetails, setTeamDetails] = useState(initialTeam);
  const [isOpen, setIsOpen] = useState(false);

  // The only reason this component needs to know the user ID is to associate a discussion with the user, and to know whether to show the discussion dialog
  const userId = useUser()?.uid || initialUserId;
  const [discussion, setDiscussion] = useState({
    rating: 0,
    text: "",
  });

  const onChange = (value, name) => {
    setDiscussion({ ...discussion, [name]: value });
  };

  async function handleTeamImage(target) {
    const image = target.files ? target.files[0] : null;
    if (!image) {
      return;
    }

    const imageURL = await updateTeamImage(id, image);
    setTeamDetails({ ...teamDetails, photo: imageURL });
  }

  const handleClose = () => {
    setIsOpen(false);
    setDiscussion({ rating: 0, text: "" });
  };

  useEffect(() => {
    return getTeamSnapshotById(id, (data) => {
      setTeamDetails(data);
    });
  }, [id]);

  return (
    <>
      <TeamDetails
        team={teamDetails}
        userId={userId}
        handleTeamImage={handleTeamImage}
        setIsOpen={setIsOpen}
        isOpen={isOpen}
      >
        {children}
      </TeamDetails>
      <DiscussionDialog
        isOpen={isOpen}
        onClose={handleClose}
        teamId={id}
        userId={userId}
        discussion={discussion}
        onChange={onChange}
      />
    </>
  );
}





