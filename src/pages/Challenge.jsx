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
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-1/2 -left-40 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-40 right-1/3 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur-md opacity-30"></div>
              <div className="relative bg-gradient-to-br from-white to-gray-100 p-3 rounded-xl border border-purple-200 shadow-md">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                CodeArena
              </h1>
              <p className="text-xs text-gray-600 font-medium tracking-wider">
                1v1 CODING BATTLE
              </p>
            </div>
          </div>
          {roomState === "running" && (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse"></div>
                <div className="relative flex items-center gap-3 bg-gradient-to-br from-white to-gray-50 border border-cyan-300 px-6 py-4 rounded-2xl shadow-md">
                  <Clock className="w-6 h-6 text-cyan-600 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-600 font-medium">
                      TIME LEFT
                    </span>
                    <span className="font-mono text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent tabular-nums">
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="relative group overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Leave Arena
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left: Problem + Editor */}
        <div className="lg:col-span-2 space-y-8">
          {/* Problem */}
          {problem && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Code className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text">
                        {problem.title}
                      </h2>
                      <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-orange-400/20 to-red-400/20 border border-orange-400/40 text-orange-600 rounded-full">
                        {problem.difficulty || "MEDIUM"}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {problem.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h3 className="text-sm font-bold text-cyan-600 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-gradient-to-r from-cyan-500 to-transparent"></div>
                    Test Cases
                  </h3>
                  {problem.visibleTestcase?.map((t, i) => (
                    <div key={i} className="group/test relative">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl blur opacity-0 group-hover/test:opacity-100 transition duration-300"></div>
                      <div className="relative bg-gray-50/80 border border-gray-200 p-6 rounded-2xl hover:border-cyan-400/50 transition-all duration-300">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-100 to-blue-100 border border-cyan-400/40 rounded-lg flex items-center justify-center">
                            <span className="text-cyan-700 font-bold text-sm">
                              #{i + 1}
                            </span>
                          </div>
                          <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">
                            Test Case
                          </span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold text-green-700 uppercase tracking-wider">
                                Input
                              </span>
                            </div>
                            <pre className="text-green-800 font-mono text-sm bg-green-50 p-4 rounded-xl border border-green-300/40 overflow-x-auto">
                              {t.input}
                            </pre>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                Expected Output
                              </span>
                            </div>
                            <pre className="text-blue-800 font-mono text-sm bg-blue-50 p-4 rounded-xl border border-blue-300/40 overflow-x-auto">
                              {t.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Editor */}
          {problem && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-md">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                        Code Editor
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        Write your solution
                      </p>
                    </div>
                  </div>
                  <div className="relative group/select">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-30 group-hover/select:opacity-50 transition duration-300"></div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="relative bg-white border border-gray-300 text-gray-900 rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 cursor-pointer hover:border-cyan-500/50 appearance-none pr-10"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2306b6d4'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
                        backgroundSize: "1.25rem",
                      }}
                    >
                      <option value="cpp" className="bg-white">
                        C++
                      </option>
                      <option value="java" className="bg-white">
                        Java
                      </option>
                      <option value="python" className="bg-white">
                        Python
                      </option>
                      <option value="javascript" className="bg-white">
                        JavaScript
                      </option>
                    </select>
                  </div>
                </div>

                <div className="relative group/editor">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-0 group-focus-within/editor:opacity-100 transition duration-300"></div>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="relative w-full h-96 bg-gray-50/80 border border-gray-300 rounded-2xl p-6 font-mono text-sm text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 placeholder-gray-500 resize-none leading-relaxed"
                    placeholder="// Start coding your solution here..."
                    spellCheck="false"
                  ></textarea>
                </div>

                <div className="flex gap-5 mt-8">
                  <button
                    onClick={runCode}
                    disabled={isRunning}
                    className="group/run relative flex-1 overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-5 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isRunning ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Run Code</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-cyan-700 opacity-0 group-hover/run:opacity-100 transition-opacity duration-300"></div>
                  </button>
                  <button
                    onClick={submitCode}
                    disabled={isSubmitting}
                    className="group/submit relative flex-1 overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Solution</span>
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Room + Messages */}
        <div className="space-y-8">
          {/* Room actions */}
          {roomState === "idle" && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl p-8 shadow-md">
                <div className="flex items-center gap-3 mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur-lg animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-black text-2xl text-transparent bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text">
                      Battle Arena
                    </h3>
                    <p className="text-xs text-gray-600 font-medium">
                      Choose your destiny
                    </p>
                  </div>
                </div>

                <button
                  onClick={createRoom}
                  className="group/create relative w-full overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-5 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/40 mb-6"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 font-bold text-base">
                    <Zap className="w-5 h-5" />
                    <span>Create Battle Room</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-700 to-blue-700 opacity-0 group-hover/create:opacity-100 transition-opacity duration-300"></div>
                </button>

                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 focus-within:opacity-100 transition duration-300"></div>
                  <div className="relative space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                      <span className="text-xs text-gray-600 font-bold uppercase tracking-wider">
                        Or Join
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>
                    <input
                      value={roomId}
                      onChange={(e) => setRoomId(e.target.value)}
                      placeholder="Enter Battle Code"
                      className="w-full bg-gray-50/80 border border-gray-300 text-gray-900 rounded-2xl px-5 py-4 font-mono text-center text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-500 tracking-widest uppercase"
                    />
                    <button
                      onClick={joinRoom}
                      className="group/join relative w-full overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 text-white py-5 rounded-2xl hover:scale-[1.02] transition-all duration-300 shadow-md shadow-green-500/20 hover:shadow-green-500/40"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3 font-bold text-base">
                        <Users className="w-5 h-5" />
                        <span>Join Battle</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover/join:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiting */}
          {roomState === "waiting" && (
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-40 animate-pulse"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl p-10 text-center shadow-md">
                <div className="mb-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full animate-spin"
                      style={{ animationDuration: "3s" }}
                    ></div>
                    <div className="absolute inset-1 bg-white rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                        <Users className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-transparent bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text mb-3">
                    Waiting for Opponent
                  </h3>
                  <p className="text-gray-600 text-sm font-medium">
                    Share this code to start the epic battle
                  </p>
                </div>

                <div className="relative group/code">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-50 group-hover/code:opacity-75 transition duration-300"></div>
                  <div className="relative bg-gray-50/80 border border-cyan-400/40 rounded-2xl p-6">
                    <div className="flex items-center justify-center gap-4">
                      <code className="text-3xl font-mono font-black text-transparent bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text tracking-[0.5em] animate-pulse">
                        {joinedRoom}
                      </code>
                      <button
                        onClick={copyRoomId}
                        className="group/copy p-4 bg-gradient-to-br from-white to-gray-100 border border-gray-200 rounded-xl hover:border-cyan-500/50 transition-all duration-300 hover:scale-110 shadow-sm"
                        title={copied ? "Copied!" : "Copy code"}
                      >
                        {copied ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          <Copy className="w-6 h-6 text-cyan-600 group-hover/copy:text-cyan-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                  <div
                    className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-gray-200 rounded-3xl p-6 shadow-md flex flex-col h-[500px]">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text">
                    Activity Feed
                  </h3>
                  <p className="text-xs text-gray-600 font-medium">
                    Real-time updates
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        No activity yet
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div
                      key={i}
                      className={`group/msg relative p-4 rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] ${
                        m.type === "error"
                          ? "bg-red-100/80 border border-red-300/50 hover:border-red-400/70"
                          : m.type === "success"
                          ? "bg-green-100/80 border border-green-300/50 hover:border-green-400/70"
                          : m.type === "warning"
                          ? "bg-yellow-100/80 border border-yellow-300/50 hover:border-yellow-400/70"
                          : m.type === "system"
                          ? "bg-purple-100/80 border border-purple-300/50 hover:border-purple-400/70"
                          : "bg-blue-100/80 border border-blue-300/50 hover:border-blue-400/70"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-2 h-2 rounded-full mt-1.5 ${
                            m.type === "error"
                              ? "bg-red-500 shadow-md shadow-red-500/30"
                              : m.type === "success"
                              ? "bg-green-500 shadow-md shadow-green-500/30 animate-pulse"
                              : m.type === "warning"
                              ? "bg-yellow-500 shadow-md shadow-yellow-500/30"
                              : m.type === "system"
                              ? "bg-purple-500 shadow-md shadow-purple-500/30"
                              : "bg-blue-500 shadow-md shadow-blue-500/30"
                          }`}
                        ></div>
                        <p
                          className={`flex-1 text-sm font-medium leading-relaxed ${
                            m.type === "error"
                              ? "text-red-700"
                              : m.type === "success"
                              ? "text-green-700"
                              : m.type === "warning"
                              ? "text-yellow-700"
                              : m.type === "system"
                              ? "text-purple-700"
                              : "text-blue-700"
                          }`}
                        >
                          {m.text}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.8);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default ChallengePage;
