import { Routes, Route, Navigate } from "react-router";
import { lazy, Suspense } from "react";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// Eagerly load auth-critical pages (kept on initial bundle)
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import IndividualPost from "./components/IndividualPost";
import CreatePost from "./components/CreatePost";

// Lazy load other pages for faster initial load
const HomePage = lazy(() => import("./pages/HomePage"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const ProblemPage = lazy(() => import("./pages/ProblemPage"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminPanelDelete = lazy(() => import("./pages/AdminPanelDelete"));
const AdminPanelUpdate = lazy(() => import("./pages/AdminPanelUpdate"));
const AdminVideo = lazy(() => import("./pages/AdminVideo"));
const Profile = lazy(() => import("./components/Profile"));
const ContestPage = lazy(() => import("./pages/ContestPage"));
const ContestProblems = lazy(() => import("./pages/ContestProblemPage"));
const Contests = lazy(() => import("./pages/Contest"));
const MyContest = lazy(() => import("./pages/MyContest"));
const ChallengePage = lazy(() => import("./pages/Challenge"));
const AiInterviewVideo = lazy(() => import("./pages/AiInterview"));
const ResumeUpload = lazy(() => import("./pages/ResumeUpload"));
const ResumeResult = lazy(() => import("./pages/ResumeResult"));
const Social = lazy(() => import("./pages/Social"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-black text-gray-200">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-3 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-gray-400 animate-pulse">Loading...</p>
    </div>
  </div>
);

function App() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // Set a timeout to force auth check to complete after 15 seconds
    // This prevents infinite loading if the backend is not responding
    const timeoutId = setTimeout(() => {
      dispatch(checkAuth()).catch(() => {
        console.warn("Auth check timeout or failed");
      });
    }, 500); // Start auth check immediately, but with timeout fallback

    // If auth is still loading after 15 seconds, consider it failed
    const fallbackTimeoutId = setTimeout(() => {
      console.warn("Auth check taking too long, proceeding without auth");
    }, 15000);

    // Initial auth check dispatch
    dispatch(checkAuth()).catch(() => {
      console.warn("Auth check failed");
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(fallbackTimeoutId);
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg text-gray-400 animate-pulse">Loading...</p>
          <p className="mt-2 text-xs text-gray-500">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-gray-200">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/home"
          element={
            isAuthenticated ? (
              <Suspense fallback={<LoadingFallback />}>
                <HomePage />
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/post/create" element={<CreatePost />} />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/home" /> : <Login />}
        />
        <Route
          path="/reset-password/:token"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ResetPassword />
            </Suspense>
          }
        />
        <Route
          path="/signup"
          element={isAuthenticated ? <Navigate to="/home" /> : <SignUp />}
        />
        <Route
          path="/admin"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Admin />
            </Suspense>
          }
        />
        <Route
          path="/admin/create"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanel />
            </Suspense>
          }
        />
        <Route
          path="/problem/:problemId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ProblemPage />
            </Suspense>
          }
        />
        <Route
          path="/admin/delete"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanelDelete />
            </Suspense>
          }
        />
        <Route
          path="/admin/update"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminPanelUpdate />
            </Suspense>
          }
        />
        <Route
          path="/admin/video"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <AdminVideo />
            </Suspense>
          }
        />
        <Route
          path="/profile"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Profile />
            </Suspense>
          }
        />
        <Route
          path="/contest"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Contests />
            </Suspense>
          }
        />
        <Route
          path="/contest/:contestId"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContestPage />
            </Suspense>
          }
        />
        <Route
          path="/contest/:contestId/problems"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ContestProblems />
            </Suspense>
          }
        />
        <Route
          path="my-contests"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <MyContest />
            </Suspense>
          }
        />
        <Route
          path="/challenge"
          element={
            isAuthenticated ? (
              <Suspense fallback={<LoadingFallback />}>
                {user?._id && <ChallengePage userId={user._id} />}
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/ai-interview"
          element={
            isAuthenticated ? (
              <Suspense fallback={<LoadingFallback />}>
                <AiInterviewVideo />
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume"
          element={
            isAuthenticated ? (
              <Suspense fallback={<LoadingFallback />}>
                <ResumeUpload />
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/resume-result"
          element={
            isAuthenticated ? (
              <Suspense fallback={<LoadingFallback />}>
                <ResumeResult />
              </Suspense>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/social"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Social />
            </Suspense>
          }
        />
        <Route
          path="/userprofile/:username"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <UserProfile />
            </Suspense>
          }
        />

        <Route path="/post/:postId" element={<IndividualPost />} />
      </Routes>
    </div>
  );
}

export default App;
