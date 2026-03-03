// /**
//  * A collection of Firestore functions used to manipulate users' interviews. 
//  */
// import {
//   addDoc,
//   collection,
//   collectionGroup,
//   doc,
//   DocumentReference,
//   getDoc,
//   getDocs,
//   query,
//   Timestamp,
// } from "firebase/firestore";
// import {
//   IBaseInterview,
//   IInterviewAttributes,
//   TInterviewDocumentReference,
// } from "@App/lib/interview/models";
// import { db } from "@App/lib/firebase/firebase.config"; // import firebase firestore service
// import { getUser, updateUser } from "@App/lib/user/UserService";

// /**
//  * Creating a new interview document within a specific user's interview collection. 
//  */
// export async function createInterview(
//   userId: string,
//   baseInterview: IBaseInterview,
//   result = {}
// ) {
//   const collectionRef = collection(db, "users", userId, "interviews"); // get a reference to a user's interview collection

//   // get user data
//   const userData = await getUser(userId);

//   // only update if we have the data
//   if (userData) {
//     await updateUser(userId, {
//       name: userData.name,
//       concentration: userData.concentration,
//       proficiency: userData.proficiency,
//       avatarUrl: userData.avatarUrl,
//     });
//   }


//   const interview: IInterviewAttributes = {
//     ...baseInterview, 
//     completedAt: null,
//     reviewedAt: null,
//     createdAt: Timestamp.now(),
//     result: result,
//   };

//   return addDoc(collectionRef, interview); // add interview to user's interview collection
// }

// /**
//  * Returns all the interview documents stored in a user's interview collection. 
//  */
// export async function fetchUserInterviews(userId: string) {
//   userId = userId.trim();
//   const collectionRef = collection(db, "users", userId, "interviews");
//   return await getDocs(collectionRef);
// }

// /**
//  * Returns an interview document based on a document reference or interview document reference.
//  */
// export async function fetchInterview(ref: TInterviewDocumentReference) {
//   let docRef;
//   if (ref instanceof DocumentReference) docRef = ref;
//   docRef = doc(db, "users", ref.userId, "interviews", ref.interviewId);
//   return getDoc(docRef);
// }

// /**
//  * Returns a reference to a collection group called interviews.
//  */
// export async function getAllInterviews() {
//   return getDocs(query(collectionGroup(db, "interviews")));
// }