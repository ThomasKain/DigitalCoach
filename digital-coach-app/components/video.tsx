import React, { useRef, useState, useEffect } from "react";
// import styles from "@App/styles/NaturalConversationPage.module.scss";
import { Video, VideoOff, Mic, MicOff, Play } from "lucide-react"; 
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";


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
     * Toggles the user's video camera. Note that its pausing the camera recording and not completely turning it off so the video recording doesn't get disabled preemptively.
     */
    const toggleVideo = () => {
        const newState = !videoEnabled;
        setVideoEnabled(newState);
        // disable video track (this will not turn off the camera, but it will stop transmitting the camera feed from rendering, we need this so the entire video can be recorded)
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = newState;
            });
        }
    }

    /**
     * Toggles the user's microphone.
     */
    const toggleAudio = () => {
        const newState = !audioEnabled;
        setAudioEnabled(newState);
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = newState;
            });
        }
    }

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
        mediaRecorderRef.current?.stop(); // stop recording user camera
        setIsRecording(false);
        console.log("Turning off camera and mic...");
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
                console.log("Component unmounted before camera loaded. Aborting...");
                mediaStream.getTracks().forEach((track) => track.stop());
                console.log("Turning off user camera...");
                return; 
            }
            streamRef.current = mediaStream;
            setStream(mediaStream); // store media stream
            // assign stream to video to show live preview
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            // enable video and audio once user has agreed 
            setVideoEnabled(true);
            setAudioEnabled(true);
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
        <div className={styles.videoCard}>
            <div className={`${styles.videoHeader} ${styles.userHeader}`}>
                <p>Your Camera</p>
                {/* Toggle video camera */}
                <div className={styles.controls}>
                    <button
                        onClick={toggleVideo}
                        className={videoEnabled ? styles.enabled : styles.disabled}
                        disabled={stream ? false : true} // wait until video is ready before enabling toggling
                    >
                        {videoEnabled ? (
                            <Video />
                        ) : (
                            <VideoOff />
                        )}
                    </button>
                    {/* Toggle microphone */}
                    <button
                        onClick={toggleAudio}
                        className={audioEnabled ? styles.enabled : styles.disabled }
                        disabled={stream ? false : true} // wait until video is ready before enabling toggling
                    >
                        { audioEnabled ? (
                            <Mic />
                        ): (
                            <MicOff />
                        )}
                    </button>
                </div>
            </div>
            
            <div className={`${styles.videoContent} ${styles.userCamera}`}>
                {/* User Camera Video */}
                <video 
                        ref={videoRef}
                        autoPlay
                        muted
                        style={{display: videoEnabled ? "block" : "none"}}
                    />
                    {!videoEnabled && (
                        <div className={styles.cameraOff}>
                            <VideoOff/>
                            <p>Camera is off</p>
                        </div>
                    )}
            </div>
        </div>

        {/* Start/Stop Buttons */}
        <div className={styles.buttonBox}>
            
            {!isRecording ? 
                <button 
                    className={`${styles.startButton} ${styles}`}
                    onClick={startRecording}
                >
                    Start Recording
                </button>:
                <button 
                    className={styles.startButton}
                    onClick={stopRecording}
                >
                    Stop Recording
                </button>}
           
            {/* If the video download URL is ready, store it in Firebase for preview later */}
            {videoURL 
            ? <a href={videoURL} download="user-interview.webm" className={styles.startButton}>Download Video</a> : <a href=""></a>}
        </div>
        </>

    )
}

export default VideoRecorder;