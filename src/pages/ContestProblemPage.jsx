import { useParams, useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import axiosClient from "../utils/axiosClient";
import Editor from "@monaco-editor/react";
import {
  Code,
  Trophy,
  ChevronLeft,
  Play,
  Send,
  Award,
  CheckCircle2,
  XCircle,
  Target,
  BookOpen,
  History,
  Timer,
} from "lucide-react";

const ContestProblems = () => {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState(null);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("code");
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const editorRef = useRef(null);

  const languageMap = {
    cpp: "c++",
    java: "java",
    javascript: "javascript",
    python: "python",
  };

  // Fetch contest and problems
  useEffect(() => {
    const fetchContestProblems = async () => {
      try {
        const res = await axiosClient.get(`/contest/${contestId}/problems`);
        setContest(res.data);
        setProblems(res.data.problems || []);

        if (res.data.problems && res.data.problems.length > 0) {
          fetchProblemDetails(res.data.problems[0]._id);
        }
      } catch (error) {
        console.error("Error fetching contest problems:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContestProblems();
  }, [contestId]);

  // Fetch specific problem details
  const fetchProblemDetails = async (problemId) => {
    try {
      const response = await axiosClient.get(
        `/problem/getProblem/${problemId}`
      );
      const problemData = response.data;

      const initialCode = problemData.startCode?.find(
        (sc) => sc.language === languageMap[selectedLanguage]
      )?.initialCode;

      setCurrentProblem(problemData);
      setCode(initialCode || "");

      // Fetch submissions for this problem
      fetchSubmissions(problemId);
    } catch (error) {
      console.error("Error fetching problem:", error);
    }
  };

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      const res = await axiosClient.get(
        `/contest/${contestId}/user/submissions`
      );
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  // Change problem
  const handleProblemChange = (index) => {
    setCurrentProblemIndex(index);
    fetchProblemDetails(problems[index]._id);
    setRunResult(null);
    setSubmitResult(null);
    setActiveLeftTab("description");
    setActiveRightTab("code");
  };

  // Update code when language changes
  useEffect(() => {
    if (currentProblem) {
      const initialCode = currentProblem.startCode?.find(
        (sc) => sc.language === languageMap[selectedLanguage]
      )?.initialCode;
      setCode(initialCode || "");
    }
  }, [selectedLanguage, currentProblem]);

  // Countdown timer
  useEffect(() => {
    if (!contest?.endTime) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(contest.endTime);
      const diff = end - now;

      if (diff <= 0) {
        setTimeRemaining("Contest Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [contest]);

  const handleRun = async () => {
    if (!currentProblem) return;
    setRunLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(
        `/submission/run/${currentProblem._id}`,
        {
          code: code,
          language: selectedLanguage,
        }
      );
      setRunResult(response.data);
      setActiveRightTab("testcase");
    } catch (error) {
      setRunResult({
        success: false,
        message: error.response?.data?.message || "Failed to run code.",
      });
      setActiveRightTab("testcase");
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentProblem) return;
    setSubmitLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(
        `/contest/${contestId}/submit/${currentProblem._id}`,
        {
          code: code,
          language: selectedLanguage,
        }
      );
      setSubmitResult(response.data);
      setActiveRightTab("result");
      fetchSubmissions(currentProblem._id);
    } catch (error) {
      setSubmitResult({
        accepted: false,
        message: error.response?.data?.message || "Failed to submit code.",
      });
      setActiveRightTab("result");
    } finally {
      setSubmitLoading(false);
    }
  };

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      Easy: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/30",
      },
      Medium: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/30",
      },
      Hard: {
        bg: "bg-rose-500/10",
        text: "text-rose-400",
        border: "border-rose-500/30",
      },
    };
    return configs[difficulty] || configs.Easy;
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Accepted":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
      case "Wrong Answer":
        return "text-red-400 bg-red-400/10 border-red-400/30";
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#0f0a15] to-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-4 border-purple-900/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-purple-300 text-xl font-semibold">
            Loading Contest...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-black">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/contest/${contestId}`)}
                className="p-2 hover:bg-purple-500/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-purple-400" />
              </button>
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-400" />
                <div>
                  <h1 className="text-lg font-bold text-purple-200">
                    {contest?.contestName}
                  </h1>
                  <p className="text-xs text-purple-400/70">Contest Problems</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {timeRemaining && (
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-lg border border-orange-500/30">
                  <Timer className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span className="font-mono text-sm text-orange-300 font-bold">
                    {timeRemaining}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Problem Navigation */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {problems.map((problem, index) => (
              <button
                key={problem._id}
                onClick={() => handleProblemChange(index)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                  currentProblemIndex === index
                    ? "bg-purple-500/20 border-purple-500/50 text-purple-200"
                    : "bg-purple-950/30 border-purple-800/30 text-purple-400 hover:border-purple-600/50"
                }`}
              >
                <span className="font-semibold">{index + 1}.</span>
                <span className="text-sm">{problem.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Panel */}
        <div className="w-1/2 border-r border-purple-900/30 flex flex-col">
          <div className="bg-purple-950/30 border-b border-purple-900/30">
            <div className="flex">
              {[
                {
                  key: "description",
                  label: "Description",
                  icon: <BookOpen className="w-4 h-4" />,
                },
                {
                  key: "submissions",
                  label: "Submissions",
                  icon: <History className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveLeftTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeLeftTab === tab.key
                      ? "border-purple-500 text-purple-300 bg-purple-500/10"
                      : "border-transparent text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeLeftTab === "description" && currentProblem && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-purple-100">
                    {currentProblem.title}
                  </h2>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                      getDifficultyConfig(currentProblem.difficulty).bg
                    } ${getDifficultyConfig(currentProblem.difficulty).text} ${
                      getDifficultyConfig(currentProblem.difficulty).border
                    }`}
                  >
                    {currentProblem.difficulty}
                  </span>
                </div>

                <div className="bg-purple-950/40 rounded-xl p-5 border border-purple-800/30">
                  <h3 className="text-lg font-bold text-purple-200 mb-3">
                    Problem Description
                  </h3>
                  <p className="text-purple-100/80 leading-relaxed whitespace-pre-wrap">
                    {currentProblem.description}
                  </p>
                </div>

                {currentProblem.visibleTestcase?.map((testcase, index) => (
                  <div
                    key={index}
                    className="bg-purple-950/40 rounded-xl p-5 border border-purple-800/30"
                  >
                    <div className="mb-3">
                      <span className="text-sm font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-lg">
                        Example {index + 1}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-semibold text-purple-300 mb-1 block">
                          Input:
                        </span>
                        <pre className="bg-[#0a0a0f] p-3 rounded-lg text-sm text-emerald-400 border border-purple-800/30">
                          {testcase.input}
                        </pre>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-purple-300 mb-1 block">
                          Output:
                        </span>
                        <pre className="bg-[#0a0a0f] p-3 rounded-lg text-sm text-blue-400 border border-purple-800/30">
                          {testcase.output}
                        </pre>
                      </div>
                      {testcase.explanation && (
                        <div>
                          <span className="text-sm font-semibold text-purple-300 mb-1 block">
                            Explanation:
                          </span>
                          <p className="text-purple-200 text-sm bg-purple-950/30 p-3 rounded-lg">
                            {testcase.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeLeftTab === "submissions" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-purple-200 mb-4">
                  Your Submissions
                </h3>
                {submissions.length === 0 ? (
                  <div className="text-center py-12 bg-purple-950/30 rounded-xl border border-purple-800/30">
                    <History className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                    <p className="text-purple-400">No submissions yet</p>
                  </div>
                ) : (
                  submissions.map((sub) => (
                    <div
                      key={sub._id}
                      className="bg-purple-950/40 rounded-xl p-4 border border-purple-800/30 hover:border-purple-600/50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                        <span className="text-xs text-purple-400">
                          {new Date(sub.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-purple-300">
                        <span>Language: {sub.language}</span>
                        <span>Runtime: {sub.runtime}ms</span>
                        <span>Memory: {sub.memory}KB</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="bg-purple-950/30 border-b border-purple-900/30">
            <div className="flex">
              {[
                {
                  key: "code",
                  label: "Code",
                  icon: <Code className="w-4 h-4" />,
                },
                {
                  key: "testcase",
                  label: "Test Cases",
                  icon: <Target className="w-4 h-4" />,
                },
                {
                  key: "result",
                  label: "Result",
                  icon: <Award className="w-4 h-4" />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveRightTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeRightTab === tab.key
                      ? "border-purple-500 text-purple-300 bg-purple-500/10"
                      : "border-transparent text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            {activeRightTab === "code" && (
              <>
                <div className="bg-purple-950/30 px-4 py-3 flex items-center justify-between border-b border-purple-900/30">
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="bg-purple-900/50 text-purple-200 border border-purple-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="cpp">C++</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="javascript">JavaScript</option>
                  </select>
                  <div className="flex gap-3">
                    <button
                      onClick={handleRun}
                      disabled={runLoading || submitLoading}
                      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      {runLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      <span>{runLoading ? "Running..." : "Run"}</span>
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitLoading || runLoading}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      {submitLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{submitLoading ? "Submitting..." : "Submit"}</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <Editor
                    height="100%"
                    language={languageMap[selectedLanguage] || selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    onMount={(editor) => (editorRef.current = editor)}
                    theme="vs-dark"
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                    }}
                  />
                </div>
              </>
            )}

            {activeRightTab === "testcase" && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xl font-bold text-purple-200 mb-6">
                  Test Results
                </h3>
                {runResult ? (
                  <div className="space-y-4">
                    <div
                      className={`p-6 rounded-xl border-l-4 ${
                        runResult.success
                          ? "bg-emerald-900/20 border-emerald-500"
                          : "bg-rose-900/20 border-rose-500"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {runResult.success ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <XCircle className="w-6 h-6 text-rose-400" />
                        )}
                        <span className="text-xl font-bold text-white">
                          {runResult.success
                            ? "All Tests Passed"
                            : "Some Tests Failed"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="bg-purple-950/50 p-3 rounded-lg">
                          <div className="text-sm text-purple-400">
                            Tests Passed
                          </div>
                          <div className="text-lg font-bold text-white">
                            {runResult.passedTestCases || 0}/
                            {runResult.totalTestCases || 0}
                          </div>
                        </div>
                        <div className="bg-purple-950/50 p-3 rounded-lg">
                          <div className="text-sm text-purple-400">Runtime</div>
                          <div className="text-lg font-bold text-white">
                            {runResult.runTime?.toFixed(2) || 0}ms
                          </div>
                        </div>
                        <div className="bg-purple-950/50 p-3 rounded-lg">
                          <div className="text-sm text-purple-400">Memory</div>
                          <div className="text-lg font-bold text-white">
                            {runResult.memory || 0}KB
                          </div>
                        </div>
                      </div>
                    </div>
                    {runResult.testCases?.map((tc, i) => (
                      <div
                        key={i}
                        className="bg-purple-950/40 rounded-xl p-4 border border-purple-800/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-purple-200">
                            Test Case {i + 1}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              tc.passed
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-rose-500/20 text-rose-400"
                            }`}
                          >
                            {tc.passed ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-purple-400">Input:</span>
                            <pre className="bg-[#0a0a0f] p-2 rounded mt-1 text-emerald-400">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <span className="text-purple-400">Expected:</span>
                            <pre className="bg-[#0a0a0f] p-2 rounded mt-1 text-blue-400">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                          <div>
                            <span className="text-purple-400">
                              Your Output:
                            </span>
                            <pre
                              className={`p-2 rounded mt-1 ${
                                tc.passed
                                  ? "bg-[#0a0a0f] text-emerald-400"
                                  : "bg-rose-900/20 text-rose-400"
                              }`}
                            >
                              {tc.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-400">
                      Run your code to see test results
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeRightTab === "result" && (
              <div className="flex-1 overflow-y-auto p-6">
                <h3 className="text-xl font-bold text-purple-200 mb-6">
                  Submission Result
                </h3>
                {submitResult ? (
                  <div
                    className={`p-8 rounded-xl border-l-4 ${
                      submitResult.accepted
                        ? "bg-emerald-900/20 border-emerald-500"
                        : "bg-rose-900/20 border-rose-500"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      {submitResult.accepted ? (
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-rose-400" />
                      )}
                      <span className="text-2xl font-bold text-white">
                        {submitResult.accepted ? "Accepted" : "Wrong Answer"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-purple-950/50 p-4 rounded-lg">
                        <div className="text-sm text-purple-400">Runtime</div>
                        <div className="text-xl font-bold text-white">
                          {submitResult.runTime?.toFixed(2) || 0}ms
                        </div>
                      </div>
                      <div className="bg-purple-950/50 p-4 rounded-lg">
                        <div className="text-sm text-purple-400">Memory</div>
                        <div className="text-xl font-bold text-white">
                          {submitResult.memory || 0}KB
                        </div>
                      </div>
                      <div className="col-span-2 bg-purple-950/50 p-4 rounded-lg">
                        <div className="text-sm text-purple-400">
                          Test Cases
                        </div>
                        <div className="text-xl font-bold text-white">
                          {submitResult.passedTestCases || 0} /{" "}
                          {submitResult.totalTestCases || 0} passed
                        </div>
                      </div>
                    </div>
                    {submitResult.message && (
                      <div className="mt-6 p-4 bg-purple-950/30 rounded-lg">
                        <p className="text-purple-200">
                          {submitResult.message}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                    <p className="text-purple-400">
                      Submit your code to see results
                    </p>
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
          <div className="bg-purple-950/80 rounded-xl p-8 flex flex-col items-center space-y-4 border border-purple-800/50">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-700 border-t-purple-400"></div>
            </div>
            <div className="text-center">
              <div className="text-white font-semibold text-lg">
                {runLoading ? "Running Tests..." : "Submitting Solution..."}
              </div>
              <div className="text-purple-400 text-sm">
                {runLoading ? "Executing your code" : "Evaluating submission"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestProblems;
