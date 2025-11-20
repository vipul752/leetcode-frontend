import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Timer,
  Send,
  Play,
  StopCircle,
  CheckCircle,
  User,
  Bot,
  Mic,
  Video,
  X,
} from "lucide-react";
import axiosClient from "../utils/axiosClient";

const AiInterviewVideo = () => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [interviewEnded, setInterviewEnded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEndInterview = useCallback(async () => {
    try {
      if (session?.sessionId) {
        await axiosClient.post("/ai-interview/end", {
          sessionId: session.sessionId,
        });
      }
      setInterviewEnded(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          text: "Interview ended. Thank you for participating!",
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.error(err);
    }
  }, [session]);

  useEffect(() => {
    if (session && !interviewEnded && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleEndInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, interviewEnded, timeLeft, handleEndInterview]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const speak = (text) => {
    // Cancel any ongoing speech
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const naturalText = text
      .replace(/\./g, ". ")
      .replace(/,/g, ", ")
      .replace(/\?/g, "? ")
      .replace(/:/g, ": ")
      .replace(/  +/g, " ");

    const msg = new SpeechSynthesisUtterance(naturalText);
    msg.lang = "en-US";
    msg.volume = 1;
    msg.pitch = 1.1; // Slightly higher pitch for female voice
    msg.rate = 0.85; // Slower for clarity

    const setOptimalVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;

      // Priority 1: Google voices (most natural)
      let selectedVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("google") &&
          v.lang === "en-US" &&
          v.name.toLowerCase().includes("female")
      );

      // Priority 2: macOS Samantha or Victoria
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            (v.name === "Samantha" || v.name === "Victoria") &&
            v.lang === "en-US"
        );
      }

      // Priority 3: Other natural female voices
      if (!selectedVoice) {
        const femaleVoiceNames = [
          "Karen",
          "Moira",
          "Tessa",
          "Fiona",
          "Joanna",
          "Salli",
          "Zira",
          "Susan",
        ];
        selectedVoice = voices.find((v) =>
          femaleVoiceNames.some((name) => v.name.includes(name))
        );
      }

      // Priority 4: Any female voice
      if (!selectedVoice) {
        selectedVoice = voices.find(
          (v) =>
            v.name.toLowerCase().includes("female") && v.lang.includes("en")
        );
      }

      if (selectedVoice) {
        msg.voice = selectedVoice;
        console.log("🎙️ Using voice:", selectedVoice.name);

        // Adjust pitch and rate based on selected voice
        if (selectedVoice.name.includes("Google")) {
          msg.pitch = 1.2;
          msg.rate = 0.85;
        } else if (selectedVoice.name === "Samantha") {
          msg.pitch = 1.0;
          msg.rate = 0.9;
        }
      }
    };

    // Wait for voices to load if needed
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setOptimalVoice();
        window.speechSynthesis.speak(msg);
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      setOptimalVoice();
      window.speechSynthesis.speak(msg);
    }
  };

  const startInterview = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.post("/ai-interview/start");
      setSession(res.data);
      setMessages([
        { role: "ai", text: res.data.question, timestamp: new Date() },
      ]);
      speak(res.data.question);
    } catch (err) {
      console.error(err);
      alert("Error starting interview");
    } finally {
      setLoading(false);
    }
  };

  const sendAnswer = async () => {
    if (!answer.trim()) return;

    const userMsg = { role: "user", text: answer, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setAnswer("");
    setLoading(true);

    try {
      const res = await axiosClient.post("/ai-interview/next", {
        sessionId: session.sessionId,
        answer: userMsg.text,
      });

      const aiMsg = {
        role: "ai",
        text: res.data.question,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      speak(res.data.question);

      if (res.data.ended) {
        setInterviewEnded(true);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          text: "Error: Failed to get response.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = "en-US";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.continuous = true; // Keep listening

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      console.log("🎙️ Listening started...");
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
      console.log("⏹️ Listening stopped");
    };

    recognitionRef.current.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update answer in real-time
      if (finalTranscript) {
        setAnswer((prev) => prev + (prev ? " " : "") + finalTranscript);
      } else if (interimTranscript) {
        console.log("Interim:", interimTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Auto-send answer after a short delay to let state update
      setTimeout(() => {
        if (answer.trim()) {
          console.log("Auto-sending answer:", answer);
          sendAnswer();
        }
      }, 300);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white overflow-hidden">
      {/* Subtle Background Effect - Single Gradient Only */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 pt-8 pb-6 px-4 border-b border-white/10 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                AI Video Interview
              </h1>
              <p className="text-xs text-gray-400 font-medium">
                Powered by Gemini AI + Daily.co
              </p>
            </div>
          </div>

          {session && !interviewEnded && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-lg border border-white/20 px-6 py-3 rounded-xl">
                <Timer className="w-5 h-5 text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400">TIME LEFT</span>
                  <span
                    className={`font-mono text-xl font-bold ${
                      timeLeft < 60 ? "text-red-400" : "text-white"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleEndInterview}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <StopCircle className="w-4 h-4" />
                End
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8 relative z-10">
        {!session ? (
          // Start Screen
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="max-w-2xl w-full">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl shadow-black/40">
                <div className="mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Video className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-4xl font-bold text-white mb-4 text-center">
                    AI Video Interview
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed mb-8 text-center">
                    Experience a 15-minute live video interview with AI-powered
                    questions and real-time feedback. Practice with speech
                    recognition and video interaction.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 mb-8">
                  <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                    ✨ Features
                  </h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Live video room with Daily.co integration</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Voice-powered Q&A with speech recognition</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>AI interviewer with text-to-speech responses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>15-minute timed technical interview</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={startInterview}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-lg font-bold text-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Preparing Interview...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start AI Video Interview</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Interview Screen
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Section */}
            <div className="lg:col-span-2">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Live Interview Room
                    </h3>
                    <p className="text-xs text-gray-400">
                      Video & Audio enabled
                    </p>
                  </div>
                </div>
                <iframe
                  src={session.videoRoom}
                  allow="camera; microphone; autoplay; display-capture"
                  className="w-full h-[500px] rounded-xl bg-black/50 border border-white/10"
                  title="AI Video Interview Room"
                ></iframe>
              </div>
            </div>

            {/* Chat Section */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/40 flex flex-col h-[588px]">
                <div className="flex items-center gap-3 p-6 pb-4 border-b border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Interview Chat
                    </h3>
                    <p className="text-xs text-gray-400">AI Q&A Session</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      {msg.role === "ai" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white rounded-b-2xl rounded-tl-2xl"
                            : msg.role === "system"
                            ? "bg-neutral-800/70 border border-white/10 text-yellow-200 rounded-lg"
                            : "bg-neutral-800/70 border border-white/10 text-gray-200 rounded-b-2xl rounded-tr-2xl"
                        } p-3 shadow-sm`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {msg.text}
                        </p>
                        {msg.timestamp && (
                          <span className="text-xs opacity-50 mt-2 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>

                      {msg.role === "user" && (
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center animate-pulse">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="bg-neutral-800/70 border border-white/10 rounded-2xl p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef}></div>
                </div>

                {/* Input Area */}
                {!interviewEnded && (
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="flex gap-2 mb-3">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your answer..."
                        disabled={loading || interviewEnded}
                        className="flex-1 bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all placeholder-gray-500 resize-none disabled:opacity-50 backdrop-blur"
                        rows="2"
                      />
                      <button
                        onClick={sendAnswer}
                        disabled={loading || !answer.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:hover:bg-blue-600"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                    <button
                      onClick={isListening ? stopListening : startListening}
                      disabled={loading}
                      className={`w-full ${
                        isListening
                          ? "bg-red-600 hover:bg-red-700 ring-2 ring-red-400/50"
                          : "bg-blue-600 hover:bg-blue-700"
                      } text-white py-3 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2 ${
                        isListening ? "animate-pulse" : ""
                      } disabled:opacity-50`}
                    >
                      <Mic
                        className={`w-4 h-4 ${
                          isListening ? "animate-pulse" : ""
                        }`}
                      />
                      <span>
                        {isListening ? "Stop & Send" : "🎙️ Speak Answer"}
                      </span>
                    </button>
                  </div>
                )}

                {interviewEnded && (
                  <div className="border-t border-white/10 p-4 bg-white/5">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 text-green-400 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">Interview Completed</span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        Thank you for participating!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Scrollbar */}
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

export default AiInterviewVideo;
