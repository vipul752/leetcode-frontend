import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loginUser } from "../authSlice";
import { useEffect, useState } from "react";

// ✅ Login schema (no firstName needed)
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password should be at least 8 characters"),
});

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black text-gray-200 relative">
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-r from-purple-500/20 to-indigo-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center items-center mb-6">
          <button className="px-8 py-4 rounded-lg text-2xl text-white font-bold">
            Leetcode 🚀
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <input
            type="email"
            {...register("email")}
            placeholder="john@example.com"
            className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 outline-none"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter your password"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:border-indigo-500 outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 focus:outline-none"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 px-4 text-black font-semibold bg-white hover:bg-gray-200 rounded-lg transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
