/**
 * A collection of Firestore functions used to manipulate users' interviews. 
 */
import {
  addDoc,
  collection,
  collectionGroup,
  CollectionReference,
  doc,
  DocumentReference,
  // Firestore,
  getDoc,
  getDocs,
  // getFirestore,
  // Query,
  query,
  Timestamp,
} from "firebase/firestore";
// import FirebaseService from "@App/lib/firebase/FirebaseService";
// import UserService from "@App/lib/user/UserService";
import {
  IBaseInterview,
  IInterviewAttributes,
  TInterviewDocumentReference,
} from "@App/lib/interview/models";
import { db } from "@App/lib/firebase/firebase.config"; // import firebase firestore service
import { getUser, updateUser } from "@App/lib/user/UserService";

/**
 * Creating a new interview document within a specific user's interview collection. 
 */
export async function createInterview(
  userId: string,
  baseInterview: IBaseInterview,
  result = {}
) {
  const collectionRef = collection(db, "users", userId, "interviews"); // get a reference to a user's interview collection

  // get user data
  const userData = await getUser(userId);

  // only update if we have the data
  if (userData) {
    await updateUser(userId, {
      name: userData.name,
      concentration: userData.concentration,
      proficiency: userData.proficiency,
      avatarUrl: userData.avatarUrl,
    });
  }


  const interview: IInterviewAttributes = {
    ...baseInterview, 
    completedAt: null,
    reviewedAt: null,
    createdAt: Timestamp.now(),
    result: result,
  };

  return addDoc(collectionRef, interview); // add interview to user's interview collection
}

/**
 * Returns all the interview documents stored in a user's interview collection. 
 */
export async function fetchUserInterviews(userId: string) {
  userId = userId.trim();
  const collectionRef = collection(db, "users", userId, "interviews");
  return await getDocs(collectionRef);
}

/**
 * Returns an interview document based on a document reference or interview document reference.
 */
export async function fetchInterview(ref: TInterviewDocumentReference) {
  let docRef;
  if (ref instanceof DocumentReference) docRef = ref;
  docRef = doc(db, "users", ref.userId, "interviews", ref.interviewId);
  return getDoc(docRef);
}

/**
 * Returns a reference to a collection group called interviews.
 */
export async function getAllInterviews() {
  return getDocs(query(collectionGroup(db, "interviews")));
}

// class InterviewService extends FirebaseService {
//   private firestore: Firestore;

//   constructor(db?: Firestore) {
//     super();
//     this.firestore = db || getFirestore(this.app);
//   }

//   /**
//    * This function returns a reference to a collection group called interviews.
//    * @returns A Query<IInterviewAttributes>
//    */
//   private getCollectionGroupRef() {
//     return collectionGroup(
//       this.firestore,
//       "interviews"
//     ) as Query<IInterviewAttributes>;
//   }

//   /**
//    * If the argument is a DocumentReference, return it. Otherwise, return a DocumentReference
//    * @param {TInterviewDocumentReference} ref - TInterviewDocumentReference
//    * @returns A DocumentReference&lt;IInterviewAttributes&gt;
//    */
//   getDocRef(ref: TInterviewDocumentReference) {
//     if (ref instanceof DocumentReference) return ref;

//     return doc(
//       this.firestore,
//       "users",
//       ref.userId,
//       "interviews",
//       ref.interviewId
//     ) as DocumentReference<IInterviewAttributes>;
//   }

//   /**
//    * This function returns a reference to a collection of interviews for a given user.
//    * @param {string} userId - string - the user id of the user who owns the interview
//    * @returns A CollectionReference of type IInterviewAttributes
//    */
//   private getCollectionRef(userId: string) {
//     return collection(
//       this.firestore,
//       "users",
//       userId,
//       "interviews"
//     ) as CollectionReference<IInterviewAttributes>;
//   }

//   /**
//    * It creates a new interview in the database. The user data is retrieved to update the hasCompletedInterview field of the user
//    * @param {string} userId - string
//    * @param {IBaseInterview} baseInterview - IBaseInterview
//    * @returns a promise.
//    */
//   async create(userId: string, baseInterview: IBaseInterview, result = {}) {
//     const collectionRef = this.getCollectionRef(userId);
//     const userDocSnapshot = await UserService.getUser(userId);
//     const userData = userDocSnapshot.data(); // Get the actual data from the snapshot

//     // Only update user if we have the data
//     if (userData) {
//       await UserService.updateUser(userId, {
//         name: userData.name,
//         concentration: userData.concentration,
//         proficiency: userData.proficiency,
//         avatarUrl: userData.avatarUrl,
//       });
//     }

//     const interview: IInterviewAttributes = {
//       ...baseInterview,
//       completedAt: null,
//       reviewedAt: null,
//       createdAt: Timestamp.now(),
//       result: result,
//     };

//     return addDoc(collectionRef, interview);
//   }

//   /**
//    * This function fetches all the documents in a collection and returns them as an array.
//    * @param {string} userId - string - the user id of the user whose interviews we want to fetch
//    * @returns An array of documents.
//    */
//   async fetchUserInterviews(userId: string) {
//     const collectionRef = this.getCollectionRef(userId);

//     return await getDocs(collectionRef);
//   }

//   /**
//    * It returns a promise that resolves to a document snapshot
//    * @param {TInterviewDocumentReference} ref - TInterviewDocumentReference
//    * @returns A promise that resolves to a document snapshot.
//    */
//   async fetchInterview(ref: TInterviewDocumentReference) {
//     const docRef = this.getDocRef(ref);

//     return getDoc(docRef);
//   }

//   /**
//    * This function returns a promise that resolves to an array of documents from the collection group.
//    * @returns An array of objects.
//    */
//   async getAllInterviews() {
//     const groupQuery = query(this.getCollectionGroupRef());

//     return getDocs(groupQuery);
//   }
// }

// export default new InterviewService();
