import axiosClient from "../utils/axiosClient";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  MessageSquare,
  Sparkles,
  Loader2,
  Code2,
  Terminal,
  Lightbulb,
} from "lucide-react";
const ChatAI = ({ problem }) => {
  const [messages, setMessages] = useState([
    {
      role: "model",
      parts: [
        {
          text: "Hello! I'm your AI coding assistant. How can I help you today? 🚀",
        },
      ],
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const messageValue = watch("message", "");

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (data) => {
    if (!data.message.trim()) return;

    const userMessage = {
      role: "user",
      parts: [{ text: data.message }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);
    reset();

    try {
      const response = await axiosClient.post("/ai/chat", {
        messages: messages,
        title: problem.title,
        description: problem.description,
        testCase: problem.visibleTestcase,
        startCode: problem.startCode,
      });

      setTimeout(() => {
        const aiMessage = {
          role: "model",
          parts: [{ text: response.data.message }],
        };

        setMessages((prev) => [...prev, aiMessage]);
        setIsTyping(false);
      }, 800);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          parts: [
            { text: "Sorry, something went wrong. Please try again later. 😔" },
          ],
        },
      ]);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "model",
        parts: [
          {
            text: "Hello! I'm your AI coding assistant. How can I help you today? 🚀",
          },
        ],
      },
    ]);
  };

  const copyMessage = async (content, index) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const formatMessage = (text) => {
    if (!text) return "";

    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        language: match[1] || "text",
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: "text", content: text }];
  };

  const formatTextContent = (text) => {
    const inlineCodeRegex = /`([^`]+)`/g;
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    return text.split("\n").map((line, lineIndex) => {
      if (line.trim() === "") return <br key={lineIndex} />;

      const isListItem =
        line.match(/^[\s]*[-*•]\s+(.+)/) || line.match(/^[\s]*\d+\.\s+(.+)/);
      const isNumberedList = line.match(/^[\s]*\d+\.\s+(.+)/);

      let formattedLine = line
        .replace(boldRegex, "<strong>$1</strong>")
        .replace(italicRegex, "<em>$1</em>")
        .replace(inlineCodeRegex, '<code class="inline-code">$1</code>');

      if (isListItem) {
        const content = isNumberedList
          ? line.replace(/^[\s]*\d+\.\s+/, "")
          : line.replace(/^[\s]*[-*•]\s+/, "");
        const formattedContent = content
          .replace(boldRegex, "<strong>$1</strong>")
          .replace(italicRegex, "<em>$1</em>")
          .replace(inlineCodeRegex, '<code class="inline-code">$1</code>');

        return (
          <div key={lineIndex} className="flex items-start space-x-2 my-1">
            <span className="text-purple-400 mt-1 flex-shrink-0">
              {isNumberedList ? `${line.match(/\d+/)[0]}.` : "•"}
            </span>
            <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </div>
        );
      }

      return (
        <div
          key={lineIndex}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  const getLanguageIcon = (language) => {
    const icons = {
      javascript: "🟨",
      python: "🐍",
      java: "☕",
      cpp: "⚡",
      html: "🌐",
      css: "🎨",
      sql: "🗄️",
      json: "📋",
    };
    return icons[language?.toLowerCase()] || "💻";
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800/50 backdrop-blur-sm">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-gray-900/90 via-black to-gray-900/90 p-5 border-b border-gray-700/50 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg rotate-3 hover:rotate-0 transition-transform duration-300">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg border-2 border-black"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent flex items-center gap-3">
                AI Coding Assistant
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </h2>
              <p className="text-gray-400 text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Powered by Gemini AI • Ready to help
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <MessageSquare className="w-4 h-4 text-purple-400" />
              <span className="text-gray-300 text-sm font-medium">
                {messages.length}
              </span>
            </div>
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 rounded-xl transition-all duration-300 text-gray-300 hover:text-white border border-red-500/30 hover:border-red-400/50 backdrop-blur-sm group"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 group-hover:animate-pulse" />
              <span className="text-sm font-medium">Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-black via-gray-900/50 to-black custom-scrollbar"
        style={{ maxHeight: "500px" }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex w-full ${
              msg.role === "user" ? "justify-end" : "justify-start"
            } animate-fade-in-up`}
          >
            <div
              className={`w-full max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-2xl xl:max-w-3xl flex ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              } items-start gap-2 sm:gap-3`}
            >
              {/* Enhanced Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl border-2 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 border-blue-400/30 hover:scale-105"
                    : "bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 border-purple-400/30 hover:scale-105"
                } transition-transform duration-200`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                ) : (
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>

              {/* Enhanced Message Bubble */}
              <div className="group relative flex-1 min-w-0">
                <div
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-xl backdrop-blur-md border transition-all duration-300 hover:shadow-3xl ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-600/90 to-blue-700/90 text-white border-blue-400/30 rounded-br-md hover:from-blue-600 hover:to-blue-700"
                      : "bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95 border-gray-600/30 text-gray-100 rounded-bl-md hover:from-gray-800 hover:to-gray-900/90 hover:border-gray-500/40"
                  }`}
                >
                  <div className="space-y-2 sm:space-y-3">
                    {msg.parts?.map((part, i) => {
                      const formattedParts = formatMessage(part.text);
                      return (
                        <div key={i} className="space-y-2 sm:space-y-3">
                          {formattedParts.map((section, sectionIndex) => {
                            if (section.type === "code") {
                              return (
                                <div
                                  key={sectionIndex}
                                  className="relative group/code -mx-1 sm:mx-0"
                                >
                                  {/* Code block header */}
                                  <div className="flex items-center justify-between bg-gray-900/90 border border-gray-700/50 rounded-t-lg sm:rounded-t-xl px-2 sm:px-4 py-1.5 sm:py-2">
                                    <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                      <Code2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0" />
                                      <span className="text-xs sm:text-sm font-medium text-gray-300 capitalize truncate">
                                        {section.language}
                                      </span>
                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                        {getLanguageIcon(section.language)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() =>
                                        copyMessage(
                                          section.content,
                                          `code-${index}-${sectionIndex}`
                                        )
                                      }
                                      className="opacity-0 group-hover/code:opacity-100 p-1 sm:p-1.5 bg-gray-700/50 hover:bg-gray-600 text-gray-300 rounded transition-all duration-200 flex-shrink-0"
                                      title="Copy code"
                                    >
                                      {copiedIndex ===
                                      `code-${index}-${sectionIndex}` ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                  {/* Code content */}
                                  <div className="bg-gray-950/90 border border-gray-700/50 border-t-0 rounded-b-lg sm:rounded-b-xl overflow-hidden">
                                    <pre className="p-2 sm:p-4 overflow-x-auto custom-scrollbar">
                                      <code className="text-xs sm:text-sm text-gray-200 font-mono leading-relaxed whitespace-pre block">
                                        {section.content}
                                      </code>
                                    </pre>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div
                                  key={sectionIndex}
                                  className="prose prose-invert prose-sm sm:prose-base max-w-none"
                                >
                                  <div className="text-gray-100 leading-relaxed space-y-1 sm:space-y-2 text-sm sm:text-base">
                                    {formatTextContent(section.content)}
                                  </div>
                                </div>
                              );
                            }
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Copy Button */}
                {msg.role === "model" && (
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <button
                      onClick={() =>
                        copyMessage(
                          msg.parts.map((p) => p.text).join("\n"),
                          index
                        )
                      }
                      className="p-1.5 sm:p-2 bg-gray-700/80 hover:bg-gray-600 text-gray-300 hover:text-white rounded-md sm:rounded-lg transition-all duration-200 shadow-lg backdrop-blur-sm border border-gray-600/50 hover:border-gray-500"
                      title="Copy message"
                    >
                      {copiedIndex === index ? (
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message timestamp */}
                <div
                  className={`text-xs text-gray-500 mt-1 sm:mt-2 px-1 ${
                    msg.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Enhanced Typing indicator */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-full max-w-[85%] sm:max-w-[75%] md:max-w-[70%] lg:max-w-2xl flex flex-row items-start gap-2 sm:gap-3">
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 shadow-xl border-2 border-purple-400/30 animate-pulse">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95 border border-gray-600/30 p-3 sm:p-5 rounded-xl sm:rounded-2xl rounded-bl-md shadow-2xl backdrop-blur-md min-w-0 flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce shadow-lg"></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-400 rounded-full animate-bounce shadow-lg"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                    <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-gray-300 font-medium truncate">
                      <span className="hidden sm:inline">
                        AI is crafting your solution...
                      </span>
                      <span className="sm:hidden">AI is thinking...</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Enhanced Input Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-t border-gray-700/50 bg-gradient-to-r from-gray-900/90 via-black to-gray-900/90 p-4 backdrop-blur-md"
      >
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              {...register("message", {
                required: "Message is required",
                minLength: { value: 1, message: "Message cannot be empty" },
              })}
              className="w-full p-4 bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-600/50 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 resize-none custom-scrollbar backdrop-blur-sm shadow-lg hover:border-gray-500/50"
              placeholder="Ask me anything about coding, algorithms, debugging..."
              rows="1"
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              style={{
                minHeight: "56px",
                maxHeight: "120px",
                overflowY: messageValue.length > 100 ? "auto" : "hidden",
              }}
            />

            {/* Enhanced Error Message */}
            {errors.message && (
              <div className="absolute -bottom-6 left-1 flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-xs font-medium">
                  {errors.message.message}
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Send Button */}
          <button
            type="submit"
            disabled={isLoading || !messageValue.trim()}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 disabled:from-gray-700 disabled:to-gray-800 text-white rounded-2xl transition-all duration-300 flex items-center space-x-2 shadow-xl hover:shadow-2xl disabled:cursor-not-allowed min-w-[100px] justify-center group hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
                <span className="hidden sm:inline font-medium">Send</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.4);
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(
            to bottom,
            rgba(147, 51, 234, 0.6),
            rgba(79, 70, 229, 0.6)
          );
          border-radius: 4px;
          border: 1px solid rgba(75, 85, 99, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(
            to bottom,
            rgba(147, 51, 234, 0.8),
            rgba(79, 70, 229, 0.8)
          );
        }

        .inline-code {
          background: rgba(147, 51, 234, 0.2);
          color: #e879f9;
          padding: 2px 6px;
          border-radius: 6px;
          font-family: "Fira Code", "Monaco", "Consolas", monospace;
          font-size: 0.9em;
          border: 1px solid rgba(147, 51, 234, 0.3);
        }

        .prose strong {
          color: #fbbf24;
          font-weight: 600;
        }

        .prose em {
          color: #a78bfa;
          font-style: italic;
        }

        /* Auto-resize textarea */
        textarea {
          field-sizing: content;
        }

        /* Enhanced hover effects */
        .hover\\:shadow-3xl:hover {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8),
            0 0 0 1px rgba(147, 51, 234, 0.1);
        }

        /* Gradient animations */
        @keyframes gradient-shift {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatAI;
