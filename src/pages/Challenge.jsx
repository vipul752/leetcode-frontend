import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";
import {
  Clock,
  Code,
  Users,
  Copy,
  Check,
  Play,
  Send,
  AlertCircle,
  Shield,
  Zap,
  Trophy,
  X,
  Menu,
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
  const [opponentName, setOpponentName] = useState("Opponent");
  const [copied, setCopied] = useState(false);
  const [winner, setWinner] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [showTestResults, setShowTestResults] = useState(false);
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
      addMessage("✅ Connected to challenge server", "success");
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
      setProblem(p);
      setJoinedRoom(id);
      setRoomState("waiting");
      addMessage(message, "info");
      if (durationSec) setTimer(durationSec);
    };

    const handleChallengeStart = ({ durationSec, message }) => {
      setTimer(durationSec);
      setRoomState("running");
      addMessage(message, "success");
    };

    const handleOpponentJoined = ({ opponentId, durationSec, userName }) => {
      setOpponent(opponentId);
      setOpponentName(userName || "Opponent");
      if (durationSec) {
        setTimer(durationSec);
        setRoomState("running");
        addMessage("👥 Opponent joined. Challenge started!", "success");
      } else {
        addMessage("👥 Opponent joined. Challenge will start!", "success");
      }
    };

    const handleWinner = ({ winner: winnerId }) => {
      const isWinner = winnerId === userId;
      setWinner(isWinner ? "user" : "opponent");
      setShowResultModal(true);
      addMessage(
        isWinner
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

    socket.on("connect", handleConnect);
    socket.on("error", handleError);
    socket.on("disconnect", handleDisconnect);
    socket.on("waiting", handleWaiting);
    socket.on("challengeStart", handleChallengeStart);
    socket.on("challengeStarted", handleChallengeStart);
    socket.on("opponentJoined", handleOpponentJoined);
    socket.on("winner", handleWinner);
    socket.on("userLeft", handleUserLeft);

    socket.onAny((eventName, ...args) => {
      if (
        roomState === "waiting" &&
        args[0]?.state === "running" &&
        args[0]?.durationSec
      ) {
        setRoomState("running");
        setTimer(args[0].durationSec);
        addMessage("⚡ Challenge started!", "success");
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
        if (res.data.state === "running" && roomState === "waiting") {
          setRoomState("running");
          if (res.data.durationSec) setTimer(res.data.durationSec);
          addMessage("⚡ Challenge started!", "success");
        }
      } catch (error) {
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

  useEffect(() => {
    if (roomState !== "waiting" || !joinedRoom) return;
    const pollInterval = setInterval(() => {
      checkRoomStatus(joinedRoom);
    }, 3000);
    return () => clearInterval(pollInterval);
  }, [roomState, joinedRoom, checkRoomStatus]);

  const addMessage = (text, type = "info") => {
    setMessages((prev) => [...prev, { text, type, id: Date.now() }]);
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
      setShowTestResults(true);
      if (res.data.success) {
        addMessage("✅ All tests passed!", "success");
      } else {
        addMessage(
          `❌ ${res.data.passedTestCases}/${res.data.totalTestCases} tests passed`,
          "error"
        );
      }
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
      if (res.data.accepted) {
        addMessage("🎉 Solution accepted!", "success");
        socket.emit("submitCode", {
          roomId: joinedRoom,
          userId,
          status: "accepted",
        });
      } else {
        addMessage("❌ Solution rejected", "error");
      }
    } catch {
      addMessage("❌ Error submitting code", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createRoom = async () => {
    try {
      const res = await axiosClient.post("/challenge/create/room", {
        socketId: socket.id,
      });
      setRoomId(res.data.roomId);
      setProblem(res.data.problem);
      setJoinedRoom(res.data.roomId);
      addMessage("🎮 Room created! Share your room code.", "success");
      socket.emit("joinAsCreator", { roomId: res.data.roomId, userId });
    } catch (error) {
      console.error("❌ Error creating room:", error);
      addMessage("❌ Error creating room", "error");
    }
  };

  const joinRoom = async () => {
    if (!roomId.trim()) return addMessage("⚠️ Enter room ID", "warning");
    try {
      const res = await axiosClient.post(`/challenge/join/room/${roomId}`);
      setJoinedRoom(roomId);
      setProblem(res.data.problem);
      setTimer(res.data.durationSec);
      setRoomState("running");
      socket.emit("joinRoom", { roomId, userId });
      addMessage("✅ Joined challenge room!", "success");
    } catch (error) {
      console.error("❌ Error joining room:", error);
      addMessage("❌ Invalid room ID", "error");
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

  const messageTypeStyles = {
    error: "bg-red-500/10 border-l-2 border-red-500 text-red-300",
    success: "bg-green-500/10 border-l-2 border-green-500 text-green-300",
    warning: "bg-yellow-500/10 border-l-2 border-yellow-500 text-yellow-300",
    info: "bg-blue-500/10 border-l-2 border-blue-500 text-blue-300",
  };

  return (
    <div
      className="min-h-screen text-white overflow-hidden"
      style={{ backgroundColor: "#0e1117" }}
    >
      {/* Header / Navbar */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          backgroundColor: "#161b22",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded transition-all"
            >
              {leftSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div className="flex items-center gap-3">
              <img
                src="/codeArenaArrow.png"
                alt="CodeArena Logo"
                className="h-8 w-auto rounded"
              />
              <div>
                <h1 className="text-lg font-bold" style={{ color: "#f8fafc" }}>
                  CodeArena
                </h1>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  1v1 BATTLE
                </p>
              </div>
            </div>
          </div>

          {roomState === "running" && (
            <div className="flex items-center gap-6">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded"
                style={{ backgroundColor: "#1f2630" }}
              >
                <Clock className="w-4 h-4" style={{ color: "#3b82f6" }} />
                <span className="font-mono font-bold">{formatTime(timer)}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded font-semibold transition-all"
                style={{ backgroundColor: "#ef4444", color: "#fff" }}
              >
                Leave
              </motion.button>
            </div>
          )}
        </div>
      </header>

      {/* Winner Modal */}
      <AnimatePresence>
        {showResultModal && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-12 max-w-md w-11/12 text-center border"
              style={{
                backgroundColor: "#161b22",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="text-7xl mb-6"
              >
                🏆
              </motion.div>

              <h1
                className="text-4xl font-bold mb-4"
                style={{
                  color: winner === "user" ? "#22c55e" : "#ef4444",
                }}
              >
                {winner === "user" ? "You Won!" : "Better Luck!"}
              </h1>

              <p className="text-lg mb-8" style={{ color: "#94a3b8" }}>
                {winner === "user"
                  ? `You defeated ${opponentName}`
                  : `${opponentName} defeated you. Keep practicing!`}
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setShowResultModal(false);
                  window.location.href = "/home";
                }}
                className="w-full py-3 rounded-lg font-bold transition-all"
                style={{
                  background:
                    "linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)",
                  color: "#fff",
                }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results Modal */}
      <AnimatePresence>
        {showTestResults && testResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              className="rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border"
              style={{
                backgroundColor: "#161b22",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="p-8">
                {/* Header */}
                <div
                  className="flex items-center justify-between mb-6 pb-6 border-b"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="text-3xl p-3 rounded-lg"
                      style={{
                        backgroundColor: testResults.success
                          ? "rgba(34, 197, 94, 0.1)"
                          : "rgba(239, 68, 68, 0.1)",
                      }}
                    >
                      {testResults.success ? "✅" : "❌"}
                    </div>
                    <div>
                      <h2
                        className="text-2xl font-bold"
                        style={{
                          color: testResults.success ? "#22c55e" : "#ef4444",
                        }}
                      >
                        {testResults.success
                          ? "All Tests Passed!"
                          : "Tests Failed"}
                      </h2>
                      <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                        {testResults.passedTestCases} /{" "}
                        {testResults.totalTestCases} test cases passed
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTestResults(false)}
                    className="p-2 hover:bg-white/10 rounded transition-all"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div
                    className="p-4 rounded-lg border text-center"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      Runtime
                    </p>
                    <p className="text-xl font-bold">{testResults.runTime}ms</p>
                  </div>
                  <div
                    className="p-4 rounded-lg border text-center"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      Memory
                    </p>
                    <p className="text-xl font-bold">{testResults.memory}MB</p>
                  </div>
                  <div
                    className="p-4 rounded-lg border text-center"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      Passed
                    </p>
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: testResults.success ? "#22c55e" : "#ef4444",
                      }}
                    >
                      {testResults.passedTestCases}/{testResults.totalTestCases}
                    </p>
                  </div>
                </div>

                {/* Test Cases */}
                <h3
                  className="text-sm font-bold mb-4 uppercase tracking-widest"
                  style={{ color: "#3b82f6" }}
                >
                  Test Cases
                </h3>
                <div className="space-y-3">
                  {testResults.testCases?.map((testCase, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: "#1f2630",
                        borderColor: testCase.passed
                          ? "rgba(34, 197, 94, 0.3)"
                          : "rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="text-sm font-bold px-2 py-1 rounded"
                          style={{
                            backgroundColor: testCase.passed
                              ? "rgba(34, 197, 94, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                            color: testCase.passed ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {testCase.passed ? "✅ PASSED" : "❌ FAILED"}
                        </span>
                        <span
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.875rem",
                          }}
                        >
                          Test Case #{idx + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p
                            style={{
                              color: "#22c55e",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                            }}
                          >
                            INPUT
                          </p>
                          <pre
                            className="p-2 rounded overflow-x-auto"
                            style={{
                              backgroundColor: "#0e1117",
                              color: "#94a3b8",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {testCase.input}
                          </pre>
                        </div>
                        <div>
                          <p
                            style={{
                              color: "#3b82f6",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                            }}
                          >
                            EXPECTED
                          </p>
                          <pre
                            className="p-2 rounded overflow-x-auto"
                            style={{
                              backgroundColor: "#0e1117",
                              color: "#94a3b8",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                        <div>
                          <p
                            style={{
                              color: testCase.passed ? "#22c55e" : "#ef4444",
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                              marginBottom: "0.5rem",
                            }}
                          >
                            YOUR OUTPUT
                          </p>
                          <pre
                            className="p-2 rounded overflow-x-auto"
                            style={{
                              backgroundColor: "#0e1117",
                              color: testCase.passed ? "#22c55e" : "#ef4444",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {testCase.output || "(empty)"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowTestResults(false)}
                  className="w-full mt-6 py-3 rounded-lg font-bold transition-all"
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main 3-Panel Layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* LEFT SIDEBAR */}
        <AnimatePresence>
          {leftSidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="hidden lg:flex flex-col w-72 border-r p-6 space-y-6 overflow-y-auto"
              style={{
                backgroundColor: "#161b22",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              {/* Room Section */}
              {roomState === "idle" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: "#3b82f6" }} />
                    <h3 className="font-bold">Battle Arena</h3>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={createRoom}
                    className="w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    style={{
                      background:
                        "linear-gradient(135deg, #1d4ed8 0%, #9333ea 100%)",
                    }}
                  >
                    <Zap className="w-4 h-4" />
                    Create Battle
                  </motion.button>

                  <div
                    className="text-center text-xs py-3 border-t border-b"
                    style={{
                      color: "#94a3b8",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    Or join existing
                  </div>

                  <input
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    placeholder="Enter Battle Code"
                    className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none transition-all border"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "#f8fafc",
                    }}
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={joinRoom}
                    className="w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#22c55e", color: "#0e1117" }}
                  >
                    <Users className="w-4 h-4" />
                    Join Battle
                  </motion.button>
                </div>
              )}

              {/* Waiting State */}
              {roomState === "waiting" && (
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 mx-auto rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#1f2630" }}
                  >
                    <Users className="w-6 h-6" style={{ color: "#3b82f6" }} />
                  </motion.div>

                  <h4 className="font-bold">Waiting for Opponent</h4>
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    Share this code
                  </p>

                  <div
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <code className="font-mono font-bold text-sm">
                      {joinedRoom}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyRoomId}
                      className="p-1 hover:bg-white/10 rounded transition-all"
                    >
                      {copied ? (
                        <Check
                          className="w-4 h-4"
                          style={{ color: "#22c55e" }}
                        />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Opponent Info */}
              {(roomState === "waiting" || roomState === "running") &&
                opponent && (
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                    }}
                  >
                    <p
                      style={{ color: "#94a3b8", fontSize: "0.875rem" }}
                      className="mb-2"
                    >
                      OPPONENT
                    </p>
                    <p className="font-bold">{opponentName}</p>
                  </div>
                )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* MIDDLE PANEL */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Problem & Editor Section */}
          {problem && roomState !== "idle" && (
            <>
              {/* Problem Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 overflow-y-auto p-6 space-y-6 transition-all ${
                  roomState === "waiting" ? "blur-sm opacity-60" : ""
                }`}
                style={{
                  backgroundColor: "#0e1117",
                }}
              >
                {/* Problem Header */}
                <div
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: "#161b22",
                    borderColor: "rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        {problem.title}
                      </h2>
                      <span
                        className="inline-block px-3 py-1 text-xs font-bold rounded-full border"
                        style={{
                          backgroundColor:
                            problem.difficulty === "Hard"
                              ? "rgba(239, 68, 68, 0.1)"
                              : problem.difficulty === "Medium"
                              ? "rgba(250, 204, 21, 0.1)"
                              : "rgba(34, 197, 94, 0.1)",
                          color:
                            problem.difficulty === "Hard"
                              ? "#ef4444"
                              : problem.difficulty === "Medium"
                              ? "#facc15"
                              : "#22c55e",
                          borderColor:
                            problem.difficulty === "Hard"
                              ? "rgba(239, 68, 68, 0.3)"
                              : problem.difficulty === "Medium"
                              ? "rgba(250, 204, 21, 0.3)"
                              : "rgba(34, 197, 94, 0.3)",
                        }}
                      >
                        {problem.difficulty || "MEDIUM"}
                      </span>
                    </div>
                  </div>

                  <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                    {problem.description}
                  </p>
                </div>

                {/* Test Cases */}
                {problem.visibleTestcase && (
                  <div>
                    <h3
                      className="text-xs font-bold mb-3 uppercase tracking-widest"
                      style={{ color: "#3b82f6" }}
                    >
                      Test Cases
                    </h3>
                    <div className="space-y-3">
                      {problem.visibleTestcase.map((t, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: "#1f2630",
                            borderColor: "rgba(255,255,255,0.08)",
                          }}
                        >
                          <div
                            className="text-xs font-bold mb-3 flex items-center gap-2"
                            style={{ color: "#e2e8f0" }}
                          >
                            <span
                              className="px-2 py-1 rounded text-xs"
                              style={{
                                backgroundColor: "rgba(59, 130, 246, 0.2)",
                                color: "#3b82f6",
                              }}
                            >
                              #{i + 1}
                            </span>
                            Test Case
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p
                                style={{
                                  color: "#22c55e",
                                  fontSize: "0.75rem",
                                }}
                                className="font-bold mb-2"
                              >
                                INPUT
                              </p>
                              <pre
                                className="text-xs p-2 rounded overflow-x-auto"
                                style={{
                                  backgroundColor: "#0e1117",
                                  color: "#94a3b8",
                                  fontFamily: "monospace",
                                }}
                              >
                                {t.input}
                              </pre>
                            </div>
                            <div>
                              <p
                                style={{
                                  color: "#3b82f6",
                                  fontSize: "0.75rem",
                                }}
                                className="font-bold mb-2"
                              >
                                OUTPUT
                              </p>
                              <pre
                                className="text-xs p-2 rounded overflow-x-auto"
                                style={{
                                  backgroundColor: "#0e1117",
                                  color: "#94a3b8",
                                  fontFamily: "monospace",
                                }}
                              >
                                {t.output}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Code Editor Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex-1 flex flex-col p-6 border-t transition-all ${
                  roomState === "waiting"
                    ? "blur-sm opacity-60 pointer-events-none"
                    : ""
                }`}
                style={{
                  backgroundColor: "#161b22",
                  borderColor: "rgba(255,255,255,0.08)",
                }}
              >
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold">Code Editor</h3>
                    <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      Write your solution
                    </p>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="px-3 py-2 rounded text-sm font-semibold focus:outline-none transition-all border"
                    style={{
                      backgroundColor: "#1f2630",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "#f8fafc",
                    }}
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
                  className="flex-1 p-4 rounded-lg font-mono text-sm focus:outline-none resize-none border mb-4"
                  placeholder="// Write your solution here..."
                  spellCheck="false"
                  style={{
                    backgroundColor: "#0e1117",
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "#f8fafc",
                  }}
                />

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={runCode}
                    disabled={isRunning}
                    className="flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                    }}
                  >
                    <Play className="w-4 h-4" />
                    {isRunning ? "Running..." : "Run Code"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitCode}
                    disabled={isSubmitting}
                    className="flex-1 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    style={{
                      backgroundColor: "#22c55e",
                      color: "#0e1117",
                    }}
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}

          {/* Idle State - Room Actions */}
          {roomState === "idle" && (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center space-y-6 max-w-md">
                <div className="text-6xl">🎮</div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Ready for Battle?</h2>
                  <p style={{ color: "#94a3b8" }}>
                    Create a new battle or join an existing one from the left
                    panel
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR - Activity Feed */}
        <div
          className="hidden lg:flex flex-col w-80 border-l p-6"
          style={{
            backgroundColor: "#161b22",
            borderColor: "rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="flex items-center gap-2 mb-4 pb-4 border-b"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <AlertCircle className="w-5 h-5" style={{ color: "#3b82f6" }} />
            <h3 className="font-bold">Activity</h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center h-full"
                >
                  <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                    No activity yet
                  </p>
                </motion.div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`p-3 rounded-lg border text-xs ${
                      messageTypeStyles[msg.type] || messageTypeStyles.info
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
