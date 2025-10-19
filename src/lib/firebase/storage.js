import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import { storage } from "@/src/lib/firebase/clientApp";

import { updateTeamImageReference } from "@/src/lib/firebase/firestore";

export async function updateTeamImage(teamId, image) {
  try {
    if (!teamId) {
      throw new Error("No team ID has been provided.");
    }

    if (!image || !image.name) {
      throw new Error("A valid image has not been provided.");
    }

    const publicImageUrl = await uploadImage(teamId, image);
    await updateTeamImageReference(teamId, publicImageUrl);

    return publicImageUrl;
  } catch (error) {
    console.error("Error processing request:", error);
  }
}

async function uploadImage(teamId, image) {
  const filePath = `images/${teamId}/${image.name}`;
  const newImageRef = ref(storage, filePath);
  await uploadBytesResumable(newImageRef, image);

  return await getDownloadURL(newImageRef);
}
