import {
  randomNumberBetween,
  getRandomDateAfter,
  getRandomDateBefore,
} from "@/src/lib/utils.js";
import { randomData } from "@/src/lib/randomData.js";

import { Timestamp } from "firebase/firestore";

export async function generateFakeTeamsAndDiscussions() {
  const teamsToAdd = 8;
  const data = [];

  for (let i = 0; i < teamsToAdd; i++) {
    const teamTimestamp = Timestamp.fromDate(getRandomDateBefore());

    const discussionsData = [];

    // Generate a random number of discussions for this team
    for (let j = 0; j < randomNumberBetween(0, 8); j++) {
      const discussionTimestamp = Timestamp.fromDate(
        getRandomDateAfter(teamTimestamp.toDate())
      );

      const discussionData = {
        rating:
          randomData.teamDiscussions[
            randomNumberBetween(0, randomData.teamDiscussions.length - 1)
          ].rating,
        text: randomData.teamDiscussions[
          randomNumberBetween(0, randomData.teamDiscussions.length - 1)
        ].text,
        userId: `User #${randomNumberBetween()}`,
        timestamp: discussionTimestamp,
      };

      discussionsData.push(discussionData);
    }

    const avgRating = discussionsData.length
      ? discussionsData.reduce(
          (accumulator, currentValue) => accumulator + currentValue.rating,
          0
        ) / discussionsData.length
      : 0;

    const teamData = {
      division:
        randomData.teamDivisions[
          randomNumberBetween(0, randomData.teamDivisions.length - 1)
        ],
      name: randomData.teamNames[
        randomNumberBetween(0, randomData.teamNames.length - 1)
      ],
      avgRating,
      city: randomData.teamCities[
        randomNumberBetween(0, randomData.teamCities.length - 1)
      ],
      conference: randomData.teamConferences[
        randomNumberBetween(0, randomData.teamConferences.length - 1)
      ],
      numRatings: discussionsData.length,
      sumRating: discussionsData.reduce(
        (accumulator, currentValue) => accumulator + currentValue.rating,
        0
      ),
      wins: randomNumberBetween(0, 17),
      losses: randomNumberBetween(0, 17),
      photo: `https://storage.googleapis.com/firestorequickstarts.appspot.com/team_${randomNumberBetween(
        1,
        32
      )}.png`,
      timestamp: teamTimestamp,
    };

    data.push({
      teamData,
      discussionsData,
    });
  }
  return data;
}
