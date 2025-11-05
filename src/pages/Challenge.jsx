import React, { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Clock,
  Code,
  Users,
  Copy,
  Check,
  Target,
  Play,
  Send,
  AlertCircle,
  Shield,
  Zap,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";

const ChallengePage = ({ userId }) => {
  const [roomId, setRoomId] = useState("");
  const [joinedRoom, setJoinedRoom] = useState(null);
  const [problem, setProblem] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [timer, setTimer] = useState(0);
  const [code, setCode] = useState("// Write your solution here...\n");
  const [language, setLanguage] = useState("cpp");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomState, setRoomState] = useState("idle");
  const [opponent, setOpponent] = useState(null);
  const [copied, setCopied] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const messagesEndRef = useRef(null);

  // Setup socket
  useEffect(() => {
    const s = io("http://localhost:3000/challenge", {
      auth: { userId },
      transports: ["websocket"],
      withCredentials: true,
    });
    setSocket(s);
    return () => s.disconnect();
  }, [userId]);

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("✅ Socket connected:", socket.id);
      addMessage("✅ Connected to challenge server", "system");
    };

    const handleError = (error) => {
      console.error("❌ Socket error:", error);
      addMessage(`❌ Connection error: ${error.message || error}`, "error");
    };

    const handleDisconnect = () => {
      console.log("🔌 Socket disconnected");
      addMessage("🔌 Disconnected from server", "warning");
    };

    const handleWaiting = ({
      problem: p,
      roomId: id,
      message,
      durationSec,
    }) => {
      console.log("🔔 Waiting event received:", {
        problem: p,
        roomId: id,
        message,
        durationSec,
      });
      setProblem(p);
      setJoinedRoom(id);
      setRoomState("waiting");
      addMessage(message, "info");

      // If durationSec is provided in waiting event, store it for later use
      if (durationSec) {
        setTimer(durationSec);
      }
    };

    const handleChallengeStart = ({ durationSec, message }) => {
      console.log("🚀 Challenge start event received:", {
        durationSec,
        message,
      });
      setTimer(durationSec);
      setRoomState("running");
      addMessage(message, "success");
    };

    const handleOpponentJoined = ({ opponentId, durationSec }) => {
      console.log("👥 Opponent joined event received:", {
        opponentId,
        durationSec,
      });
      setOpponent(opponentId);
      // Transition to running state when opponent joins
      if (durationSec) {
        setTimer(durationSec);
        setRoomState("running");
        addMessage("👥 Opponent joined. Challenge started!", "success");
      } else {
        addMessage("👥 Opponent joined. Challenge will start!", "success");
      }
    };

    const handleWinner = ({ winner }) => {
      addMessage(
        winner === userId
          ? "🏆 You won the challenge!"
          : "😢 Opponent won the challenge!",
        "success"
      );
      setRoomState("finished");
    };

    const handleUserLeft = () => {
      addMessage("🏃 Opponent left. You win by default!", "info");
      setRoomState("finished");
    };

    const handleRoomUpdate = (data) => {
      console.log("🔄 Room update received:", data);
      // Handle any room state updates
      if (data.state === "running" && roomState === "waiting") {
        setRoomState("running");
        if (data.durationSec) setTimer(data.durationSec);
        addMessage("⚡ Challenge started!", "success");
      }
    };

    socket.on("connect", handleConnect);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("waiting", handleWaiting);
    socket.on("challengeStart", handleChallengeStart);
    socket.on("challengeStarted", handleChallengeStart); // Also listen for "challengeStarted"
    socket.on("opponentJoined", handleOpponentJoined);
    socket.on("winner", handleWinner);
    socket.on("userLeft", handleUserLeft);
    socket.on("roomUpdate", handleRoomUpdate);

    // Catch-all listener for debugging and auto-handling
    socket.onAny((eventName, ...args) => {
      console.log(`🔔 Socket event received: ${eventName}`, args);

      // Auto-handle state transitions for creator who might miss specific events
      if (roomState === "waiting" && args[0]) {
        const eventData = args[0];
        // Check if event data indicates challenge has started (state is explicitly "running")
        if (eventData.state === "running" && eventData.durationSec) {
          console.log(
            "⚡ Auto-detecting challenge start from event:",
            eventName
          );
          setRoomState("running");
          setTimer(eventData.durationSec);
          addMessage("⚡ Challenge started!", "success");
        }
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("error", handleError);
      socket.off("disconnect", handleDisconnect);
      socket.off("waiting", handleWaiting);
      socket.off("challengeStart", handleChallengeStart);
      socket.off("challengeStarted", handleChallengeStart);
      socket.off("opponentJoined", handleOpponentJoined);
      socket.off("winner", handleWinner);
      socket.off("userLeft", handleUserLeft);
      socket.off("roomUpdate", handleRoomUpdate);
      socket.offAny();
    };
  }, [socket, userId, roomState]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  const checkRoomStatus = useCallback(
    async (roomIdToCheck) => {
      try {
        const res = await axiosClient.get(
          `/challenge/room/status/${roomIdToCheck}`
        );
        console.log("🔍 Room status check:", res.data);

        if (res.data.state === "running" && roomState === "waiting") {
          console.log("⚡ Room is running! Updating state...");
          setRoomState("running");
          if (res.data.durationSec) setTimer(res.data.durationSec);
          addMessage("⚡ Challenge started!", "success");
        }
      } catch (error) {
        // Silently fail - endpoint may not exist, socket events should handle state changes
        if (error.response?.status !== 404) {
          console.error("❌ Error checking room status:", error);
        }
      }
    },
    [roomState]
  );

  useEffect(() => {
    if (timer <= 0 || roomState !== "running") return;
    const interval = setInterval(() => {
      setTimer((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, roomState]);

  // Poll room status when waiting (backup mechanism if socket fails)
  useEffect(() => {
    if (roomState !== "waiting" || !joinedRoom) return;

    console.log("🔄 Starting room status polling for:", joinedRoom);

    // Only poll if the API endpoint exists, otherwise socket events should handle it
    const pollInterval = setInterval(() => {
      checkRoomStatus(joinedRoom);
    }, 3000); // Check every 3 seconds (reduced frequency)

    return () => {
      console.log("🛑 Stopping room status polling");
      clearInterval(pollInterval);
    };
  }, [roomState, joinedRoom, checkRoomStatus]);

  const addMessage = (text, type = "info") => {
    setMessages((prev) => [...prev, { text, type }]);
  };

  const createRoom = async () => {
    try {
      console.log("🎮 Creating room with socket ID:", socket.id);
      const res = await axiosClient.post("/challenge/create/room", {
        socketId: socket.id,
      });

      console.log("✅ Room created:", res.data);
      setRoomId(res.data.roomId);
      setProblem(res.data.problem);
      setJoinedRoom(res.data.roomId); // Set joinedRoom for creator
      addMessage("🎮 Room created! Share your room code.", "success");

      console.log("📤 Emitting joinAsCreator:", {
        roomId: res.data.roomId,
        userId,
      });
      socket.emit("joinAsCreator", { roomId: res.data.roomId, userId });
    } catch (error) {
      console.error("❌ Error creating room:", error);
      addMessage("❌ Error creating room", "error");
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return addMessage("⚠️ Enter room ID", "warning");
    try {
      console.log("🚪 Joining room:", roomId);
      const res = await axiosClient.post(`/challenge/join/room/${roomId}`);

      console.log("✅ Room joined:", res.data);
      setJoinedRoom(roomId);
      setProblem(res.data.problem);

      setTimer(res.data.durationSec);
      setRoomState("running"); // Set room state to running for opponent

      console.log("📤 Emitting joinRoom:", { roomId, userId });
      socket.emit("joinRoom", { roomId, userId });
      addMessage("✅ Joined challenge room!", "success");
    } catch (error) {
      console.error("❌ Error joining room:", error);
      addMessage("❌ Invalid room ID", "error");
    }
  };

  const runCode = async () => {
    if (!problem?._id) return addMessage("⚠️ Problem not loaded", "warning");
    setIsRunning(true);
    addMessage("🏃 Running code...", "info");
    try {
      const res = await axiosClient.post(`/submission/run/${problem._id}`, {
        code,
        language,
      });
      setTestResults(res.data);
    } catch {
      addMessage("❌ Error running code", "error");
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!problem?._id) return addMessage("⚠️ Problem not loaded", "warning");
    setIsSubmitting(true);
    addMessage("🚀 Submitting solution...", "info");
    try {
      const res = await axiosClient.post(`/submission/submit/${problem._id}`, {
        code,
        language,
      });
      setSubmissionResult(res.data);
      if (res.data.accepted)
        socket.emit("submitCode", {
          roomId: joinedRoom,
          userId,
          status: "accepted",
        });
    } catch {
      addMessage("❌ Error submitting code", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (sec) =>
    `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
      sec % 60
    ).padStart(2, "0")}`;

  const copyRoomId = () => {
    navigator.clipboard.writeText(joinedRoom);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-blue-600 flex items-center gap-2">
          <Target className="w-7 h-7 text-blue-500" /> CodeArena
        </h1>
        {roomState === "running" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="font-mono text-lg font-semibold text-blue-600">
                {formatTime(timer)}
              </span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Leave
            </button>
          </div>
        )}
      </header>

      {/* Main */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Problem + Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Problem */}
          {problem && (
            <div className="bg-white border rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-bold text-blue-700 mb-2">
                {problem.title}
              </h2>
              <p className="text-gray-600 mb-4">{problem.description}</p>
              {problem.visibleTestcase?.map((t, i) => (
                <div key={i} className="border p-3 rounded-lg mb-2 bg-gray-50">
                  <p className="text-sm text-gray-500">Input:</p>
                  <pre className="text-green-600">{t.input}</pre>
                  <p className="text-sm text-gray-500 mt-2">Output:</p>
                  <pre className="text-blue-600">{t.output}</pre>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          {problem && (
            <div className="bg-white border rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-500" /> Your Code
                </h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border rounded-lg px-3 py-1 text-sm"
                >
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-72 border rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-blue-300"
              ></textarea>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                >
                  {isRunning ? "Running..." : "Run Code"}
                </button>
                <button
                  onClick={submitCode}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Room + Messages */}
        <div className="space-y-6">
          {/* Room actions */}
          {roomState === "idle" && (
            <div className="bg-white border rounded-xl p-6 shadow-md">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2 text-blue-600">
                <Shield className="w-5 h-5" /> Enter Arena
              </h3>
              <button
                onClick={createRoom}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 mb-4"
              >
                Create New Room
              </button>
              <div className="flex items-center gap-2">
                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <button
                  onClick={joinRoom}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Join
                </button>
              </div>
            </div>
          )}

          {/* Waiting */}
          {roomState === "waiting" && (
            <div className="bg-white border rounded-xl p-6 text-center shadow-md">
              <p className="text-gray-600 mb-2">Waiting for opponent...</p>
              <div className="flex justify-center items-center gap-2">
                <code className="text-lg font-mono border px-3 py-2 rounded bg-gray-50">
                  {joinedRoom}
                </code>
                <button onClick={copyRoomId} className="text-blue-600">
                  {copied ? <Check /> : <Copy />}
                </button>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="bg-white border rounded-xl p-6 shadow-md h-80 overflow-y-auto">
            <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-700">
              <AlertCircle className="w-5 h-5 text-blue-500" /> Logs
            </h3>
            {messages.map((m, i) => (
              <p
                key={i}
                className={`text-sm mb-1 ${
                  m.type === "error" ? "text-red-500" : "text-gray-700"
                }`}
              >
                {m.text}
              </p>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
