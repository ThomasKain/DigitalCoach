// import {
//   addDoc,
//   collection,
//   collectionGroup,
//   CollectionReference,
//   DocumentReference,
//   Firestore,
//   getDocs,
//   getFirestore,
//   Query,
//   Timestamp,
//   where,
//   query,
// } from "firebase/firestore";
// import FirebaseService from "@App/lib/firebase/FirebaseService";
// import { IAnswer, IAnswerAttributes } from "@App/lib/answer/model";
// import { TInterviewQuestionDocumentReference } from "@App/lib/interviewQuestion/models";

// class AnswerService extends FirebaseService {
//   private firestore: Firestore;

//   constructor() {
//     super();
//     this.firestore = getFirestore(this.app);
//   }
  
//   /**
//    * If the ref is a DocumentReference, return a collection of answers for that document. Otherwise,
//    * return a collection of answers for the user, interview, and question specified in the ref.
//    * @param {TInterviewQuestionDocumentReference} ref - TInterviewQuestionDocumentReference
//    * @returns A CollectionReference&lt;IAnswer&gt;
//    */
//   private getCollectionRef(ref: TInterviewQuestionDocumentReference) {
//     return (
//       ref instanceof DocumentReference
//         ? collection(ref, "answers")
//         : collection(
//             this.firestore,
//             "users",
//             ref.userId,
//             "interviews",
//             ref.interviewId,
//             "questions",
//             ref.questionId,
//             "answers"
//           )
//     ) as CollectionReference<IAnswer>;
//   }

//   /**
//    * This function returns a reference to the collection group named 'answers' in the firestore
//    * database.
//    * @returns A Query<IAnswer>
//    */
//   private getCollectionGroupRef() {
//     return collectionGroup(this.firestore, "answers") as Query<IAnswer>;
//   }

//   /**
//    * This function adds an answer to a question in an interview.
//    * @param {TInterviewQuestionDocumentReference} ref - TInterviewQuestionDocumentReference
//    * @param {IAnswerAttributes} answerAttr - IAnswerAttributes
//    */
//   async addAnswer(
//     ref: TInterviewQuestionDocumentReference,
//     answerAttr: IAnswerAttributes
//   ) {
//     const collectionRef = this.getCollectionRef(ref);

//     const answer = { ...answerAttr, createdAt: Timestamp.now() };

//     return addDoc(collectionRef, answer);
//   }

//   /**
//    * It returns a promise that resolves to an array of documents from a collection group.
//    * @returns An array of objects.
//    */
//   async getAllAnswers() {
//     const collectionGroupRef = this.getCollectionGroupRef();

//     return getDocs(collectionGroupRef);
//   }

//   /**
//    * Get all the answers from all the collections where the userId is equal to the userId passed in.
//    * @param {string} userId - string
//    * @returns An array of answers.
//    */
//   async getAnswersByUserId(userId: string) {
//     const collectionGroupRef = this.getCollectionGroupRef();

//     return getDocs(query(collectionGroupRef, where("userId", "==", userId)));
//   }

//   /**
//    * It returns a promise that resolves to an array of documents from a collection
//    * @param {TInterviewQuestionDocumentReference} ref - TInterviewQuestionDocumentReference
//    * @returns An array of answers.
//    */
//   async getAnswers(ref: TInterviewQuestionDocumentReference) {
//     const collectionRef = this.getCollectionRef(ref);

//     return getDocs(collectionRef);
//   }

//   /**
//    * It returns the first document in the array of documents that has a property called isSubmission
//    * set to true
//    * @param {TInterviewQuestionDocumentReference} ref - TInterviewQuestionDocumentReference
//    * @returns A document reference to the submission.
//    */
//   async getSubmission(ref: TInterviewQuestionDocumentReference){
//     const answerDocs = await this.getAnswers(ref);
//     return answerDocs.docs.find(item => item.data().isSubmission);
//   }
// }

// export default new AnswerService();
