import { DocumentReference, Timestamp } from "firebase/firestore";

export interface IInterviewDocumentReferenceAttributes {
  userId: string;
  interviewId: string;
}

export type TInterviewDocumentReference =
  | DocumentReference<IInterviewAttributes>
  | IInterviewDocumentReferenceAttributes;

export interface IBaseInterview {
  title: string;
}

export interface IInterviewAttributes extends IBaseInterview {
  completedAt: Timestamp | null;
  reviewedAt: Timestamp | null;
  createdAt: Timestamp;
  result: object | null;
}

export interface IInterview extends IInterviewAttributes {
  id: string;
}