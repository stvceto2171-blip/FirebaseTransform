import { gemini20Flash, googleAI } from "@genkit-ai/googleai";
import { genkit } from "genkit";
import { getDiscussionsByTeamId } from "@/src/lib/firebase/firestore.js";
import { getAuthenticatedAppForUser } from "@/src/lib/firebase/serverApp";
import { getFirestore } from "firebase/firestore";

export async function GeminiSummary({ teamId }) {
  const { firebaseServerApp } = await getAuthenticatedAppForUser();
  const discussions = await getDiscussionsByTeamId(
    getFirestore(firebaseServerApp),
    teamId
  );

  const discussionSeparator = "@";
  const prompt = `
    Based on the following team discussions, 
    where each discussion is separated by a '${discussionSeparator}' character, 
    create a one-sentence summary of what fans think of this NFL team. 
    
    Here are the discussions: ${discussions.map((discussion) => discussion.text).join(discussionSeparator)}
  `;

  try {
    if (!process.env.GEMINI_API_KEY) {
      // Make sure GEMINI_API_KEY environment variable is set:
      // https://firebase.google.com/docs/genkit/get-started
      throw new Error(
        'GEMINI_API_KEY not set. Set it with "firebase apphosting:secrets:set GEMINI_API_KEY"'
      );
    }

    // Configure a Genkit instance.
    const ai = genkit({
      plugins: [googleAI()],
      model: gemini20Flash, // set default model
    });
    const { text } = await ai.generate(prompt);

    return (
      <div className="team__discussion_summary">
        <p>{text}</p>
        <p>✨ Summarized with Gemini</p>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <p>Error summarizing discussions.</p>;
  }
}

export function GeminiSummarySkeleton() {
  return (
    <div className="team__discussion_summary">
      <p>✨ Summarizing discussions with Gemini...</p>
    </div>
  );
}







