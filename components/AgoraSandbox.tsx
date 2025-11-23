"use client";

import React, { useEffect, useRef, useState } from "react";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";

// --- PASTE YOUR CREDENTIALS HERE ---
// Ensure these match your .env and the token you generated!
const APP_ID = "YOUR_AGORA_APP_ID"; 
const TOKEN = "YOUR_NEW_WILDCARD_TOKEN";
const CHANNEL = "test_channel";
const UID = 0;
// -----------------------------------

export default function AgoraSandbox() {
  const [joined, setJoined] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState<any[]>([]);
  
  // Initialize client INSIDE the component or use a ref to prevent SSR issues
  const client = useRef<IAgoraRTCClient | null>(null);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const localTracks = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);

  useEffect(() => {
    // Initialize the client only on the client-side
    client.current = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    // Cleanup on unmount
    return () => {
        if (joined) {
            leaveCall();
        }
    };
  }, []);

  const joinCall = async () => {
    if (!client.current) return;
    
    try {
      console.log("Joining...");
      // 1. Join
      await client.current.join(APP_ID, CHANNEL, TOKEN, UID);
      setJoined(true);

      // 2. Create Tracks
      const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracks.current = [mic, cam];

      // 3. Play Local
      if (localVideoRef.current) {
        cam.play(localVideoRef.current);
      }

      // 4. Publish
      await client.current.publish([mic, cam]);
      console.log("✅ Successfully joined and published!");

    } catch (error) {
      console.error("❌ Failed to join:", error);
      alert(`Error: ${error}`);
    }
  };

  const leaveCall = async () => {
    if (localTracks.current) {
      localTracks.current[0].stop();
      localTracks.current[0].close();
      localTracks.current[1].stop();
      localTracks.current[1].close();
      localTracks.current = null;
    }
    if (client.current) {
        await client.current.leave();
    }
    setJoined(false);
    setRemoteUsers([]);
  };

  useEffect(() => {
    if (!client.current) return;

    const agoraClient = client.current;

    const handleUserPublished = async (user: any, mediaType: "audio" | "video") => {
      await agoraClient.subscribe(user, mediaType);
      if (mediaType === "video") {
        setRemoteUsers((prev) => [...prev, user]);
      }
      if (mediaType === "audio") {
        user.audioTrack?.play();
      }
    };

    const handleUserUnpublished = (user: any) => {
      setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
    };

    agoraClient.on("user-published", handleUserPublished);
    agoraClient.on("user-unpublished", handleUserUnpublished);

    return () => {
      agoraClient.off("user-published", handleUserPublished);
      agoraClient.off("user-unpublished", handleUserUnpublished);
    };
  }, [client.current]); // Re-run if client initializes

  return (
    <div className="flex flex-col items-center gap-6 p-10 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl font-bold">Step 3: Frontend Integration Test</h1>
      
      <div className="flex gap-4">
        {!joined ? (
          <button onClick={joinCall} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold transition">
            Join Call
          </button>
        ) : (
          <button onClick={leaveCall} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-bold transition">
            Leave Call
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-6 w-full">
        {/* Local Video */}
        <div className="relative border-4 border-blue-500 w-[400px] h-[300px] bg-black rounded-lg overflow-hidden">
          <p className="absolute top-2 left-2 bg-blue-600 px-2 py-1 text-xs rounded z-10">Local (You)</p>
          <div ref={localVideoRef} className="w-full h-full" />
        </div>

        {/* Remote Videos */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative border-4 border-green-500 w-[400px] h-[300px] bg-black rounded-lg overflow-hidden">
             <p className="absolute top-2 left-2 bg-green-600 px-2 py-1 text-xs rounded z-10">Remote User: {user.uid}</p>
             <div 
               ref={(ref) => { if (ref) user.videoTrack?.play(ref); }} 
               className="w-full h-full" 
             />
          </div>
        ))}
      </div>
    </div>
  );
}