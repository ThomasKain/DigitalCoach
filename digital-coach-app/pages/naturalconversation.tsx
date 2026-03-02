import { useState, useEffect, useRef } from "react";
import Transcript from "@App/components/organisms/Transcript";
import AuthGuard from "@App/lib/auth/AuthGuard";
import { useReactMediaRecorder } from "react-media-recorder";
import { uploadAnswerVideo } from "@App/lib/storage/StorageService";
import { v4 as uuidv4 } from "uuid";
import styles from "@App/styles/NaturalConversationPage.module.scss";
import axios from "axios";
import InteractiveAvatar from "@App/components/organisms/InteractiveAvatar"; // deprecated: HeyGen has switched to LiveAvatar
import { useRouter } from "next/router";
import VideoRecorder from "@App/components/video";
import { LiveAvatarSession } from "@heygen/liveavatar-web-sdk";


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
  const avatarRef = useRef<{
    startSession: () => void;
    endSession: () => void;
    handleInterrupt: () => void;
  } | null>(null);

  const [wasRecording, setWasRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const [cameraError, setCameraError] = useState<string | null>(null);

  
  const { startRecording, stopRecording, mediaBlobUrl, previewStream } =
    useReactMediaRecorder({ video: true });

  // Callback to add a new user message.
  const handleUserTranscript = (userTranscript: string) => {
    const newMessage: Message = {
      role: "user",
      text: userTranscript,
      timestamp: formatTimestamp(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // Callback to add a new interviewer (HeyGen API) message.
  const handleInterviewerTranscript = (interviewerTranscript: string) => {
    const newMessage: Message = {
      role: "interviewer",
      text: interviewerTranscript,
      timestamp: formatTimestamp(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  /**
   * 
   */
  const handleStartInterview = async () => {
    // request heygen session token
    


    // if (wasRecording) {
    //   stopRecording();
    //   await avatarRef.current?.endSession();
    //   setWasRecording(false);
    // } else {
    //   setWasRecording(true);
    //   await avatarRef.current?.startSession();
    //   startRecording();
    // }
  };

  const handleStopInterview = async () => {
    
  }

  const handleInterruptAvatar = async () => {
    await avatarRef.current?.handleInterrupt();
  };

  const waitForJobResult = async (
    jobId: string,
    retries = 10,
    delay = 3000
  ) => {
    for (let i = 0; i < retries; i++) {
      const statusRes = await axios.get(
        `http://localhost:8000/api/create_answer/${jobId}`
      );

      if (statusRes.data.status === "completed") {
        return axios.get(
          `http://localhost:8000/api/create_answer/${jobId}/result`
        );
      }

      await new Promise((res) => setTimeout(res, delay));
    }
    throw new Error("Job did not complete in time.");
  };

  // Optional: This function is still available if you need to manually fetch a response.
  const getResponse = async () => {
    try {
      const getFile = async () => {
        const url = mediaBlobUrl || "/output.mp4";
        let blob = await fetch(url).then((res) => res.blob());
        return new File([blob], "video.mp4");
      };
      const file = await getFile();

      const dlURL = await uploadAnswerVideo(file, uuidv4());
      console.log("Video Uploaded to:", dlURL);
      
      // const url = (await uploadAnswerVideo(
      //   file,
      //   uuidv4()
      // )) as any;
      // const dlURL = await StorageService.getDownloadUrlFromVideoUrlRef(
      //   "gs://" + url.ref._location.bucket + "/" + url.ref._location.path
      // );
      // console.log(dlURL);

      const sentResponse = await axios.post(
        "http://localhost:8000/api/create_answer/",
        {
          video_url: dlURL,
        }
      );
      const jobId = sentResponse.data.job_id;

      const jobIdResponse = await waitForJobResult(jobId);

      console.log(jobIdResponse);
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while processing the recording.");
    }
  };

  // useEffect(() => {
  //   if (videoRef.current) {
  //     videoRef.current.srcObject = previewStream || null;
  //   }
  // }, [previewStream]);

  // DELETE: TESTING ONLY: IMMEDIATELY STARTS AN INTERVIEW SESSION WITH HEYGEN LIVEAVATAR
  // const router = useRouter();
  // useEffect(() => {
  //     const startInterview = async () => {
  //       // Request interview session
  //       const interviewConfig = {
  //         "avatar_id": "dd73ea75-1218-4ef3-92ce-606d5f7fbc0a",
  //         "voice_id": "c2527536-6d1f-4412-a643-53a3497dada9",
  //         "context_id": "595268c3-a4cf-499d-bf85-efd006fe8a47",
  //         "is_sandbox": true
  //       };
  //       console.log("Requesting Interview Session...")

  //       try {
  //       const response = await fetch('http://localhost:8000/api/heygen/start', {
  //         method: "POST",
  //         headers: {
  //           "Content-type": "application/json",
  //         },
  //         body: JSON.stringify(interviewConfig)
  //       });
  //       const data = await response.json();
  //       if (response.ok) {
  //         console.log("Interview request sent successfully!");
  //         router.push(data.session_url); // Go to interview
  //       } else {
  //         console.error(`Error: ${response.statusText || "Something went wrong"}`);
  //       }
  //       } catch (error) {
  //         console.error(`Submission error: ${error}`);
          
  //       }

  //     };
  //     startInterview();
  // }, []);

  return (
    // AuthGuard ensures that only logged-in users can view this page.
    // If a user isn't logged in, they are typically redirected away.
    <AuthGuard>
      {/* Main container for the entire page layout */}
      <div className={styles.pageContainer}>
        {/* LEFT/MAIN SECTION: Holds the video feeds and the control buttons */}
        <div className={styles.videoAndButtonContainer}>
          <div className={styles.videoContainer}>
            {/* Camera Error Notification */}



            <div className={styles.videoBox}>
              {/* 1. THE USER'S WEBCAM FEED */}
              {/* This displays the live video coming from the user's camera */}
              <VideoRecorder
                startInterview={handleStartInterview}
                stopInterview={handleStopInterview}
                setCameraError={setCameraError}
              />

              {/* 2. THE AI AVATAR (INTERVIEWER) */}
              {/* This component handles the HeyGen streaming avatar. 
                  We pass it the ref so we can trigger start/stop from the parent, 
                  and the callbacks so it can send transcript data back up to the page. */}
              {/* <InteractiveAvatar
                ref={avatarRef}
                onTranscriptChange={handleUserTranscript}
                onInterviewerTranscriptChange={handleInterviewerTranscript}
              /> */}
                  <InteractiveAvatar/>


              {/* 3. INTERVIEW CONTROLS */}
              {/* These buttons allow the user to manage the interview state */}
              <div className={styles.buttonBox}>
                
                {/* Toggles the recording and the avatar's session on or off */}
                <button
                  className={styles.recordButton}
                  onClick={handleStartInterview}
                >
                  {wasRecording ? "Stop Interview" : "Start Interview"}
                </button>
                
                {/* Forces the AI avatar to stop speaking (useful if it's talking too much) */}
                <button
                  className={styles.saveButton}
                  onClick={handleInterruptAvatar}
                >
                  Interrupt Task
                </button>

                {/* Submits the recorded video to the backend server for AI analysis */}
                <button className={styles.saveButton} onClick={getResponse}>
                  GetResponse
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT/SIDE SECTION: The Live Transcript */}
        {/* Displays a real-time text log of the conversation */}
        <div className={styles.transcriptContainer}>
          <Transcript title="Transcript">
            {messages.length > 0 ? (
              // Loop through the 'messages' array and render each one
              messages.map((message, index) => (
                <div key={index}>
                  <p>
                    {/* Render the timestamp and identify who is speaking (User or Interviewer) */}
                    <strong>
                      [{message.timestamp}]{" "}
                      {message.role === "user" ? "User:" : "Interviewer:"}
                    </strong>
                  </p>
                  {/* Render the actual text that was spoken */}
                  <p>{message.text}</p>
                </div>
              ))
            ) : (
              // Fallback message before anyone has started speaking
              <p>No transcript available.</p>
            )}
          </Transcript>
        </div>

      </div>
    </AuthGuard>
  );
}
