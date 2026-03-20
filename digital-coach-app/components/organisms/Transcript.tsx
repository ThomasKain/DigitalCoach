import styles from "./Transcript.module.scss";
import { Readable } from "stream";
import { AssemblyAI } from "assemblyai";
import { useEffect, useState, useRef } from "react";
// import RecordRTC 


export default function Transcript() {
  const [assemblyToken, setAssemblyToken] = useState(""); // AssemblyAI authentication token
  const socketRef = useRef(null);
  const recorderRef = useRef(null);
  const [isRecording, setRecording] = useState(false);
  
  const host = typeof window !== "undefined" ? "localhost:8000" : "api"; // if we're in the browser use localhost, but if we're in Docker, use the backend's service name (currently 'api')
  const ENDPOINT = "wss://streaming.assemblyai.com/v3/ws"; // websocket to AssemblyAI's speech-to-text 
  // request assemblyai token
  /**
   * Request temporary AssemblyAI authentication token from our server.
   */
  const requestToken = async () => {
    try {
      const response = await fetch(`http://${host}/api/assemblyai/token`, {
        method: "GET",
      });
      const data = await response.json();
      if (response.ok) {
        console.log("AssemblyAI token request successful.");
        setAssemblyToken(data.token);
      } else {
        throw `Error: ${response.statusText || "Something went wrong"}`;
      }
    } catch (error) {
      console.error(`Error requesting AssemblyAI token: ${error}`);
    }
  }


  const startTranscription = async () => {
    
  }

  useEffect(() => {
    requestToken();
    
  }, []);

  return (
    <>
    </>
    // <section
    //   className={classNames(
    //     multiline ? styles.CardMulti : styles.Card,
    //     className
    //   )}
    //   style={{ height: height }}
    //   {...rest}
    // >
    //   {title && <p className={styles.Cardtitle}>{title}</p>}
    //   {props.children}
    // </section>
  );
}
