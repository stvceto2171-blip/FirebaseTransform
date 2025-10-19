// This component shows team metadata, and offers some actions to the user like uploading a new team image, and adding a discussion.

import React from "react";
import renderStars from "@/src/components/Stars.jsx";

const TeamDetails = ({
  team,
  userId,
  handleTeamImage,
  setIsOpen,
  isOpen,
  children,
}) => {
  return (
    <section className="img__section">
      <img src={team.photo} alt={team.name} />

      <div className="actions">
        {userId && (
          <img
            alt="discussion"
            className="discussion"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
            src="/review.svg"
          />
        )}
        <label
          onChange={(event) => handleTeamImage(event.target)}
          htmlFor="upload-image"
          className="add"
        >
          <input
            name=""
            type="file"
            id="upload-image"
            className="file-input hidden w-full h-full"
          />

          <img className="add-image" src="/add.svg" alt="Add image" />
        </label>
      </div>

      <div className="details__container">
        <div className="details">
          <h2>{team.name}</h2>

          <div className="team__rating">
            <ul>{renderStars(team.avgRating)}</ul>

            <span>({team.numRatings})</span>
          </div>

          <p>
            {team.division} | {team.city}
          </p>
          <p>Record: {team.wins}-{team.losses}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default TeamDetails;







