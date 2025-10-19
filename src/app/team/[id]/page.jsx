import Team from "@/src/components/Team.jsx";
import { Suspense } from "react";
import { getTeamById } from "@/src/lib/firebase/firestore.js";
import {
  getAuthenticatedAppForUser,
  getAuthenticatedAppForUser as getUser,
} from "@/src/lib/firebase/serverApp.js";
import DiscussionsList, {
  DiscussionsListSkeleton,
} from "@/src/components/Discussions/DiscussionsList";
import {
  GeminiSummary,
  GeminiSummarySkeleton,
} from "@/src/components/Discussions/DiscussionSummary";
import { getFirestore } from "firebase/firestore";

export default async function Home(props) {
  // This is a server component, we can access URL
  // parameters via Next.js and download the data
  // we need for this page
  const params = await props.params;
  const { currentUser } = await getUser();
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const team = await getTeamById(
    getFirestore(firebaseServerApp),
    params.id
  );

  return (
    <main className="main__team">
      <Team
        id={params.id}
        initialTeam={team}
        initialUserId={currentUser?.uid || ""}
      >
        <Suspense fallback={<GeminiSummarySkeleton />}>
          <GeminiSummary teamId={params.id} />
        </Suspense>
      </Team>
      <Suspense
        fallback={<DiscussionsListSkeleton numDiscussions={team.numRatings} />}
      >
        <DiscussionsList teamId={params.id} userId={currentUser?.uid || ""} />
      </Suspense>
    </main>
  );
}



