import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Trophy,
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
  const [winner, setWinner] = useState(null);
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

    const handleOpponentJoined = ({ opponentId, durationSec }) => {
      setOpponent(opponentId);
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
    error: "bg-red-500/10 border-red-400/30 text-red-200",
    success: "bg-green-500/10 border-green-400/30 text-green-200",
    warning: "bg-yellow-500/10 border-yellow-400/30 text-yellow-200",
    info: "bg-blue-500/10 border-blue-400/30 text-blue-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      {/* Clean background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Winner Celebration Modal */}
      <AnimatePresence>
        {roomState === "finished" && winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 20 }}
              className={`relative max-w-md w-full mx-4 p-8 rounded-2xl backdrop-blur-xl border ${
                winner === "user"
                  ? "bg-green-500/10 border-green-400/30 shadow-lg shadow-green-500/20"
                  : "bg-red-500/10 border-red-400/30 shadow-lg shadow-red-500/20"
              }`}
            >
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"
                >
                  <Trophy className="w-10 h-10 text-white" />
                </motion.div>

                <h2
                  className={`text-4xl font-bold mb-2 ${
                    winner === "user" ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {winner === "user" ? "YOU WON! 🎉" : "OPPONENT WINS 💔"}
                </h2>

                <p className="text-gray-300 mb-6">
                  {winner === "user"
                    ? "Congratulations! You've proven your coding skills!"
                    : "Better luck next time. Keep coding and improve!"}
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.reload()}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                    winner === "user"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {winner === "user" ? "Play Again" : "Try Again"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <div className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
                  <img
                     src="src/images/codeArenaArrow.png"
                    alt="CodeArena Logo"
                    className="h-10 w-22 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">CodeArena</h1>
              <p className="text-xs text-gray-400">1v1 CODING BATTLE</p>
            </div>
          </motion.div>

          {roomState === "running" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-lg font-bold text-white">
                  {formatTime(timer)}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Leave
              </motion.button>
            </motion.div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Problem + Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem */}
            {problem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {problem.title}
                      </h2>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full ${
                          problem.difficulty === "Hard"
                            ? "bg-red-500/20 text-red-300 border border-red-400/30"
                            : problem.difficulty === "Medium"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30"
                            : "bg-green-500/20 text-green-300 border border-green-400/30"
                        }`}
                      >
                        {problem.difficulty || "MEDIUM"}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>

                {/* Test Cases */}
                <div className="space-y-3 mt-6">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    Test Cases
                  </h3>
                  {problem.visibleTestcase?.map((t, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-blue-400/30 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-gray-300">
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                          #{i + 1}
                        </span>
                        Test Case
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-semibold text-green-300 mb-1">
                            Input
                          </p>
                          <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded overflow-x-auto">
                            {t.input}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-cyan-300 mb-1">
                            Expected Output
                          </p>
                          <pre className="text-xs text-gray-300 bg-black/30 p-2 rounded overflow-x-auto">
                            {t.output}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Editor */}
            {problem && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Code Editor</h3>
                      <p className="text-xs text-gray-400">
                        Write your solution
                      </p>
                    </div>
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-400 transition-all"
                  >
                    <option value="cpp" className="bg-slate-900">
                      C++
                    </option>
                    <option value="java" className="bg-slate-900">
                      Java
                    </option>
                    <option value="python" className="bg-slate-900">
                      Python
                    </option>
                    <option value="javascript" className="bg-slate-900">
                      JavaScript
                    </option>
                  </select>
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-80 bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none"
                  placeholder="// Write your solution here..."
                  spellCheck="false"
                />

                <div className="flex gap-3 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {}}
                    disabled={isRunning}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Code
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {}}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Room + Activity */}
          <div className="space-y-6">
            {/* Room Actions */}
            {roomState === "idle" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h3 className="font-bold text-white">Battle Arena</h3>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={createRoom}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold mb-4 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Create Battle
                </motion.button>

                <div className="relative py-4">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <p className="text-center text-xs text-gray-400 relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 inline-block w-full">
                    Or join existing
                  </p>
                </div>

                <input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Battle Code"
                  className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-center font-mono text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 placeholder-gray-500 mb-3"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={joinRoom}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Join Battle
                </motion.button>
              </motion.div>
            )}

            {/* Waiting for Opponent */}
            {roomState === "waiting" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg text-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center"
                >
                  <Users className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2">
                  Waiting for Opponent
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Share this code to start
                </p>

                <div className="flex items-center justify-center gap-2 bg-black/30 border border-white/20 rounded-lg p-3 mb-4">
                  <code className="text-lg font-mono font-bold text-blue-300">
                    {joinedRoom}
                  </code>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyRoomId}
                    className="p-2 hover:bg-white/10 rounded transition-all"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </motion.button>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ delay: i * 0.2, repeat: Infinity }}
                      className="w-2 h-2 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg flex flex-col h-96"
            >
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Activity Feed</h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                <AnimatePresence>
                  {messages.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full"
                    >
                      <p className="text-sm text-gray-500">No activity yet</p>
                    </motion.div>
                  ) : (
                    messages.map((msg, idx) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`p-3 rounded-lg border text-sm ${
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
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default ChallengePage;
