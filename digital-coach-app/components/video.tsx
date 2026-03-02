import React, { useRef, useState, useEffect } from "react";
// import styles from "@App/styles/NaturalConversationPage.module.scss";
import { Video, VideoOff, Mic, MicOff, Play } from "lucide-react"; 
import styles from "@App/styles/interview/naturalconversation.module.css";


// Define the shape of this components props
interface VideoRecorderProps {
    startInterview: () => Promise<void>;
    stopInterview: () => Promise<void>;
    setCameraError: (err: string) => void;
}

/**
 * Handles recording the user's camera and audio.
 */
function VideoRecorder({startInterview, stopInterview, setCameraError}: VideoRecorderProps) {
    const videoRef = useRef<HTMLVideoElement>(null); // video element for user camera
    const mediaRecorderRef = useRef<MediaRecorder>(null); // stores the media recorder instance
    const [isRecording, setIsRecording] = useState(false); // keep track of recording state
    const [stream, setStream] = useState<MediaStream>(); // stores user's camera stream
    const streamRef = useRef<MediaStream>(null);
    const [videoURL, setVideoURL] = useState<string>();
    const chunks = useRef<Blob[]>([]); // stores video as an array of chunks
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    let isMounted = useRef(false);

    useEffect(() => {
        startPreview();
        isMounted.current = true;
        return () => {
            // stop recording user camera and mic when component unmounts
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
                console.log("Turning off user camera...");
            }
            isMounted.current = false;
        }   
    }, []);


    /**
     * Starts recording user's camera.
     * @returns Video download URL
     */
    const startRecording = async () => {
        if (!stream) {
            await startPreview();
            return;
        }

        // create media recorder to record user's camera
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunks.current = []; // reset old data in chunks array
        
        // once there's data available, add it to the chunks array
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.current.push(event.data);
            }
        }

        // once the recorder stops, create download url
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks.current, {
                type: "video/webm;codecs=vp8,opus" 
            });
            const url = URL.createObjectURL(blob);
            setVideoURL(url); // store video download url
        }

        mediaRecorder.start(); // start recording
        setIsRecording(true); // recording has started

        // invoke callback from parent component (expected to start HeyGen Session)
        await startInterview();
    }

    /**
     * Stop recording user camera.
     */
    const stopRecording = async () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        // invoke callback from parent component (expected to stop HeyGen session and save interview)
        await stopInterview();
    }
    
    /**
     * Preview user's camera video.
     */
    const startPreview = async () => {
        try {
            // request access to user's camera and microphone
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            // if the user left webpage before giving permission, turn off camera
            if (!isMounted.current) {
                mediaStream.getTracks().forEach((track) => track.stop());
                console.log("Turning off user camera...");

            }
            streamRef.current = mediaStream;
            setStream(mediaStream); // store mediate stream
            // assign stream to video to show live preview
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (e) {
            let err = "Camera access denied. You can continue without camera.";
            if (e instanceof Error) {
                // user blocked access
                if (e.name === "NotAllowedError") {
                err = "Camera permission denied. Please allow camera access in your browser settings, or continue without video.";  
                } 
                // cant find camera
                else if (e.name === "NotFoundError") {
                err = "No camera found. You can continue the interview without video.";
                } 
                // camera is used by another app like Zoom
                else if (e.name === "NotReadableError") {
                err = "Camera is already being used by another application.";
                }
            } else {
                err = `Unknown error: ${String(e)}.`;
            }

            setCameraError(err);
            setVideoEnabled(false);
        }
    }


    return (
        <>
        <div className="video-card">
            <div className="video-header user-header">
                <p>Your Camera</p>
                {/* Toggle video camera */}
                <div className={styles.controls}>
                    <button
                        onClick={() => setVideoEnabled(!videoEnabled)}
                        className={videoEnabled ? styles.enabled : styles.disabled}
                    >
                        {videoEnabled ? (
                            <Video />
                        ) : (
                            <VideoOff />
                        )}
                    </button>
                    {/* Toggle microphone */}
                    <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={audioEnabled ? "enabled" : "disabled" }
                    >
                        { audioEnabled ? (
                            <Mic />
                        ): (
                            <MicOff />
                        )}
                    </button>
                </div>
            </div>
            
            <div className="video-content user-camera">
                {/* User Camera Video */}
                {videoEnabled ? (
                    <video 
                        ref={videoRef}
                        autoPlay
                        muted
                    />
                ) : (
                    <div className="camera-off">
                        <VideoOff/>
                        <p>Camera is off</p>
                    </div>
                )}
            </div>
        </div>

        {/* Start/Stop Buttons */}
        {!isRecording ? 
            <button 
                className={styles['start-button']}
                onClick={startRecording}
            >
                Start Recording
            </button>:
            <button 
                className="start-button"
                onClick={stopRecording}
            >
                Stop Recording
            </button>}
           
            {/* If the video download URL is ready, store it in Firebase for preview later */}
            {videoURL 
            ? <a href={videoURL} download="user-interview.webm" className="start-button">Download Video</a> : <a href=""></a>}
        </>

    )
}

export default VideoRecorder;