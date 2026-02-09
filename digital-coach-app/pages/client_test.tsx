/**
 * Tests client-side write/read operations with Firebase Firestore. Access with localhost:3000/test
 */
"use client";
import { db } from "../lib/firebase/firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState  } from "react";

export default function TestPage() {
    const [logs, setLogs] = useState<string[]>([]); // logs will store an array of strings

    // helper function to add a new log to logs
    const addLog = (message: string) => {
        setLogs((prev) => [...prev, message]);
        console.log(message);
    };

    useEffect(() => {
        const runTest = async () => {
            try {
                if (!db) {
                    throw new Error("Database not initialized check firebase.config.ts");
                }

                const testDocRef = doc(db, "users", "client_test_user"); // get a reference to a document in collection "users" with id "test_user"
                const testData = {
                    "name": "Emma Frost",
                    "age": 25,
                    "email": "emmafrost@gmail.com",
                    "interviews": [
                        {
                        "date": "02/09/26",
                        "duration": "03:30",
                        "feedback": {
                            "ai_feedback": "Your enthusiasm was evident, and you established a great rapport early on. You used the STAR method effectively for behavioral questions, but your technical answers were slightly vague. Next time, focus more on specific metrics to quantify your past achievements, and try to pause briefly before answering complex questions to gather your thoughts.",
                            "overall_competency": {
                                "clarity": {
                                    "score": 8,
                                    "summary": "Excellent pacing at 150 WPM; your delivery was very clear and easy to follow."
                                },
                                "confidence": {
                                    "score": 10,
                                    "summary": "You had approximately 10 filler words or hedge phrases per minute, but you projected strong confidence throughout your interview!"
                                },
                                "engagement": {
                                    "score": 9,
                                    "summary": "Great job varying your tone with 98% of your responses being expressive! You used 10 high-value keywords effectively in your responses."
                                },
                            }
                        }, // end of feedback
                        "metrics": {
                            "filler_count": 10,
                            "overall_score": 100,
                            "wpm": 150
                        }, // end of metrics
                        "title": "Interview_1",
                        "transcript": [
                            {
                                "speaker": "Recruiter",
                                "response": "Hello are you ready to start your interview?"
                            },
                            {
                                "speaker": "Maeve Reaper",
                                "response": "Yes, I'm ready."
                            },
                        ], // end of transcript
                        "url": "http://interviewVideo.com",
                        }
                    ], // end of interviews
                }

                addLog("1. Writing data to Firestore...");
                await setDoc(testDocRef, testData); // modify data of document at that address (creates one if it doesn't exist)
                addLog("Write Successful!");

                // Read document data
                addLog("2. Reading data back from Firestore...");
                const docSnap = await getDoc(testDocRef);                if (docSnap.exists()) {
                    addLog("Read successful.");
                    addLog(`Data received: ${JSON.stringify(docSnap.data())}`);
                } else {
                    addLog("Document not found on server.");
                }
            } catch (error: any) {
                addLog(`CRITICAL ERROR:, ${error.message}`);
            }
        };
        runTest();
    }, []); // Empty array means this runs once the page loads
    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">Firestore Connection Test</h1>
            <div className="bg-gray-900 text-green-400 p-6 rounded shadow-lg min-h-[300px]">
                {logs.map((log, index) => (
                <div key={index} className="mb-2 border-b border-gray-800 pb-1">
                    {log}
                </div>
            ))}
            </div>
        </div>
    );
}

