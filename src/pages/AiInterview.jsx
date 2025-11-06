import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Brain,
  Timer,
  Send,
  Play,
  StopCircle,
  Sparkles,
  CheckCircle,
  User,
  Bot,
  Mic,
  Video,
  VideoOff,
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
    window.speechSynthesis.cancel();

    const naturalText = text
      .replace(/\./g, ". ") 
      .replace(/,/g, ", ") 
      .replace(/\?/g, "? ")
      .replace(/:/g, ": ") 
      .replace(/  +/g, " ");

    const msg = new SpeechSynthesisUtterance(naturalText);
    
    msg.lang = "en-US";
    msg.pitch = 1.05; 
    msg.rate = 0.9;
    msg.volume = 0.95; 

    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();

      const naturalFemaleVoices = [
        "Samantha", // macOS - Very natural
        "Google UK English Female", // Natural British accent
        "Google US English Female", // Natural American accent
        "Microsoft Zira - English (United States)", // Windows natural voice
        "Victoria", // macOS - Natural Australian
        "Karen", // macOS - Natural Australian
        "Moira", // macOS - Irish accent
        "Tessa", // macOS - South African
        "Fiona", // macOS - Scottish
        "Veena", // Indian accent
        "Microsoft Zira Desktop",
        "Susan",
        "Joanna",
        "Salli",
      ];

      let femaleVoice = voices.find((voice) =>
        naturalFemaleVoices.some((name) => voice.name.includes(name))
      );

      if (!femaleVoice) {
        femaleVoice = voices.find((voice) =>
          voice.name.toLowerCase().includes("female")
        );
      }

      if (!femaleVoice) {
        femaleVoice = voices.find(
          (voice) =>
            voice.lang.includes("en") &&
            !voice.name.toLowerCase().includes("male") &&
            !voice.name.includes("Daniel") &&
            !voice.name.includes("Thomas") &&
            !voice.name.includes("Fred")
        );
      }

      if (femaleVoice) {
        msg.voice = femaleVoice;

        if (femaleVoice.name.includes("Samantha")) {
          msg.pitch = 1.0; 
          msg.rate = 0.92;
        } else if (femaleVoice.name.includes("Google")) {
          msg.pitch = 1.05;
          msg.rate = 0.88; 
        } else if (femaleVoice.name.includes("Zira")) {
          msg.pitch = 1.08;
          msg.rate = 0.9;
        }

        console.log("✨ Using natural voice:", femaleVoice.name);
      } else {
        msg.pitch = 1.2;
        msg.rate = 0.85;
        console.log("⚠️ Using default voice with feminine adjustments");
      }

      msg.onstart = () => {
        console.log("🎙️ Speaking...");
      };

      msg.onend = () => {
        console.log("✅ Speech finished");
      };

      window.speechSynthesis.speak(msg);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoice();
        window.speechSynthesis.onvoiceschanged = null;
      };
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

    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onend = () => setIsListening(false);

    recognitionRef.current.onresult = (event) => {
      const speech = event.results[0][0].transcript;
      setAnswer(speech);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 text-gray-100 p-6 relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 pb-6 border-b border-white/10 backdrop-blur-sm relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-3 rounded-xl border border-purple-500/30">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
                AI Video Interview
              </h1>
              <p className="text-xs text-gray-500 font-medium tracking-wider">
                POWERED BY GEMINI AI + DAILY.CO
              </p>
            </div>
          </div>

          {session && !interviewEnded && (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300 animate-pulse"></div>
                <div className="relative flex items-center gap-3 bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 px-6 py-4 rounded-2xl">
                  <Timer className="w-6 h-6 text-purple-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 font-medium">
                      TIME LEFT
                    </span>
                    <span
                      className={`font-mono text-2xl font-black tabular-nums ${
                        timeLeft < 60
                          ? "text-red-400 animate-pulse"
                          : "bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                      }`}
                    >
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleEndInterview}
                className="relative group overflow-hidden bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/50"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <StopCircle className="w-4 h-4" />
                  End Interview
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-700 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto relative z-10">
        {!session ? (
          // Start Screen
          <div className="flex items-center justify-center min-h-[600px]">
            <div className="group relative max-w-2xl w-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-12 shadow-2xl text-center">
                <div className="mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-spin"
                      style={{ animationDuration: "3s" }}
                    ></div>
                    <div className="absolute inset-2 bg-slate-900 rounded-full"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Video className="w-16 h-16 text-purple-400" />
                    </div>
                  </div>
                  <h2 className="text-4xl font-black text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text mb-4">
                    AI Video Interview
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    Experience a 15-minute live video interview with AI-powered
                    questions and real-time feedback. Practice with speech
                    recognition and video interaction.
                  </p>
                </div>

                <div className="bg-slate-950/50 border border-purple-500/30 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2 justify-center">
                    <Sparkles className="w-5 h-5" />
                    Features
                  </h3>
                  <ul className="space-y-3 text-left text-gray-300">
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
                  className="group/start relative w-full overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Preparing Interview...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-6 h-6" />
                        <span>Start AI Video Interview</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-cyan-700 opacity-0 group-hover/start:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Interview Screen with Video + Chat
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Section - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/50">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
                        Live Interview Room
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Video & Audio enabled
                      </p>
                    </div>
                  </div>
                  <iframe
                    src={session.videoRoom}
                    allow="camera; microphone; autoplay; display-capture"
                    className="w-full h-[500px] rounded-2xl bg-black/50"
                    title="AI Video Interview Room"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Chat Section - 1/3 width */}
            <div className="lg:col-span-1">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[588px]">
                  <div className="flex items-center gap-3 p-6 pb-4 border-b border-white/10">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/50">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-transparent bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text">
                        Interview Chat
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        AI Q&A Session
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.role === "ai" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-gradient-to-br from-cyan-600 to-blue-600 text-white"
                              : msg.role === "system"
                              ? "bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 text-yellow-300"
                              : "bg-slate-950/50 border border-purple-500/30 text-gray-300"
                          } rounded-xl p-4 shadow-lg`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.text}
                          </p>
                          {msg.timestamp && (
                            <span className="text-xs opacity-60 mt-2 block">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>

                        {msg.role === "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/50">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/50 animate-pulse">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="bg-slate-950/50 border border-purple-500/30 rounded-xl p-4 shadow-lg">
                          <div className="flex gap-2">
                            <div
                              className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
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
                    <div className="border-t border-white/10 p-4 bg-slate-950/50">
                      <div className="relative mb-3">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl blur opacity-20 focus-within:opacity-40 transition duration-300"></div>
                        <div className="relative flex gap-2">
                          <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer..."
                            disabled={loading || interviewEnded}
                            className="flex-1 bg-slate-950 border border-white/10 text-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 placeholder-gray-600 resize-none disabled:opacity-50"
                            rows="2"
                          />
                          <button
                            onClick={sendAnswer}
                            disabled={loading || !answer.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-purple-500/30"
                          >
                            <Send className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={isListening ? stopListening : startListening}
                        className={`w-full ${
                          isListening
                            ? "bg-gradient-to-r from-red-600 to-rose-600"
                            : "bg-gradient-to-r from-cyan-600 to-blue-600"
                        } text-white py-3 rounded-xl hover:scale-105 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg`}
                      >
                        <Mic
                          className={`w-4 h-4 ${
                            isListening ? "animate-pulse" : ""
                          }`}
                        />
                        <span>
                          {isListening ? "Stop Recording" : "🎙️ Speak Answer"}
                        </span>
                      </button>
                    </div>
                  )}

                  {interviewEnded && (
                    <div className="border-t border-white/10 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
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
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #a855f7, #ec4899, #06b6d4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #c084fc, #f472b6, #22d3ee);
        }
      `}</style>
    </div>
  );
};

export default AiInterviewVideo;
