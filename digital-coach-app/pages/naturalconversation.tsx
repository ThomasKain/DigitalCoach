import { useState, useEffect, useRef } from "react";
import Transcript from "@App/components/organisms/Transcript";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { uploadAnswerVideo } from "@App/lib/storage/StorageService";
import { v4 as uuidv4 } from "uuid";
// import styles from "@App/styles/NaturalConversationPage.module.scss";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";

import InteractiveAvatar from "@App/components/organisms/InteractiveAvatar";
import VideoRecorder from "@App/components/video";


type Role = "user" | "interviewer";
interface Message {
  role: Role;
  text: string;
  timestamp: string;
}

const formatTimestamp = () =>
  new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    });

export default function NaturalConversationPage() {
  // const avatarRef = useRef<{
  //   startSession: () => void;
  //   endSession: () => void;
  //   handleInterrupt: () => void;
  // } | null>(null);
  // const [wasRecording, setWasRecording] = useState(false);
  // const [messages, setMessages] = useState<Message[]>([]);
  // const videoRef = useRef<HTMLVideoElement>(null);
  
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [token, setToken] = useState("");

  // const { startRecording, stopRecording, mediaBlobUrl, previewStream } =
  //   useReactMediaRecorder({ video: true });

  // Callback to add a new user message.
  // const handleUserTranscript = (userTranscript: string) => {
  //   const newMessage: Message = {
  //     role: "user",
  //     text: userTranscript,
  //     timestamp: formatTimestamp(),
  //   };
  //   setMessages((prev) => [...prev, newMessage]);
  // };

  // Callback to add a new interviewer (HeyGen API) message.
  // const handleInterviewerTranscript = (interviewerTranscript: string) => {
  //   const newMessage: Message = {
  //     role: "interviewer",
  //     text: interviewerTranscript,
  //     timestamp: formatTimestamp(),
  //   };
  //   setMessages((prev) => [...prev, newMessage]);
  // };

  /**
   * Requests backend to get a session token from HeyGen LiveAvatar API.
   */
  const handleStartInterview = async () => {
    // request heygen session token
    console.log("Requesting Interview Session...")
    const host = typeof window !== "undefined" ? "localhost:8000" : "api"; // if we're in the browser use localhost, but if we're in Docker, use the backend's service name (currently 'api')
    console.log(`Using ${host} for the host.`);
    try {
      const response = await fetch(`http://${host}/api/heygen/session_token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Token request successful!");
        setToken(data);
      } else {
        throw `Error: ${response.statusText || "Something went wrong"}`;
      }
    } catch (error) {
        console.error(`Submission error: ${error}`);
    }
  };

  const handleStopInterview = async () => {

  }

  // const handleInterruptAvatar = async () => {
  //   await avatarRef.current?.handleInterrupt();
  // };

  // const waitForJobResult = async (
  //   jobId: string,
  //   retries = 10,
  //   delay = 3000
  // ) => {
  //   for (let i = 0; i < retries; i++) {
  //     const statusRes = await axios.get(
  //       `http://localhost:8000/api/create_answer/${jobId}`
  //     );

  //     if (statusRes.data.status === "completed") {
  //       return axios.get(
  //         `http://localhost:8000/api/create_answer/${jobId}/result`
  //       );
  //     }

  //     await new Promise((res) => setTimeout(res, delay));
  //   }
  //   throw new Error("Job did not complete in time.");
  // };

  // Optional: This function is still available if you need to manually fetch a response.
  // const getResponse = async () => {
  //   try {
  //     const getFile = async () => {
  //       const url = mediaBlobUrl || "/output.mp4";
  //       let blob = await fetch(url).then((res) => res.blob());
  //       return new File([blob], "video.mp4");
  //     };
  //     const file = await getFile();

  //     const dlURL = await uploadAnswerVideo(file, uuidv4());
  //     console.log("Video Uploaded to:", dlURL);
      
  //     // const url = (await uploadAnswerVideo(
  //     //   file,
  //     //   uuidv4()
  //     // )) as any;
  //     // const dlURL = await StorageService.getDownloadUrlFromVideoUrlRef(
  //     //   "gs://" + url.ref._location.bucket + "/" + url.ref._location.path
  //     // );
  //     // console.log(dlURL);

  //     const sentResponse = await axios.post(
  //       "http://localhost:8000/api/create_answer/",
  //       {
  //         video_url: dlURL,
  //       }
  //     );
  //     const jobId = sentResponse.data.job_id;

  //     const jobIdResponse = await waitForJobResult(jobId);

  //     console.log(jobIdResponse);
  //   } catch (error) {
  //     console.error("Error:", error);
  //     alert("An error occurred while processing the recording.");
  //   }
  // };

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.srcObject = previewStream || null;
  //   }
  // }, [previewStream]);

  return (
    // AuthGuard ensures that only logged-in users can view this page.
    // If a user isn't logged in, they are typically redirected away.
    <AuthGuard>
      {/* Main container for the entire page layout */}
      <div className={styles.pageContainer}>
        {/* Holds the video feeds and the control buttons */}
        <div className={styles.videoAndButtonContainer}>
          <div className={styles.videoContainer}>
            {/* Camera Error Notification */}
            
            {/* User Webcam */}
            {/* This displays the live video coming from the user's camera */}
            <div className={styles.videoBox}>
              <VideoRecorder
                startInterview={handleStartInterview}
                stopInterview={handleStopInterview}
                setCameraError={setCameraError}
              />
            </div>
            
            {/* AI Interviewer */}
            {/* After receiving a sessionToken, this handles starting and stopping the session. */}
            <div className={styles.videoBox}>
              <InteractiveAvatar
                sessionToken={token}
              />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
