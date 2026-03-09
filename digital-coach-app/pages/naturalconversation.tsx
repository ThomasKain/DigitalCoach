import { useState, useEffect, useRef } from "react";
import Transcript from "@App/components/organisms/Transcript";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { uploadAnswerVideo } from "@App/lib/storage/StorageService";
import { v4 as uuidv4 } from "uuid";
// import styles from "@App/styles/NaturalConversationPage.module.scss";
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";

import InteractiveAvatar from "@App/components/organisms/InteractiveAvatar";
import VideoRecorder from "@App/components/video";
import { useRouter } from "next/router";
import { CircleAlert } from "lucide-react";
import { MAX_SESSION_TIME } from "@App/components/video";
import { useAuth } from "@App/lib/auth/AuthContextProvider";
import Spinner from "@App/components/atoms/Spinner";

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
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(MAX_SESSION_TIME);
  const [cameraError, setCameraError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
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
    console.log("Requesting Interview Session...");
    setIsLoading(true);
    setLoadingMessage("Requesting Interview Session...");
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
    } finally {
        setIsLoading(false);
    }
  };

  /**
   * Handle creating a new interview document within the user's collection of interviews using the interview's data like its duration.
   */
  const handleStopInterview = async (duration: string, timeStarted: string) => {
    const newInterview = {
      id: uuidv4(), // create intreview id
      date: new Date().toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric"
      }), // MM/DD/YYYY
      timeStarted, // HH:MM AM/PM
      duration, // MMm SSs
      // these values will be populated later by the backend once the interview has been processed
      feedback: undefined,
      metrics: undefined,
      transcript: undefined,
      url: undefined,
    }

    const req = {
      userId: user!.uid,
      interview: newInterview,
    }
    // submit new interview to backend
    setIsLoading(true);
    setLoadingMessage("Submitting Interview Session...");
    console.log("Submitting Interview Session...")
    const host = typeof window !== "undefined" ? "localhost:8000" : "api"; // if we're in the browser use localhost, but if we're in Docker, use the backend's service name (currently 'api')
    console.log(`Using ${host} for the host.`);
    const response = await fetch(`http://${host}/api/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify(req),
    });
    if (!response.ok) {
      const errData = await response.json();
      alert(`Error creating interview: ${JSON.stringify(errData)}`);
      setIsLoading(false);
      return;
    }
    setIsLoading(false); // turn submission loading screen off before we get to the loading screen for route changes
    // reroute user to interview's webpage
    router.push(`/interviews/${newInterview.id}`);
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
  

  /**
     * Format time remaining into MM:SS
     * @param seconds Duration in seconds.
     */
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0"); 
        return `${mins}:${secs}`;
    }

  return (
    // AuthGuard ensures that only logged-in users can view this page.
    // If a user isn't logged in, they are typically redirected away.
    <AuthGuard>
      {/* Main container for the entire page layout */}
      <div className={styles.pageContainer}>
        {/* Holds the video feeds and the control buttons */}
        <div className={styles.videoAndButtonContainer}>
          {isLoading && (
            <Spinner message={loadingMessage} />
          )}
          <div style={{ display: isLoading ? "none" : "block", width: "100%" }}>
              {/* Camera Error Notification */}
              {cameraError && (
                  <div className={styles.cameraErr}>
                      <CircleAlert/>
                      <p>{cameraError}</p> 
                  </div>
              )}
              <p className={`${styles.timerDisplay} ${timeLeft < 20 ? styles.timerWarning : ""}`}>
                Timer: {formatTimer(timeLeft)}
              </p>

            {/* Video Grid */}
            <div className={styles.videoContainer}>
              {/* User Webcam */}
              {/* This displays the live video coming from the user's camera */}
              <div className={styles.videoBox}>
                <VideoRecorder
                  startInterview={handleStartInterview}
                  stopInterview={handleStopInterview}
                  timeLeft={timeLeft}
                  setTimeLeft={setTimeLeft}
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
      </div>
    </AuthGuard>
  );
}
