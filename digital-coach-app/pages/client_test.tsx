/**
 * Used to test client-side write/read operations with Firebase Firestore. Access with localhost:3000/test
 */
"use client";
import { db } from "../lib/firebase/firebase.config";
import { doc, getDoc, setDoc, getDocFromServer } from "firebase/firestore";
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

                const testDocRef = doc(db, "users", "test_user"); // get a reference to a document in collection "users" with id "test_user"
                const testData = {
                    name: "Emma Frost",
                    age: 24,
                    email: "emmafrost@gmail.com",
                    createdAt: new Date().toISOString(),
                };

                addLog("1. Writing data to Firestore...");
                await setDoc(testDocRef, testData); // modify data of document at that address (creates one if it doesn't exist)
                addLog("Write Successful!");

                // Read document data
                addLog("2. Reading data back from Firestore...");
                // const docSnap = await getDoc(testDocRef);
                const docSnap = await getDocFromServer(testDocRef);
                if (docSnap.exists()) {
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

