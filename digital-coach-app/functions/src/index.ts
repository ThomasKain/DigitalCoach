// import * as functions from "firebase/functions";
// import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
// import { getStorage, getDownloadURL, ref } from "firebase/storage";
// import { default as axios } from "axios";
// import { answerOneResponse, answerTwoResponse } from "./sampledata";

// export const answerReceive = functions.https.onRequest(async (req, res) => {
//   /**
//    * Receives evaluation performance from the backend, e.g. interview score, and populates the corresponding document in Firebase Firestore.
//    */

//   const { evaluation, userId, interviewId, questionId, answerId } = req.body;
//   if (!evaluation || !userId || !interviewId || !questionId || !answerId) {
//     res.status(400).send("Bad request");
//   }
//   const firestore = getFirestore();
//   const answerRef = doc(
//     firestore,
//     `users/${userId}/interviews/${interviewId}/questions/${questionId}/answers/${answerId}`,
//   );
//   const answer = await getDoc(answerRef);
//   if (!answer.exists) {
//     res.status(400).send("Resource not found");
//   }
//   await updateDoc(answerRef, { evaluation });
//   res.status(200).send("Success");
// });

// /* A function that is triggered when a new document is created in the specified path. */
// export const answerUpload = functions.firestore
//   .onDocumentCreated(
//     "users/{userId}/interviews/{interviewId}/interviewQuestions/{questionId}/answers/{answerId}", async (event) => {
//     const snapshot = event.data;
//     const { userId, interviewId, questionId, answerId } = event.params;

//     if (!snapshot) return;

//     const data = snapshot.data();

//     const videoRefUrl = data.videoUrl;
//     const videoRef = ref(getStorage(app), videoRefUrl);
//     const videoDownloadUrl = await getDownloadURL(videoRef);

//     if (!process.env.ML_API_URL) {
//       functions.logger.log("ML_API_URL is not set, using dummy data...");

//       const evaluation = videoRef.toString().includes("answer-0")
//         ? answerOneResponse
//         : answerTwoResponse;

//       snapshot.ref.update({ ...evaluation });
//     } else {
//       try {
//         const MLApiResponse = await axios.post(process.env.ML_API_URL, {
//           videoUrl: videoDownloadUrl,
//           userId,
//           interviewId,
//           questionId,
//           answerId,
//         });
//         functions.logger.log("MLApiResponse sent: ", MLApiResponse);
//       } catch (error) {
//         functions.logger.error(error);
//       }
//     }
//   });


import { onRequest } from 'firebase-functions/https';


/**
 * When receiving an HTTP request, 
*/
type Indexable = { [key: string]: any };
export const helloWorld = onRequest((req, res) => {
    const name = req.params[0];


    const items: Indexable = { toy: "This is a toy.", game: "Great game."};
    const message = items[name];
    
    res.send(`<h1>${message}</h1>`);
});