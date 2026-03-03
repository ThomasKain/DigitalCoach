import { DocumentReference, Timestamp } from "firebase/firestore";

// export interface IInterviewDocumentReferenceAttributes {
//   userId: string;
//   interviewId: string;
// }

// export type TInterviewDocumentReference =
//   | DocumentReference<IInterviewAttributes>
//   | IInterviewDocumentReferenceAttributes;

// export interface IBaseInterview {
//   title: string;
// }

// export interface IInterviewAttributes extends IBaseInterview {
//   completedAt: Timestamp | null;
//   reviewedAt: Timestamp | null;
//   createdAt: Timestamp;
//   result: object | null;
// }

// export interface IInterview extends IInterviewAttributes {
//   id: string;
// }

/**
 * Interface for AI-generated feedback which provides overall feedback, clarity of responses, confidence in the responses, and how engaging the responses were.
 */
export interface IFeedback {
  ai_feedback: string,
  overall_competency: {
    clarity: {
      score: number,
      summary: string,
    },
    confidence: {
      score: number,
      summary: string,
    },
    engagement: {
      score: number,
      summary: string,
    },
    star: {
      score: number,
      summary: string,
    }
  }
}

/**
 * Interface for all performance metrics computed from an interview.s
 */
export interface IMetrics {
  filler_count: number,
  overall_score: number,
  wpm: number,
}

/**
 * Interview for how an interview is stored in the database.
 */
export interface IInterview {
  id: string,
  date: string, // MM/DD/YYYY
  timeStarted: string  // HH:MM 24-hour
  duration: string, // MMm SSs, e.g. 10m 43s not 0-padded
  feedback: IFeedback,
  metrics: IMetrics,
  transcript: string[],
  url: string,
}

