import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";
import ChatAI from "../components/ChatAI.jsx";

const ProblemPage = () => {
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [initialLoading, setInitialLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [solutionsLoading, setSolutionsLoading] = useState(false);

  const editorRef = useRef(null);
  let { problemId } = useParams();

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "Hard":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getLanguageIcon = (lang) => {
    switch (lang) {
      case "cpp":
      case "c++":
        return "";
      case "python":
      case "Python":
        return "";
      case "java":
      case "Java":
        return "";
      case "javascript":
      case "JavaScript":
        return "";
      default:
        return "";
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case "cpp":
        return "c++";
      case "python":
        return "python";
      case "java":
        return "java";
      case "javascript":
        return "javascript";
      default:
        return lang;
    }
  };

  const fetchSolutions = async () => {
    setSolutionsLoading(true);
    try {
      const response = await axiosClient.get(
        `/solution/getUserSolutions/${problemId}`
      );
      setSolutions(response.data || []);
    } catch (error) {
      console.error("Error fetching solutions:", error);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const handleGetSubmissionResult = async () => {
    try {
      const res = await axiosClient.get(
        `/problem/submittedProblem/${problemId}`
      );
      if (res.data.success) {
        setSubmissions(res.data.submissions);
      }
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    if (problemId) {
      handleGetSubmissionResult();
    }
  }, [problemId]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axiosClient.get(
          `/submission/submittedProblem/${problemId}`
        );
        setSubmissions(res.data.submissions);
      } catch (err) {
        console.error("Error fetching submissions:", err);
      }
    };
    fetchSubmissions();
  }, [problemId]);

  const languageMap = {
    cpp: "c++",
    java: "java",
    javascript: "javascript",
    python: "python",
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setInitialLoading(true);
      try {
        const response = await axiosClient.get(
          `/problem/getProblem/${problemId}`
        );

        const initialCode = response.data.startCode.find(
          (sc) => sc.language === languageMap[selectedLanguage]
        )?.initialCode;

        setProblem(response.data);
        setCode(initialCode);
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProblem();
  }, [problemId, selectedLanguage]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode?.find(
        (sc) => sc.language === languageMap[selectedLanguage]
      )?.initialCode;

      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  useEffect(() => {
    if (activeLeftTab === "solutions") {
      fetchSolutions();
    }
  }, [activeLeftTab, problemId]);

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setRunLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, {
        code: code,
        language: selectedLanguage,
      });
      setRunResult(response.data);
      setActiveRightTab("testcase");
      setRunLoading(false);
    } catch (error) {
      console.error("Error running code:", error);
      setRunResult({
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to run code. Please try again.",
      });
      setRunLoading(false);
      setActiveRightTab("testcase");
    }
  };

  const handleSubmitCode = async () => {
    setSubmitLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(
        `/submission/submit/${problemId}`,
        {
          code: code,
          language: selectedLanguage,
        }
      );
      setSubmitResult(response.data);
      setSubmitLoading(false);
      setActiveRightTab("result");
    } catch (error) {
      console.error("Error submitting code:", error);
      setSubmitResult({
        accepted: false,
        status: "Error",
        message:
          error.response?.data?.message ||
          "Failed to submit code. Please try again.",
      });
      setSubmitLoading(false);
      setActiveRightTab("result");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-700 border-t-amber-500"></div>
          <p className="text-slate-400 animate-pulse">Loading problem...</p>
        </div>
      </div>
    );
  }

  const getStatusStyles = (status) => {
    switch (status) {
      case "Accepted":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
      case "Wrong":
      case "Wrong Answer":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      case "Error":
      case "Runtime Error":
        return "text-orange-400 bg-orange-400/10 border-orange-400/30";
      case "Time Limit Exceeded":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
      case "Compilation Error":
        return "text-purple-400 bg-purple-400/10 border-purple-400/30";
      default:
        return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    }
  };

  const formatRuntime = (runtime) => {
    if (runtime === null || runtime === undefined) return "N/A";
    return runtime < 1000
      ? `${runtime} ms`
      : `${(runtime / 1000).toFixed(2)} s`;
  };

  const formatMemory = (memory) => {
    if (memory === null || memory === undefined) return "N/A";
    return memory > 1024 ? `${(memory / 1024).toFixed(1)} MB` : `${memory} KB`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full bg-black text-white">
      {/* Header */}

      {/* Main Content */}
      <div className="flex min-h-96 ">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-slate-800 flex flex-col bg-slate-950/30">
          {/* Left Tabs */}
          <div className="bg-slate-900/30 border-b border-slate-800">
            <div className="flex">
              {[
                { key: "description", label: "Description", icon: "📝" },
                { key: "solutions", label: "Solutions", icon: "💡" },
                { key: "editorial", label: "Editorial", icon: "📖" },
                { key: "submissions", label: "Submissions", icon: "📊" },
                { key: "chatAI", label: "Chat AI", icon: "🤖" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveLeftTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center space-x-2 ${
                    activeLeftTab === tab.key
                      ? "border-amber-500 text-amber-400 bg-amber-500/5"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeLeftTab === "description" && (
              <div className="p-6 space-y-6">
                {problem ? (
                  <>
                    <div className="flex items-center space-x-4">
                      <h1 className="text-xl font-bold text-white">
                        {problem?.title || `Problem ${problemId}`}
                      </h1>
                      {problem?.difficulty && (
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyBadgeColor(
                            problem.difficulty
                          )}`}
                        >
                          {problem.difficulty}
                        </span>
                      )}
                    </div>

                    {problem.visibleTestcase &&
                      problem.visibleTestcase.length > 0 && (
                        <div>
                          <h3 className="text-lg font-bold mb-4 text-white flex items-center">
                            <span className="mr-2">✨</span>
                            Examples
                          </h3>
                          <div className="space-y-4">
                            {problem.visibleTestcase.map((testcase, index) => (
                              <div
                                key={index}
                                className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-200"
                              >
                                <div className="mb-3">
                                  <span className="text-sm font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                                    Example {index + 1}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <span className="text-sm font-semibold text-slate-300 mb-1 block">
                                      Input:
                                    </span>
                                    <pre className="bg-slate-950 p-3 rounded-lg text-sm overflow-x-auto text-emerald-400 border border-slate-800">
                                      {testcase.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-slate-300 mb-1 block">
                                      Output:
                                    </span>
                                    <pre className="bg-slate-950 p-3 rounded-lg text-sm overflow-x-auto text-blue-400 border border-slate-800">
                                      {testcase.output}
                                    </pre>
                                  </div>
                                  {testcase.explanation && (
                                    <div>
                                      <span className="text-sm font-semibold text-slate-300 mb-1 block">
                                        Explanation:
                                      </span>
                                      <p className="text-slate-300 text-sm bg-slate-800/30 p-3 rounded-lg">
                                        {testcase.explanation}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">❌</div>
                    <div className="text-slate-400 text-lg">
                      Problem not found
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === "solutions" && (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <span className="mr-2">💡</span>
                    Reference Solutions
                  </h3>
                  <span className="text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                    {problem?.referenceSolution?.length || 0} solution
                    {(problem?.referenceSolution?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>

                {initialLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-700 border-t-amber-500"></div>
                  </div>
                ) : problem?.referenceSolution?.length > 0 ? (
                  <div className="space-y-4">
                    {problem.referenceSolution.map((solution, index) => (
                      <div
                        key={index}
                        className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-200 group"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">
                              {getLanguageIcon(solution.language)}
                            </span>
                            <div>
                              <h4 className="font-semibold text-2xl mb-2 text-white">
                                {solution.language}
                              </h4>
                              <p className="textarea-xs text-slate-400">
                                Solution
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Reference
                            </span>
                            <button
                              onClick={() => {
                                setCode(solution.completeCode);
                                const langMap = {
                                  cpp: "c++",
                                  python: "python",
                                  java: "java",
                                  javascript: "javascript",
                                };
                                setSelectedLanguage(
                                  langMap[solution.language] || "cpp"
                                );
                                setActiveRightTab("code");
                              }}
                              className="opacity-0 group-hover:opacity-100 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                            >
                              Load
                            </button>
                          </div>
                        </div>

                        <details className="group">
                          <summary className="cursor-pointer text-xs text-slate-400 hover:text-amber-400 transition-colors duration-200 flex items-center">
                            <span className="mr-3"></span>
                            View Code
                            <svg
                              className="w-4 h-4 ml-2 transform group-open:rotate-90 transition-transform duration-200"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </summary>
                          <div className="mt-3">
                            <pre className="bg-slate-950 p-4 rounded-lg text-sm overflow-x-auto text-slate-300 border border-slate-800 max-h-64">
                              <code>{solution.completeCode}</code>
                            </pre>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💡</div>
                    <div className="text-slate-400 text-lg mb-2">
                      No reference solutions available
                    </div>
                    <div className="text-slate-500 text-sm">
                      Reference solutions will appear here when available.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === "editorial" && (
              <div className="p-6 text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <div className="text-slate-400 text-lg mb-2">
                  Editorial Coming Soon
                </div>
                <div className="text-slate-500 text-sm">
                  Editorial content will be available after solving the problem.
                </div>
              </div>
            )}

            {activeLeftTab === "submissions" && (
              <div className="p-8">
                {/* Header Section */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6 text-indigo-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                          Submission History
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          Track your coding journey and progress
                        </p>
                      </div>
                    </div>

                    {submissions.length > 0 && (
                      <div className="bg-gray-800/50 rounded-xl px-4 py-2 border border-gray-700/50">
                        <div className="text-xs text-gray-400 uppercase tracking-wide">
                          Total Submissions
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {submissions.length}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content */}
                {!submissions.length ? (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-16">
                    <div className="text-center">
                      <div className="mb-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-12 h-12 text-indigo-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                            />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-3">
                        No Submissions Yet
                      </h3>
                      <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                        Start solving problems to see your submission history
                        here. Your journey begins with a single submission!
                      </p>
                      <div className="mt-8">
                        <div className="inline-flex items-center space-x-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-xl border border-indigo-500/20">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span className="text-sm font-medium">
                            Ready to code?
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700/30 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gradient-to-r from-gray-800/80 to-gray-700/50 border-b border-gray-700/50">
                      <div className="grid grid-cols-6 gap-4 p-6">
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-indigo-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Status
                        </div>
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-purple-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                            />
                          </svg>
                          Language
                        </div>
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Runtime
                        </div>
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-blue-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                          </svg>
                          Memory
                        </div>
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                            />
                          </svg>
                          Tests Passed
                        </div>
                        <div className="text-gray-300 font-semibold text-sm uppercase tracking-wide flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-pink-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Submitted
                        </div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-700/30">
                      {submissions.map((submission, index) => (
                        <div
                          key={submission._id}
                          className="grid grid-cols-6 gap-4 p-6 hover:bg-gray-800/40 transition-all duration-300 group"
                        >
                          {/* Status */}
                          <div className="flex items-center">
                            <div
                              className={`inline-flex  items-center space-x-2 px-3 py-2 rounded-xl border font-medium text-xs ${getStatusStyles(
                                submission.status
                              )}`}
                            >
                              {submission.status === "Accepted" ? (
                                <svg
                                  className="w-2 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : submission.status === "Wrong" ||
                                submission.status === "Wrong Answer" ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                              ) : submission.status === "Error" ||
                                submission.status === "Runtime Error" ? (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              )}
                              <span className="font-semibold">
                                {submission.status}
                              </span>
                            </div>
                          </div>

                          {/* Language */}
                          <div className="flex items-center">
                            <div className="flex items-center ml-4 bg-gray-700/30 px-2 py-2 rounded-xl border border-gray-600/30 group-hover:border-gray-500/50 transition-all duration-300">
                              <span className="text-lg ">
                                {getLanguageIcon(submission.language)}
                              </span>
                              <span className="text-gray-200 font-medium text-sm">
                                {submission.language}
                              </span>
                            </div>
                          </div>

                          {/* Runtime */}
                          <div className="flex items-center">
                            <div className="bg-yellow-400/10 text-yellow-300 px-3 py-2 rounded-xl border border-yellow-400/20 font-mono text-sm font-semibold">
                              {formatRuntime(submission.runtime)}
                            </div>
                          </div>

                          {/* Memory */}
                          <div className="flex items-center">
                            <div className="bg-blue-400/10 text-blue-300 px-3 py-2 rounded-xl border border-blue-400/20 font-mono text-sm font-semibold">
                              {formatMemory(submission.memory)}
                            </div>
                          </div>

                          {/* Tests Passed */}
                          <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                              <div className="bg-green-400/10 text-green-300 px-3 py-2 rounded-xl border border-green-400/20 font-semibold text-sm">
                                {submission.testCasesPassed || "0/0"}
                              </div>
                              {submission.status === "Accepted" && (
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </div>

                          {/* Submitted At */}
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="text-gray-300 font-medium text-sm">
                                {formatDate(submission.createdAt)}
                              </div>
                              <div className="text-gray-500 text-xs font-mono">
                                {new Date(
                                  submission.createdAt
                                ).toLocaleTimeString()}
                              </div>
                            </div>

                            {/* Action Button */}
                            <div className=" group inline-block">
                              {/* Eye Button */}
                              <button
                                className="opacity-0  
    p-2 rounded-lg"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                              </button>

                              {/* Hover Code Preview */}
                              <div
                                className="absolute left-0 mt-2 hidden group-hover:block z-50 
    bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg 
    max-w-md w-[400px] overflow-x-auto"
                              >
                                <pre className="text-sm">
                                  <code>{submission.code}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Stats Footer */}
                    {submissions.length > 0 && (
                      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/30 border-t border-gray-700/30 p-6">
                        <div className="grid grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-400 mb-1">
                              {
                                submissions.filter(
                                  (s) => s.status === "Accepted"
                                ).length
                              }
                            </div>
                            <div className="text-gray-400 text-sm">
                              Accepted
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400 mb-1">
                              {submissions.length > 0
                                ? Math.round(
                                    (submissions.filter(
                                      (s) => s.status === "Accepted"
                                    ).length /
                                      submissions.length) *
                                      100
                                  )
                                : 0}
                              %
                            </div>
                            <div className="text-gray-400 text-sm">
                              Success Rate
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                              {submissions.length > 0
                                ? Math.round(
                                    submissions.reduce(
                                      (acc, s) => acc + (s.runtime || 0),
                                      0
                                    ) / submissions.length
                                  )
                                : 0}
                            </div>
                            <div className="text-gray-400 text-sm">
                              Avg Runtime (ms)
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeLeftTab === "chatAI" && (
              <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
                {/* Header Section */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-xl"></div>
                  </div>
                  <div className="">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      AI Chat Assistant
                    </h2>

                    <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>Ready to help with your coding questions</span>
                    </div>
                  </div>
                </div>

                {/* Chat Component Container */}
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-5xl h-full min-h-[600px] relative">
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-blue-900/10 rounded-2xl"></div>
                    <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>

                    {/* Chat Component */}
                    <div className="relative z-10 h-full">
                      <ChatAI problem={problem} />
                    </div>
                  </div>
                </div>

                {/* Footer */}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col bg-slate-950/30">
          {/* Right Tabs */}
          <div className="bg-slate-900/30 border-b border-slate-800">
            <div className="flex">
              {[
                { key: "code", label: "Code", icon: "" },
                { key: "testcase", label: "Test Cases", icon: "" },
                { key: "result", label: "Result", icon: "" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveRightTab(tab.key)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 flex items-center space-x-2 ${
                    activeRightTab === tab.key
                      ? "border-amber-500 text-amber-400 bg-amber-500/5"
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.key === "testcase" && runResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        runResult.success ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></span>
                  )}
                  {tab.key === "result" && submitResult && (
                    <span
                      className={`w-2 h-2 rounded-full ${
                        submitResult.accepted ? "bg-emerald-500" : "bg-rose-500"
                      }`}
                    ></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 flex flex-col">
            {activeRightTab === "code" && (
              <>
                {/* Language Selector and Action Buttons */}
                <div className="bg-slate-900/30 px-4 py-3 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="bg-slate-800 text-white border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="cpp"> C++</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="javascript">JavaScript</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleRun}
                      disabled={runLoading || submitLoading}
                      className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      {runLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-white"></div>
                          <span>Running...</span>
                        </>
                      ) : (
                        <>
                          <span>Run</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSubmitCode}
                      disabled={submitLoading || runLoading}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-300 border-t-white"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 bg-slate-950">
                  <Editor
                    height="100%"
                    language={getLanguageForMonaco(selectedLanguage)}
                    value={code}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                      fontFamily:
                        "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      lineHeight: 1.6,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: true,
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </>
            )}

            {activeRightTab === "testcase" && (
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                  <span className="mr-2">🧪</span>
                  Test Case Results
                </h3>
                {runResult ? (
                  <div className="space-y-6">
                    <div
                      className={`p-6 rounded-xl border-l-4 ${
                        runResult.success
                          ? "bg-emerald-900/20 border-emerald-500"
                          : "bg-rose-900/20 border-rose-500"
                      }`}
                    >
                      <div className="flex items-center mb-4">
                        <span
                          className={`w-4 h-4 rounded-full mr-3 ${
                            runResult.success ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        ></span>
                        <span className="text-lg font-bold text-white">
                          {runResult.success
                            ? "✅ All Tests Passed"
                            : "❌ Some Tests Failed"}
                        </span>
                      </div>
                      {runResult.runTime !== undefined && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-400 mb-1">
                              Runtime
                            </div>
                            <div className="text-xl font-bold text-white">
                              {runResult.runTime.toFixed(3)}ms
                            </div>
                          </div>
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-400 mb-1">
                              Memory
                            </div>
                            <div className="text-xl font-bold text-white">
                              {runResult.memory >= 1024
                                ? `${(runResult.memory / 1024).toFixed(2)}MB`
                                : `${runResult.memory}KB`}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="bg-slate-900/50 p-4 rounded-lg mt-4">
                        <div className="text-sm text-slate-400 mb-1">
                          Test Cases
                        </div>
                        <div className="text-lg font-bold text-white">
                          {runResult.passedTestCases || 0}/
                          {runResult.totalTestCases || 0} passed
                        </div>
                      </div>
                    </div>

                    {runResult.testCases && runResult.testCases.length > 0 ? (
                      <div className="space-y-4">
                        {runResult.testCases.map((testCase, index) => (
                          <div
                            key={index}
                            className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 hover:border-slate-700 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-white">
                                Test Case {index + 1}
                              </h4>
                              <div className="flex items-center">
                                <span
                                  className={`w-3 h-3 rounded-full mr-2 ${
                                    testCase.passed
                                      ? "bg-emerald-500"
                                      : "bg-rose-500"
                                  }`}
                                ></span>
                                <span
                                  className={`text-sm font-semibold px-2 py-1 rounded-full ${
                                    testCase.passed
                                      ? "bg-emerald-500/10 text-emerald-400"
                                      : "bg-rose-500/10 text-rose-400"
                                  }`}
                                >
                                  {testCase.passed ? "Passed" : "Failed"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="text-slate-400 font-medium">
                                  Input:
                                </span>
                                <pre className="bg-slate-950 p-3 rounded-lg mt-1 overflow-x-auto text-emerald-400 border border-slate-800">
                                  {testCase.input}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">
                                  Expected:
                                </span>
                                <pre className="bg-slate-950 p-3 rounded-lg mt-1 overflow-x-auto text-blue-400 border border-slate-800">
                                  {testCase.expectedOutput}
                                </pre>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium">
                                  Your Output:
                                </span>
                                <pre
                                  className={`p-3 rounded-lg mt-1 overflow-x-auto border ${
                                    testCase.passed
                                      ? "bg-slate-950 text-emerald-400 border-slate-800"
                                      : "bg-rose-900/20 text-rose-400 border-rose-500/30"
                                  }`}
                                >
                                  {testCase.output}
                                </pre>
                              </div>
                              {testCase.error && (
                                <div>
                                  <span className="text-slate-400 font-medium">
                                    Error:
                                  </span>
                                  <pre className="bg-rose-900/20 p-3 rounded-lg mt-1 overflow-x-auto text-rose-400 border border-rose-500/30">
                                    {testCase.error}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="text-4xl mb-3">📋</div>
                        <div className="text-slate-400">
                          No test cases available
                        </div>
                      </div>
                    )}

                    {/* Summary */}
                    {runResult.testCases && (
                      <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                        <h4 className="font-bold text-white mb-3 flex items-center">
                          <span className="mr-2">📊</span>
                          Summary
                        </h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-slate-400">Total</div>
                            <div className="text-lg font-bold text-white">
                              {runResult.testCases.length}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400">Passed</div>
                            <div className="text-lg font-bold text-emerald-400">
                              {
                                runResult.testCases.filter((tc) => tc.passed)
                                  .length
                              }
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400">Failed</div>
                            <div className="text-lg font-bold text-rose-400">
                              {
                                runResult.testCases.filter((tc) => !tc.passed)
                                  .length
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🧪</div>
                    <div className="text-slate-400 text-lg mb-2">
                      Ready to Test
                    </div>
                    <div className="text-slate-500 text-sm">
                      Run your code to see test case results here.
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === "result" && (
              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-white flex items-center">
                  <span className="mr-2">🎯</span>
                  Submission Results
                </h3>
                {submitResult ? (
                  <div className="space-y-6">
                    <div
                      className={`p-8 rounded-xl border-l-4 ${
                        submitResult.accepted
                          ? "bg-emerald-900/20 border-emerald-500"
                          : "bg-rose-900/20 border-rose-500"
                      }`}
                    >
                      <div className="flex items-center mb-6">
                        <span
                          className={`w-5 h-5 rounded-full mr-4 ${
                            submitResult.accepted
                              ? "bg-emerald-500"
                              : "bg-rose-500"
                          }`}
                        ></span>
                        <span className="text-2xl font-bold text-white">
                          {submitResult.status ||
                            (submitResult.accepted
                              ? "✅ Accepted"
                              : "❌ Wrong Answer")}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {submitResult.runTime !== undefined && (
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-400 mb-1">
                              Runtime
                            </div>
                            <div className="text-xl font-bold text-white">
                              {submitResult.runTime.toFixed(3)}ms
                            </div>
                          </div>
                        )}
                        {submitResult.memory !== undefined && (
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-400 mb-1">
                              Memory
                            </div>
                            <div className="text-xl font-bold text-white">
                              {submitResult.memory >= 1024
                                ? `${(submitResult.memory / 1024).toFixed(2)}MB`
                                : `${submitResult.memory}KB`}
                            </div>
                          </div>
                        )}
                      </div>

                      {(submitResult.totalTestCases !== undefined ||
                        submitResult.passedTestCases !== undefined) && (
                        <div className="mt-4">
                          <div className="bg-slate-900/50 p-4 rounded-lg">
                            <div className="text-sm text-slate-400 mb-1">
                              Test Cases
                            </div>
                            <div className="text-xl font-bold text-white">
                              {submitResult.passedTestCases || 0} /{" "}
                              {submitResult.totalTestCases || 0} passed
                            </div>
                          </div>
                        </div>
                      )}

                      {submitResult.errorMessage && (
                        <div className="mt-6">
                          <div className="text-sm text-slate-400 mb-2 font-medium">
                            Error:
                          </div>
                          <pre className="bg-rose-900/20 p-4 rounded-lg overflow-x-auto text-rose-400 border border-rose-500/30">
                            {submitResult.errorMessage}
                          </pre>
                        </div>
                      )}

                      {submitResult.message && (
                        <div className="mt-6 p-4 bg-slate-800/30 rounded-lg">
                          <p className="text-slate-300">
                            {submitResult.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {!submitResult.accepted && submitResult.failedTestCase && (
                      <div className="bg-slate-900/50 rounded-xl p-5 border border-rose-500/30">
                        <h4 className="font-bold mb-4 text-rose-400 flex items-center">
                          <span className="mr-2">❌</span>
                          Failed Test Case
                        </h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-slate-400 font-medium">
                              Input:
                            </span>
                            <pre className="bg-slate-950 p-3 rounded-lg mt-1 overflow-x-auto text-emerald-400 border border-slate-800">
                              {submitResult.failedTestCase.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">
                              Expected:
                            </span>
                            <pre className="bg-slate-950 p-3 rounded-lg mt-1 overflow-x-auto text-blue-400 border border-slate-800">
                              {submitResult.failedTestCase.expected}
                            </pre>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium">
                              Your Output:
                            </span>
                            <pre className="bg-rose-900/20 p-3 rounded-lg mt-1 overflow-x-auto text-rose-400 border border-rose-500/30">
                              {submitResult.failedTestCase.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Detailed submission info */}
                    <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-800">
                      <h4 className="font-bold mb-4 text-white flex items-center">
                        <span className="mr-2">📋</span>
                        Submission Details
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Status:</span>
                            <span
                              className={
                                submitResult.accepted
                                  ? "text-emerald-400"
                                  : "text-rose-400"
                              }
                            >
                              {submitResult.status ||
                                (submitResult.accepted
                                  ? "Accepted"
                                  : "Rejected")}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Runtime:</span>
                            <span className="text-white">
                              {submitResult.runTime !== undefined
                                ? `${submitResult.runTime}ms`
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Memory:</span>
                            <span className="text-white">
                              {submitResult.memory !== undefined
                                ? `${submitResult.memory}KB`
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Tests:</span>
                            <span className="text-white">
                              {submitResult.totalTestCases ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Passed:</span>
                            <span className="text-emerald-400">
                              {submitResult.passedTestCases ?? "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Language:</span>
                            <span className="text-white flex items-center">
                              <span className="mr-1">
                                {getLanguageIcon(selectedLanguage)}
                              </span>
                              {selectedLanguage.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🎯</div>
                    <div className="text-slate-400 text-lg mb-2">
                      Ready to Submit
                    </div>
                    <div className="text-slate-500 text-sm">
                      Submit your code to see results here.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(runLoading || submitLoading) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-8 flex flex-col items-center space-y-4 border border-slate-800">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-amber-500"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-amber-300 animate-ping"></div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-lg">
                {runLoading ? "Running Tests..." : "Submitting Solution..."}
              </div>
              <div className="text-slate-400 text-sm">
                {runLoading
                  ? "Executing your code against test cases"
                  : "Evaluating your submission"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemPage;
