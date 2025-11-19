import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";

export default function ResumeResult() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get result from localStorage
    const storedResult = localStorage.getItem("resumeResult");
    if (storedResult) {
      setResult(JSON.parse(storedResult));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-600 animate-pulse">
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No results found
          </h1>
          <button
            onClick={() => navigate("/resume")}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all"
          >
            Upload Resume
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/85 backdrop-blur-xl border-b border-gray-200/70 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
                  />
                </svg>
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                CodeArena
              </span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/resume")}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Upload New
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.[0] || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Resume Analysis Complete
          </h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Here's your personalized resume evaluation and recommendations
          </p>
        </div>

        {/* ATS Score */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                ATS Score
              </h2>
              <p className="text-gray-600 mb-6">
                This score indicates how well your resume is optimized for
                Applicant Tracking Systems.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Target Score: 80%+</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg
                  className="w-full h-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    strokeDasharray={`${result.ats.atsScore * 2.827} 282.7`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {result.ats.atsScore}%
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Score</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}


        {/* Recommendations */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.90.847-2.581 1.138-3.85.676-.28-.09-.569-.146-.853-.145a.758.758 0 00-.986.74c.166.895-.895 1.946-1.743 1.946a.758.758 0 01-.75-.75c0-.846 1.05-1.91 1.945-1.744.1.276.145.565.146.854.146 1.27-.13 2.96-.676 3.85-1.025 1.171-2.687 1.171-3.712 0-.333-.29-.626-.701-.786-1.129a.75.75 0 00-1.456.35c.39 1.051 1.05 1.918 1.84 2.585 1.905 1.671 4.73 1.671 6.635 0 1.79-1.667 2.45-4.492.95-6.897l1.415 1.414c.53.53 1.388.529 1.914-.001a1.35 1.35 0 000-1.914l-1.414-1.414.353-.354a.75.75 0 10-1.06-1.06l-2.829 2.829a.75.75 0 101.06 1.06l.354-.353a1.35 1.35 0 011.914 0l1.414 1.414a1.35 1.35 0 01-.001 1.914Z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Recommendations</h3>
          </div>
          <ul className="space-y-4">
            {result.recommendations && result.recommendations.length > 0 ? (
              result.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                      stroke="currentColor"
                      className="w-4 h-4 text-white"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{rec}</p>
                </li>
              ))
            ) : (
              <p className="text-gray-500">No recommendations available</p>
            )}
          </ul>
        </div>

        {/* Summary Improvement */}
        {result.summaryImprovement && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-200 p-8 sm:p-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Summary Improvements
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {result.summaryImprovement}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <button
            onClick={() => navigate("/resume")}
            className="flex-1 py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33A3 3 0 0 1 19.5 19.5A4.5 4.5 0 0 1 6.75 19.5Z"
              />
            </svg>
            Upload Another Resume
          </button>
          <button
            onClick={() => navigate("/home")}
            className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
