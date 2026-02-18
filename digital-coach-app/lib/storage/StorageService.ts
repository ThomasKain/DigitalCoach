// import {
//   FirebaseStorage,
//   getDownloadURL,
//   getStorage,
//   ref,
//   StorageReference,
//   uploadBytes,
// } from "firebase/storage";
// import { uuid } from "uuidv4";
// import FirebaseService from "@App/lib/firebase/FirebaseService";


/**
 * Collection of functions for Firebase Storage.
 */
import {
  ref, 
  uploadBytes,
  getDownloadURL,
  StorageReference,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; 
import { storage } from "@App/lib/firebase/firebase.config"; // import firebase storage service from firebase configuration

export enum EStorageFolders {
  profilePic = "profilePic",
  videos = "videos",
}

/**
 * Uploads a given file to a specific folder in Firebase Storage and returns the download URL.
 */
export async function uploadFile(file: File, folder: EStorageFolders, filename: string = uuidv4()) {
  const fileRef = ref(storage, `${folder}/${filename}`);
  await uploadBytes(fileRef, file, { contentType: file.type});
  return getDownloadURL(fileRef);
}

/**
 * Uploads a video to Firebase Storage and returns the download URL. 
 */
export async function uploadAnswerVideo(file: File | Blob | ArrayBuffer, interviewId: string) {
  const videoRef = ref(storage, `interview-responses/${interviewId}.mp4`);
  await uploadBytes(videoRef, file, { contentType: "video/mp4"});
  return getDownloadURL(videoRef);
}

// class StorageService extends FirebaseService {
//   private storage: FirebaseStorage;

//   constructor() {
//     super();
//     this.storage = getStorage(this.app);
//   }

//   /**
//    * It takes a file, a folder, and a filename, and uploads the file to the folder with the filename
//    * @param {File} file - File - The file you want to upload
//    * @param {EStorageFolders} folder - EStorageFolders - This is an enum that I created to help me keep
//    * track of the different folders I have in my storage.
//    * @param {string} filename - The name of the file you want to upload.
//    * @returns The download URL of the file.
//    */
//   async upload(file: File, folder: EStorageFolders, filename: string = uuid()) {
//     const fileRef = ref(this.storage, `${folder}/${filename}`);

//     await uploadBytes(fileRef, file, { contentType: file.type });

//     return getDownloadURL(fileRef);
//   }

//   /**
//    * Uploads a video file to Firebase Storage
//    * @param {File|Blob|ArrayBuffer} file - File|Blob|ArrayBuffer
//    * @param {string} interviewId - the id of the interview
//    * @returns A promise that resolves to the metadata of the uploaded file.
  
//    */
//   async uploadAnswerVideo(
//     file: File | Blob | ArrayBuffer,
//     interviewId: string
//   ) {
//     const storage = getStorage();
//     const interviewAnswersRef = ref(
//       storage,
//       `interview-responses/${interviewId}.mp4`
//     );
//     return uploadBytes(interviewAnswersRef, file, { contentType: "video/mp4" });
//   }
//   /**
//    * If the videoUrl is a string, then create a reference to the videoUrl string and return the
//    * download url of that reference.
//    *
//    * If the videoUrl is a reference, then return the download url of that reference.
//    * @param {string | StorageReference} videoUrl - string | StorageReference
//    * @returns A promise that resolves to a string.
//    */
//   async getDownloadUrlFromVideoUrlRef(videoUrl: string | StorageReference) {
//     const storage = getStorage();
//     if (typeof videoUrl === "string" || videoUrl instanceof String) {
//       const videoUrlString = videoUrl as string;
//       const interviewAnswersRef = ref(storage, videoUrlString);
//       return getDownloadURL(interviewAnswersRef);
//     } else {
//       const videoUrlRef = videoUrl as StorageReference;
//       return getDownloadURL(videoUrlRef);
//     }
//   }
// }

// export default new StorageService();
