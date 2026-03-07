import React, { useRef, useState, useEffect } from "react";
// import styles from "@App/styles/NaturalConversationPage.module.scss";
import { Video, VideoOff, Mic, MicOff, CircleAlert, Play } from "lucide-react"; 
import styles from "@App/styles/interview/NaturalConversationPage.module.scss";


// Define the shape of this components props
interface VideoRecorderProps {
    startInterview: () => Promise<void>;
    stopInterview: (duration: string, timeStarted: string) => Promise<void>;
}

const MAX_SESSION_TIME = 1 * 60; // sandbox mode for HeyGen LiveAvatar only lasts for 1 minute  
const MIN_SESSION_DURATION = 20; // minimum duration for an interview for it to be counted

/**
 * Handles recording the user's camera and audio.
 */
function VideoRecorder({startInterview, stopInterview}: VideoRecorderProps) {
    const [isRecording, setIsRecording] = useState(false); // keep track of recording state
    const [timeLeft, setTimeLeft] = useState(MAX_SESSION_TIME); 
    const [stream, setStream] = useState<MediaStream>(); // stores user's camera stream
    const [videoURL, setVideoURL] = useState<string>(); // download URL for user's side of the interview
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [cameraError, setCameraError] = useState("");

    const videoRef = useRef<HTMLVideoElement>(null); // reference to video element 
    const mediaRecorderRef = useRef<MediaRecorder>(null); // reference to media recorder recording user's video/audio
    const streamRef = useRef<MediaStream>(null); // reference to user's video and/or audio streams
    const chunksRef = useRef<Blob[]>([]); // stores video as an array of chunks
    let isMounted = useRef(false);
    let timeStartedRef = useRef("");

    // session terminates automatically when timer runs out
    useEffect(() => {
        let timer: NodeJS.Timeout; 
        // decrement timer if interview is still going
        if (isRecording && timeLeft > 0) {
            // decrement every second
            timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000); 
        }
        // time is up, stop recording
        else if (isRecording && timeLeft === 0) {
            stopRecording();
        }

        // stop timer
        return () => clearInterval(timer);
        

    }, [isRecording, timeLeft]);

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
     * Sets up the media recorder and starts recording user's camera and microphone.
     * @returns Video download URL
     */
    const startRecording = async () => {
        // start preview in case media stream isn't set up yet 
        if (!stream) {
            await startPreview();
            return;
        }

        // create media recorder to record user's camera/audio
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = []; // reset old data in chunks array
        
        // register event listener for when there's data available 
        // add data to the chunks array
        mediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        // register event listener when recording stops
        // once the recorder stops, create download URL for user's side of the interview
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, {
                type: "video/webm",
            });
            const url = URL.createObjectURL(blob);
            setVideoURL(url); // set download URL for video 
        };

        mediaRecorder.start(); // start recording user's camera and microphone
        setIsRecording(true); // recording has started
        // save time when started
        timeStartedRef.current = new Date().toLocaleDateString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
        setTimeLeft(MAX_SESSION_TIME); // restart timer
        setVideoURL(""); // clear out old recording url 
        

        // invoke callback from parent component (expected to start HeyGen Session)
        await startInterview();
    }

    /**
     * Stop recording user camera.
     */
    const stopRecording = async () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current?.stop(); // stop recording user camera
            
            // turn of camer and microphone
            console.log("Turning off camera and mic...");
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            setIsRecording(false);
            
            
            // check if interview was too short to be counted
            const duration = MAX_SESSION_TIME - timeLeft; 
            if (duration < MIN_SESSION_DURATION) {
                alert(`Interview must be at least ${MIN_SESSION_DURATION}s long to be counted.`);
                // restart interview
                window.location.href = "/naturalconversation";
            } 

            // invoke callback from parent component (expected to stop HeyGen session and save interview)
            await stopInterview(formatDuration(duration), timeStartedRef.current);
        }
    }
    
    /**
     * Format time remaining into MM:SS
     * @param seconds Duration in seconds.
     */
    const formatTimer = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0"); 
        return `${mins}:${secs}`;
    }

    /**
     * Format duration into MMm SSs not 0-padded
     * @param seconds 
     */
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString();
        const secs = (seconds % 60).toString();
        return `${mins}m ${secs}s`;
    }

    /**
     * Requests user's video/audio and handles the preview of user's camera video.
     */
    const startPreview = async () => {
        try {
            // request access to user's camera and microphone
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            // if the user left webpage before giving permission, turn of camera and microphone
            if (!isMounted.current) {
                console.log("Component unmounted before camera loaded. Aborting...");
                mediaStream.getTracks().forEach((track) => track.stop());
                console.log("Turning off user camera...");
                return; 
            }
            streamRef.current = mediaStream; // save media stream reference
            setStream(mediaStream); // store media stream
            // attach camera stream to video element to show live preview
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            // enable video and audio once user has agreed 
            setVideoEnabled(true);
            setAudioEnabled(true);
            
        } catch (error) {
            console.error(`Error accessing media device: ${error}`);
            alert("Please allow video and audio permissions to start. You may disable them before recording begins.");
            if (error instanceof Error) {
                setCameraError(error.message);
                setVideoEnabled(false);
            }

        }
    }


    return (
        <>
        {cameraError && (
            <div className={styles.cameraErr}>
                <CircleAlert/>
                <p>{cameraError}</p> 
            </div>
        )}
        <p className={`${styles.timerDisplay} ${timeLeft < 20 ? styles.timerWarning : ""}`}>Timer: {formatTimer(timeLeft)}</p>
        <div className={styles.videoCard}>
            <div className={`${styles.videoHeader} ${styles.userHeader}`}>
                <p>Your Camera</p>
                {/* Toggle video camera */}
                <div className={styles.controls}>
                    <button
                        onClick={toggleVideo}
                        className={videoEnabled ? styles.enabled : styles.disabled}
                        disabled={!stream} // wait until video is ready before enabling toggling
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
                        disabled={!stream} // wait until video is ready before enabling toggling
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
                    disabled={!stream}
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