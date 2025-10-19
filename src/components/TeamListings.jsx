"use client";

// This components handles the team listings page
// It receives data from src/app/page.jsx, such as the initial teams and search params from the URL

import Link from "next/link";
import { React, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import renderStars from "@/src/components/Stars.jsx";
import { getTeamsSnapshot } from "@/src/lib/firebase/firestore.js";
import Filters from "@/src/components/Filters.jsx";

const TeamItem = ({ team }) => (
  <li key={team.id}>
    <Link href={`/team/${team.id}`}>
      <ActiveTeam team={team} />
    </Link>
  </li>
);

const ActiveTeam = ({ team }) => (
  <div>
    <ImageCover photo={team.photo} name={team.name} />
    <TeamDetails team={team} />
  </div>
);

const ImageCover = ({ photo, name }) => (
  <div className="image-cover">
    <img src={photo} alt={name} />
  </div>
);

const TeamDetails = ({ team }) => (
  <div className="team__details">
    <h2>{team.name}</h2>
    <TeamRating team={team} />
    <TeamMetadata team={team} />
  </div>
);

const TeamRating = ({ team }) => (
  <div className="team__rating">
    <ul>{renderStars(team.avgRating)}</ul>
    <span>({team.numRatings})</span>
  </div>
);

const TeamMetadata = ({ team }) => (
  <div className="team__meta">
    <p>
      {team.division} | {team.city}
    </p>
    <p>Record: {team.wins}-{team.losses}</p>
  </div>
);

export default function TeamListings({
  initialTeams,
  searchParams,
}) {
  const router = useRouter();

  // The initial filters are the search params from the URL, useful for when the user refreshes the page
  const initialFilters = {
    city: searchParams.city || "",
    division: searchParams.division || "",
    conference: searchParams.conference || "",
    sort: searchParams.sort || "",
  };

  const [teams, setTeams] = useState(initialTeams);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    routerWithFilters(router, filters);
  }, [router, filters]);

  useEffect(() => {
    return getTeamsSnapshot((data) => {
      setTeams(data);
    }, filters);
  }, [filters]);

  return (
    <article>
      <Filters filters={filters} setFilters={setFilters} />
      <ul className="teams">
        {teams.map((team) => (
          <TeamItem key={team.id} team={team} />
        ))}
      </ul>
    </article>
  );
}

function routerWithFilters(router, filters) {
  const queryParams = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") {
      queryParams.append(key, value);
    }
  }

  const queryString = queryParams.toString();
  router.push(`?${queryString}`);
}







